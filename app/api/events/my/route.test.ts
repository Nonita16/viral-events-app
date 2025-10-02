import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockEvent, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/events/my', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return user events when authenticated', async () => {
    const user = mockUser()
    const events = [
      mockEvent({ id: '1', created_by: user.id }),
      mockEvent({ id: '2', created_by: user.id }),
    ]

    const mockClient = createMockSupabaseClient({ user, data: events })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ events })
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
