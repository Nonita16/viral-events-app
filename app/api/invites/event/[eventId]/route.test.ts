import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockInvite } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/invites/event/[eventId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return invites for event', async () => {
    const invites = [
      mockInvite({ event_id: 'event-123' }),
      mockInvite({ event_id: 'event-123' }),
    ]

    const mockClient = createMockSupabaseClient({ data: invites })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/event/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invites).toEqual(invites)
  })

  it('should return 500 on database error', async () => {
    const mockClient = createMockSupabaseClient({
      error: { message: 'Database error' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/event/event-123')
    const params = Promise.resolve({ eventId: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
