import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockEvent } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { GET } = await import('./route')

describe('GET /api/events/latest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return latest 3 events', async () => {
    const events = [
      mockEvent({ id: '1' }),
      mockEvent({ id: '2' }),
      mockEvent({ id: '3' }),
    ]

    const mockClient = createMockSupabaseClient({ data: events })
    mockCreateClient.mockResolvedValue(mockClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ events })
    expect(data.events).toHaveLength(3)
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
