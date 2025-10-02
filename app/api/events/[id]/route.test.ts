import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockEvent, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET, PATCH, DELETE } = await import('./route')

describe('GET /api/events/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return event by id', async () => {
    const event = mockEvent({ id: 'event-123' })
    const mockClient = createMockSupabaseClient({ data: event })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123')
    const params = Promise.resolve({ id: 'event-123' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ event })
  })

  it('should return 404 when event not found', async () => {
    const mockClient = createMockSupabaseClient({
      error: { message: 'Event not found' },
    })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/nonexistent')
    const params = Promise.resolve({ id: 'nonexistent' })
    const response = await GET(request, { params })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Event not found' })
  })
})

describe('PATCH /api/events/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update event when owner is authenticated', async () => {
    const user = mockUser()
    const existingEvent = mockEvent({ id: 'event-123', created_by: user.id })
    const updatedEvent = mockEvent({ id: 'event-123', title: 'Updated Title', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user, data: updatedEvent })
    // Handle ownership check - first query
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
      update: vi.fn().mockReturnThis(),
    })

    // Override for second call (update query)
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call - ownership check
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
        }
      } else {
        // Second call - update
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: updatedEvent, error: null }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.event.title).toBe('Updated Title')
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 403 when user is not the owner', async () => {
    const user = mockUser()
    const existingEvent = mockEvent({ id: 'event-123', created_by: 'different-user' })

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 403 when event does not exist', async () => {
    const user = mockUser()

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 500 when update fails', async () => {
    const user = mockUser()
    const existingEvent = mockEvent({ id: 'event-123', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call - ownership check
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
        }
      } else {
        // Second call - update fails
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Update failed' })
  })
})

describe('DELETE /api/events/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete event when owner is authenticated', async () => {
    const user = mockUser()
    const existingEvent = mockEvent({ id: 'event-123', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call - ownership check
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
        }
      } else {
        // Second call - delete
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 403 when user is not the owner', async () => {
    const user = mockUser()
    const existingEvent = mockEvent({ id: 'event-123', created_by: 'different-user' })

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 500 when delete fails', async () => {
    const user = mockUser()
    const existingEvent = mockEvent({ id: 'event-123', created_by: user.id })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call - ownership check
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingEvent, error: null }),
        }
      } else {
        // Second call - delete fails
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/events/event-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'event-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Delete failed' })
  })
})
