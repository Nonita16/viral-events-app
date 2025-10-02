import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { POST } = await import('./route')

describe('POST /api/referrals/track-click', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should track click when valid code and anonymous user', async () => {
    const user = mockUser({ is_anonymous: true })
    const referralCode = { id: 'ref-123' }

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Find referral code
        { data: null, error: null },           // Check existing click
        { data: null, error: null },           // Insert click
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Click tracked successfully' })
  })

  it('should not track click for fully registered users', async () => {
    const user = mockUser({ is_anonymous: false })
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Click not tracked - user already registered' })
  })

  it('should return 400 when code is missing', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'code is required' })
  })

  it('should return 400 when no user session and no anonUserId provided', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Unable to track click - no user identifier')
  })

  it('should accept anonUserId when no session exists', async () => {
    const mockClient = createMockSupabaseClient({
      user: null,
      multipleQueries: [
        { data: { id: 'ref-123' }, error: null },  // Find referral code
        { data: null, error: null },                // Check existing click
        { data: null, error: null },                // Insert click
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({
        code: 'TESTCODE',
        anonUserId: '123e4567-e89b-12d3-a456-426614174000'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Click tracked successfully' })
  })

  it('should return 400 when anonUserId has invalid UUID format', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({
        code: 'TESTCODE',
        anonUserId: 'invalid-uuid-format'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid user identifier format')
  })

  it('should return 404 when referral code not found', async () => {
    const user = mockUser({ is_anonymous: true })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: null, error: { message: 'Not found' } },
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'INVALID' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Referral code not found')
  })

  it('should return 404 when referral code is null', async () => {
    const user = mockUser({ is_anonymous: true })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: null, error: null },
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'INVALID' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Referral code not found' })
  })

  it('should not double-count when click already tracked', async () => {
    const user = mockUser({ is_anonymous: true })
    const referralCode = { id: 'ref-123' }
    const existingClick = { id: 'click-123' }

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },
        { data: existingClick, error: null },
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ message: 'Click already tracked' })
  })

  it('should return 500 when insert fails', async () => {
    const user = mockUser({ is_anonymous: true })
    const referralCode = { id: 'ref-123' }

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },
        { data: null, error: null },
        { data: null, error: { message: 'Insert failed' } },
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to track click')
  })

  it('should handle unexpected errors with try-catch', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create a client that throws an error during JSON parsing
    mockCreateClient.mockRejectedValue(new Error('Unexpected error'))

    const request = new Request('http://localhost/api/referrals/track-click', {
      method: 'POST',
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(consoleErrorSpy).toHaveBeenCalledWith('Track click error:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })
})
