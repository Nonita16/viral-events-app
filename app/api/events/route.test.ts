import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockEvent, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

// Mock the Supabase server client module
const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

// Import the route handlers after mocking
const { GET, POST } = await import('./route')

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all events ordered by event_date', async () => {
    const events = [
      mockEvent({ id: '1', event_date: '2025-12-01' }),
      mockEvent({ id: '2', event_date: '2025-12-15' }),
    ]

    const mockClient = createMockSupabaseClient({ data: events })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ events })
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

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create event when authenticated', async () => {
    const user = mockUser()
    const newEvent = mockEvent({
      title: 'New Event',
      description: 'Description',
      location: 'Location',
      event_date: '2025-12-01',
    })

    const mockClient = createMockSupabaseClient({
      user,
      data: newEvent,
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Event',
        description: 'Description',
        location: 'Location',
        event_date: '2025-12-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.event).toEqual(newEvent)
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({
      user: null,
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Event',
        event_date: '2025-12-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 400 when title is missing', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        event_date: '2025-12-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Title and event_date are required' })
  })

  it('should return 400 when event_date is missing', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Event',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Title and event_date are required' })
  })

  it('should return 500 on database error', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({
      user,
      error: { message: 'Database error' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Event',
        event_date: '2025-12-01',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Database error' })
  })
})
