import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockUser, mockReferralCode } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/referrals/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return analytics when user has referral code', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })

    // Mock the database queries
    mockClient.from = vi.fn().mockImplementation((table) => {
      if (table === 'referral_codes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: referralCode, error: null }),
        }
      } else if (table === 'referral_clicks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 15, error: null }),
        }
      } else if (table === 'referral_registrations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      code: 'TESTCODE',
      totalClicks: 15,
      totalSignups: 5,
      totalConversion: (5 / 15) * 100,
    })
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return zeros when user has no referral code', async () => {
    const user = mockUser()

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'No rows found' } }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      totalClicks: 0,
      totalSignups: 0,
      totalConversion: 0,
    })
  })

  it('should handle null counts and return zeros', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })

    mockClient.from = vi.fn().mockImplementation((table) => {
      if (table === 'referral_codes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: referralCode, error: null }),
        }
      } else if (table === 'referral_clicks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        }
      } else if (table === 'referral_registrations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      code: 'TESTCODE',
      totalClicks: 0,
      totalSignups: 0,
      totalConversion: 0,
    })
  })

  it('should calculate conversion correctly with zero clicks', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })

    mockClient.from = vi.fn().mockImplementation((table) => {
      if (table === 'referral_codes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: referralCode, error: null }),
        }
      } else if (table === 'referral_clicks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }
      } else if (table === 'referral_registrations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalConversion).toBe(0) // Should be 0 when clicks are 0
  })

  it('should calculate 100% conversion rate', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })

    mockClient.from = vi.fn().mockImplementation((table) => {
      if (table === 'referral_codes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: referralCode, error: null }),
        }
      } else if (table === 'referral_clicks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
        }
      } else if (table === 'referral_registrations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalConversion).toBe(100)
  })
})
