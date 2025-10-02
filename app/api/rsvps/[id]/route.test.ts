import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockRSVP, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { DELETE } = await import('./route')

describe('DELETE /api/rsvps/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete RSVP when user owns it', async () => {
    const user = mockUser()
    const existingRsvp = mockRSVP({ id: 'rsvp-123', user_id: user.id })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingRsvp, error: null }),
        }
      } else {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps/rsvp-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'rsvp-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps/rsvp-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'rsvp-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 403 when user does not own RSVP', async () => {
    const user = mockUser()
    const existingRsvp = mockRSVP({ id: 'rsvp-123', user_id: 'different-user' })

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingRsvp, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps/rsvp-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'rsvp-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 403 when RSVP does not exist', async () => {
    const user = mockUser()

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps/rsvp-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'rsvp-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 500 when delete fails', async () => {
    const user = mockUser()
    const existingRsvp = mockRSVP({ id: 'rsvp-123', user_id: user.id })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingRsvp, error: null }),
        }
      } else {
        return {
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/rsvps/rsvp-123', { method: 'DELETE' })
    const params = Promise.resolve({ id: 'rsvp-123' })
    const response = await DELETE(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Delete failed' })
  })
})
