import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockUser, mockEvent } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/referrals/analytics/[eventId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return analytics when user is event creator', async () => {
    const user = mockUser()
    const event = mockEvent({ id: 'event-123', created_by: user.id })
    const referralCodes = [
      { id: 'ref-1', code: 'CODE1', created_at: '2025-01-01' },
      { id: 'ref-2', code: 'CODE2', created_at: '2025-01-02' },
    ]

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: event, error: null },           // Event ownership check
        { data: referralCodes, error: null },   // Referral codes
      ]
    })

    // Mock the count queries
    mockClient.from = vi.fn().mockImplementation((table) => {
      if (table === 'events') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: event, error: null }),
        }
      } else if (table === 'referral_codes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: referralCodes, error: null }),
        }
      } else if (table === 'referral_clicks') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
        }
      } else if (table === 'referral_registrations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/analytics/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('analytics')
    expect(data).toHaveProperty('totalClicks')
    expect(data).toHaveProperty('totalSignups')
    expect(data).toHaveProperty('totalConversion')
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/analytics/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 403 when user is not event creator', async () => {
    const user = mockUser()
    const event = mockEvent({ id: 'event-123', created_by: 'different-user' })

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: event, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/analytics/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 403 when event does not exist', async () => {
    const user = mockUser()

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/analytics/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should handle null counts and calculate conversion correctly', async () => {
    const user = mockUser()
    const event = mockEvent({ id: 'event-123', created_by: user.id })
    const referralCodes = [
      { id: 'ref-1', code: 'CODE1', created_at: '2025-01-01' },
    ]

    const mockClient = createMockSupabaseClient({ user })

    mockClient.from = vi.fn().mockImplementation((table) => {
      if (table === 'events') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: event, error: null }),
        }
      } else if (table === 'referral_codes') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: referralCodes, error: null }),
        }
      } else if (table === 'referral_clicks') {
        // Return null count
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        }
      } else if (table === 'referral_registrations') {
        // Return null count
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/analytics/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.analytics[0].clicks).toBe(0)
    expect(data.analytics[0].signups).toBe(0)
    expect(data.analytics[0].conversion).toBe(0)
    expect(data.totalConversion).toBe(0)
  })

  it('should return 500 when fetching referral codes fails', async () => {
    const user = mockUser()
    const event = mockEvent({ id: 'event-123', created_by: user.id })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: event, error: null },
        { data: null, error: { message: 'Database error' } },
      ]
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/analytics/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
