import { vi } from 'vitest'
import { mockUser, mockSession } from '../helpers'

// Mock Supabase client
export const createMockSupabaseClient = (options: {
  user?: unknown
  session?: unknown
  authError?: unknown
  data?: unknown
  error?: unknown
  count?: number
  multipleQueries?: Array<{ data?: unknown; error?: unknown }>
} = {}) => {
  const {
    user = mockUser(),
    session = mockSession(),
    authError = null,
    data = null,
    error = null,
    count = 0,
  } = options

  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: authError,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session },
        error: authError,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user, session },
        error: authError,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user, session },
        error: authError,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: authError,
      }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({
        error: authError,
      }),
      updateUser: vi.fn().mockResolvedValue({
        data: { user },
        error: authError,
      }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    csv: vi.fn().mockResolvedValue({ data, error }),
  }

  // Make the chain thenable to handle direct await
  let callIndex = 0
  mockClient.from = vi.fn().mockImplementation(() => {
    const currentData = options.multipleQueries?.[callIndex]?.data ?? data
    const currentError = options.multipleQueries?.[callIndex]?.error ?? error
    callIndex++

    const query = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: currentData, error: currentError }),
      maybeSingle: vi.fn().mockResolvedValue({ data: currentData, error: currentError }),
    }

    // Make the query chain thenable for direct awaiting
    Object.assign(query, {
      then: (resolve: (value: { data: unknown; error: unknown; count: number }) => void) =>
        resolve({ data: currentData, error: currentError, count }),
    })

    return query
  })

  return mockClient as unknown
}

// Mock the server client module
export const mockCreateClient = (clientOptions = {}) => {
  return vi.fn().mockResolvedValue(createMockSupabaseClient(clientOptions))
}
