import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockReferralCode, mockUser, mockRSVP } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { POST } = await import('./route')

describe('POST /api/referrals/[code]/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should register user and auto-RSVP when authenticated', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', event_id: 'event-123' })
    const rsvp = mockRSVP({ event_id: 'event-123', user_id: user.id, status: 'going' })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Validate referral code
        { data: null, error: null },           // Registration insert (idempotent)
        { data: rsvp, error: null },           // Auto-RSVP
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/TESTCODE/register', {
      method: 'POST',
    })
    const params = Promise.resolve({ code: 'TESTCODE' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({
      success: true,
      rsvp,
      event_id: 'event-123',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/TESTCODE/register', {
      method: 'POST',
    })
    const params = Promise.resolve({ code: 'TESTCODE' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 404 when referral code is invalid', async () => {
    const user = mockUser()

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: null, error: { message: 'Not found' } },  // Invalid referral code
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/INVALID/register', {
      method: 'POST',
    })
    const params = Promise.resolve({ code: 'INVALID' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Invalid referral code' })
  })

  it('should continue when registration already exists (idempotent)', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', event_id: 'event-123' })
    const rsvp = mockRSVP({ event_id: 'event-123', user_id: user.id, status: 'going' })
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Valid referral code
        { data: null, error: { message: 'Already registered' } },  // Registration already exists
        { data: rsvp, error: null },           // Auto-RSVP succeeds
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/TESTCODE/register', {
      method: 'POST',
    })
    const params = Promise.resolve({ code: 'TESTCODE' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({
      success: true,
      rsvp,
      event_id: 'event-123',
    })
    expect(consoleLogSpy).toHaveBeenCalledWith('Registration already exists or error:', 'Already registered')
    consoleLogSpy.mockRestore()
  })

  it('should return 500 when RSVP fails', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', event_id: 'event-123' })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Valid referral code
        { data: null, error: null },           // Registration insert
        { data: null, error: { message: 'RSVP failed' } },  // RSVP error
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/TESTCODE/register', {
      method: 'POST',
    })
    const params = Promise.resolve({ code: 'TESTCODE' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'RSVP failed' })
  })
})
