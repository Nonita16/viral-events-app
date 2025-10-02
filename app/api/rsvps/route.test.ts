import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockRSVP, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { POST } = await import('./route')

describe('POST /api/rsvps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create RSVP when authenticated', async () => {
    const user = mockUser()
    const rsvp = mockRSVP({ event_id: 'event-123', user_id: user.id, status: 'going' })

    const mockClient = createMockSupabaseClient({ user, data: rsvp })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
        status: 'going',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.rsvp).toEqual(rsvp)
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
        status: 'going',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 400 when event_id is missing', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        status: 'going',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'event_id and status are required' })
  })

  it('should return 400 when status is missing', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'event_id and status are required' })
  })

  it('should return 400 when status is invalid', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
        status: 'invalid',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Valid status is required (going, maybe, not_going)' })
  })

  it('should return 500 on database error', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({
      user,
      error: { message: 'Database error' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
        status: 'going',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
