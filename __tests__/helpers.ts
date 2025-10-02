import { type Database } from '@/lib/types/database.types'

type Event = Database['public']['Tables']['events']['Row']
type RSVP = Database['public']['Tables']['rsvps']['Row']
type Invite = Database['public']['Tables']['invites']['Row']
type ReferralCode = Database['public']['Tables']['referral_codes']['Row']
type ReferralRegistration = Database['public']['Tables']['referral_registrations']['Row']

// Mock data factories for testing
export const mockEvent = (overrides?: Partial<Event>): Event => ({
  id: 'event-123',
  created_at: new Date().toISOString(),
  created_by: 'user-123',
  title: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  event_date: '2025-12-01',
  event_time: null,
  image_url: null,
  ...overrides,
})

export const mockRSVP = (overrides?: Partial<RSVP>): RSVP => ({
  id: 'rsvp-123',
  created_at: new Date().toISOString(),
  event_id: 'event-123',
  user_id: 'user-123',
  status: 'going',
  ...overrides,
})

export const mockInvite = (overrides?: Partial<Invite>): Invite => ({
  id: 'invite-123',
  created_at: new Date().toISOString(),
  event_id: 'event-123',
  sent_by: 'user-123',
  sent_to_email: 'test@example.com',
  status: 'pending',
  ...overrides,
})

export const mockReferralCode = (overrides?: Partial<ReferralCode>): ReferralCode => ({
  id: 'referral-123',
  created_at: new Date().toISOString(),
  code: 'TESTCODE123',
  event_id: 'event-123',
  created_by: 'user-123',
  ...overrides,
})

export const mockReferralRegistration = (overrides?: Partial<ReferralRegistration>): ReferralRegistration => ({
  id: 'registration-123',
  created_at: new Date().toISOString(),
  referral_code_id: 'referral-123',
  user_id: 'user-123',
  event_id: 'event-123',
  ...overrides,
})

export const mockUser = () => ({
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export const mockSession = () => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser(),
})

// Helper to create mock request objects
export const createMockRequest = (options: {
  method?: string
  body?: any
  headers?: Record<string, string>
} = {}) => {
  const { method = 'GET', body, headers = {} } = options

  return new Request('http://localhost:3000/api/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}
