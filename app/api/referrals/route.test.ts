import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockReferralCode, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'TESTCODE12'),
}))

const { POST } = await import('./route')

describe('POST /api/referrals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate referral code when authenticated', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE12', created_by: user.id })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: null, error: null }, // No existing code
        { data: referralCode, error: null }, // Insert successful
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.referralCode).toEqual(referralCode)
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return existing referral code if user already has one', async () => {
    const user = mockUser()
    const existingCode = mockReferralCode({ code: 'EXISTING123', created_by: user.id })

    const mockClient = createMockSupabaseClient({
      user,
      data: existingCode
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.referralCode).toEqual(existingCode)
  })

  it('should return 500 on database error', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: null, error: null }, // No existing code
        { data: null, error: { message: 'Database error', code: 'SOME_ERROR' } }, // Insert fails
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
