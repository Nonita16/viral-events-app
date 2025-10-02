import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockRSVP, mockUser, mockEvent } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/rsvps/my', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user RSVPs when authenticated', async () => {
    const user = mockUser()
    const rsvps = [
      { ...mockRSVP({ id: '1', user_id: user.id }), events: mockEvent() },
      { ...mockRSVP({ id: '2', user_id: user.id }), events: mockEvent() },
    ]

    const mockClient = createMockSupabaseClient({ user, data: rsvps })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.rsvps).toEqual(rsvps)
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 500 on database error', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({
      user,
      error: { message: 'Database error' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
