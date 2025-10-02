import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockReferralCode, mockUser } from '@/__tests__/helpers'
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

  it('should register user when authenticated', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: 'other-user' })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Validate referral code
        { data: null, error: null },           // Registration insert successful
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
      message: 'Successfully registered via referral code'
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
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: 'other-user' })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Valid referral code
        { data: null, error: { message: 'Already registered', code: '23505' } },  // Unique constraint violation
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/TESTCODE/register', {
      method: 'POST',
    })
    const params = Promise.resolve({ code: 'TESTCODE' })
    const response = await POST(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      message: 'Already registered via this referral code'
    })
  })

  it('should return 500 when registration insert fails with non-unique error', async () => {
    const user = mockUser()
    const referralCode = mockReferralCode({ code: 'TESTCODE', created_by: 'other-user' })

    const mockClient = createMockSupabaseClient({
      user,
      multipleQueries: [
        { data: referralCode, error: null },  // Valid referral code
        { data: null, error: { message: 'Database error', code: 'SOME_ERROR' } },  // Non-unique constraint error
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
    expect(data).toEqual({ error: 'Database error' })
  })
})
