import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockInvite, mockUser } from '@/__tests__/helpers'
import { createMockSupabaseClient } from '@/__tests__/mocks/supabase'

const mockCreateClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

const { PATCH } = await import('./route')

describe('PATCH /api/invites/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update invite status when sender is authenticated', async () => {
    const user = mockUser()
    const existingInvite = mockInvite({ id: 'invite-123', sent_by: user.id })
    const updatedInvite = mockInvite({ id: 'invite-123', sent_by: user.id, status: 'accepted' })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingInvite, error: null }),
        }
      } else {
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: updatedInvite, error: null }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/invite-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const params = Promise.resolve({ id: 'invite-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.invite.status).toBe('accepted')
  })

  it('should return 401 when not authenticated', async () => {
    const mockClient = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/invite-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const params = Promise.resolve({ id: 'invite-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 400 when status is invalid', async () => {
    const user = mockUser()
    const mockClient = createMockSupabaseClient({ user })
    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/invite-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid' }),
    })
    const params = Promise.resolve({ id: 'invite-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Valid status is required (pending, accepted, declined)' })
  })

  it('should return 403 when user is not the sender', async () => {
    const user = mockUser()
    const existingInvite = mockInvite({ id: 'invite-123', sent_by: 'different-user' })

    const mockClient = createMockSupabaseClient({ user })
    mockClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingInvite, error: null }),
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/invite-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const params = Promise.resolve({ id: 'invite-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('should return 500 when update fails', async () => {
    const user = mockUser()
    const existingInvite = mockInvite({ id: 'invite-123', sent_by: user.id })

    const mockClient = createMockSupabaseClient({ user })
    let callCount = 0
    mockClient.from = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: existingInvite, error: null }),
        }
      } else {
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } }),
        }
      }
    })

    mockCreateClient.mockResolvedValue(mockClient)

    const request = new Request('http://localhost/api/invites/invite-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    })
    const params = Promise.resolve({ id: 'invite-123' })
    const response = await PATCH(request, { params })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Update failed' })
  })
})
