import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockInvite, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { POST } = await import('./route')

describe('POST /api/invites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create invite when authenticated', async () => {
    const user = mockUser()
    const invite = mockInvite({ event_id: 'event-123', sent_to_email: 'test@example.com' })
    const event = { title: 'Test Event', event_date: '2025-12-01', event_time: '18:00', location: 'Test Location' }

    const mockClient = createMockSupabaseClient({
      user,
      data: invite,
      multipleQueries: [
        { data: event, error: null }, // First query for event lookup
        { data: invite, error: null }  // Second query for invite insertion
      ]
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
        sent_to_email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.invite).toEqual(invite)
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
        sent_to_email: 'test@example.com',
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

    const request = new Request('http://localhost/api/invites', {
      method: 'POST',
      body: JSON.stringify({
        sent_to_email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'event_id and sent_to_email are required' })
  })

  it('should return 400 when sent_to_email is missing', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'event-123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'event_id and sent_to_email are required' })
  })

  it('should return 404 when event not found', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({
      user,
      data: null, // Event not found
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites', {
      method: 'POST',
      body: JSON.stringify({
        event_id: 'non-existent-event',
        sent_to_email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Event not found' })
  })

})
