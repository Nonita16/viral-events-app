import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/rsvps/counts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return RSVP counts per event', async () => {
    const rsvps = [
      { event_id: 'event-1', status: 'going' },
      { event_id: 'event-1', status: 'going' },
      { event_id: 'event-1', status: 'maybe' },
      { event_id: 'event-1', status: 'not_going' },
      { event_id: 'event-2', status: 'going' },
      { event_id: 'event-2', status: 'maybe' },
    ]

    const mockClient = createMockSupabaseClient({ data: rsvps })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.counts).toEqual({
      'event-1': { going: 2, maybe: 1 },
      'event-2': { going: 1, maybe: 1 },
    })
  })

  it('should return empty counts when no RSVPs', async () => {
    const mockClient = createMockSupabaseClient({ data: [] })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.counts).toEqual({})
  })

  it('should return 500 on database error', async () => {
    const mockClient = createMockSupabaseClient({
      error: { message: 'Database error' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
