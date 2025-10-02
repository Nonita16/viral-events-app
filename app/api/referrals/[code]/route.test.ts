import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockReferralCode, mockEvent } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/referrals/[code]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return referral code with event info', async () => {
    const referralCode = { ...mockReferralCode({ code: 'TESTCODE' }), events: mockEvent() }

    const mockClient = createMockSupabaseClient({ data: referralCode })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/TESTCODE')
    const params = Promise.resolve({ code: 'TESTCODE' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.referralCode).toEqual(referralCode)
  })

  it('should return 404 when referral code not found', async () => {
    const mockClient = createMockSupabaseClient({
      error: { message: 'Not found' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/INVALID')
    const params = Promise.resolve({ code: 'INVALID' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Invalid referral code' })
  })

  it('should return 404 when referral code is null', async () => {
    const mockClient = createMockSupabaseClient({ data: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/referrals/INVALID')
    const params = Promise.resolve({ code: 'INVALID' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Invalid referral code' })
  })
})
