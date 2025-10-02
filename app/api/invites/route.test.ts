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

    const mockClient = createMockSupabaseClient({ user, data: invite })
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

  it('should return 500 on database error', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({
      user,
      error: { message: 'Database error' },
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

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
