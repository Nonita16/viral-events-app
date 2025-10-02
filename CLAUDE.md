# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Viral Events App - a Next.js 15 application with Supabase backend for creating and managing events with viral sharing capabilities. Built with TypeScript, App Router, and native Tailwind CSS. **Note**: This project was originally based on the Next.js + Supabase starter template but shadcn/ui has been removed in favor of native Tailwind CSS.

### Core Features
- **Events**: Authenticated users can create, edit, and delete events (single-day events with optional time)
- **Invites**: Authenticated users can send email invites to any event
- **RSVPs**: Authenticated users can RSVP to events (going/maybe/not_going)
- **Referral System**: Each user gets one unique referral code (user-based, not event-specific) with click tracking
- **Analytics**: Users can track total clicks, signups, and conversion rates for their referral code

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage (80% threshold required)
npm run test:coverage
```

Development server runs on http://localhost:3000

## Database & Migrations

Uses Supabase for PostgreSQL database with Row Level Security (RLS).

### Database Schema
- **events**: id, created_by, title, description, location, event_date, event_time, created_at, updated_at
- **invites**: id, event_id, sent_by, sent_to_email, status (pending/accepted/declined), created_at
- **rsvps**: id, event_id, user_id, status (going/maybe/not_going), created_at, updated_at - unique(event_id, user_id)
- **referral_codes**: id, code (unique), created_by, created_at - **user-based** (one code per user)
- **referral_registrations**: id, referral_code_id, user_id, created_at - unique(referral_code_id, user_id) - tracks signups via referral
- **referral_clicks**: id, referral_code_id, anon_user_id, created_at - unique(referral_code_id, anon_user_id) - tracks link clicks by anonymous users

### Working with Migrations

```bash
# Push migrations to remote Supabase
supabase db push

# Generate TypeScript types from remote database schema
supabase gen types typescript --linked > lib/types/database.types.ts
```

**Important**: When creating migration files, use current timestamp format: `YYYYMMDDHHMMSS_description.sql`
- Generate timestamp: `date +%Y%m%d%H%M%S`
- Place in: `supabase/migrations/`

## Environment Setup

Required environment variables (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: https://app.supabase.com/project/_/settings/api

Rename `.env.example` to `.env.local` and populate before running locally. Create a Supabase project at https://database.new

## Architecture Overview

### API Routes Pattern
All backend logic lives in App Router API routes (`app/api/`), organized by resource:

```
app/api/
  ├── events/
  │   ├── route.ts                     # GET (list all), POST (create)
  │   ├── [id]/route.ts                # GET, PATCH, DELETE (ownership verified)
  │   ├── my/route.ts                  # GET user's events
  │   ├── latest/route.ts              # GET latest 6 events (public)
  │   └── generate-test-data/route.ts  # POST (dev only - creates test data)
  ├── invites/
  │   ├── route.ts                     # POST (send invite)
  │   ├── [id]/route.ts                # PATCH (update status)
  │   └── event/[eventId]/route.ts     # GET invites for event
  ├── rsvps/
  │   ├── route.ts                     # POST (upsert RSVP)
  │   ├── [id]/route.ts                # DELETE
  │   ├── my/route.ts                  # GET user's RSVPs
  │   ├── event/[eventId]/route.ts     # GET RSVPs for event
  │   └── counts/route.ts              # GET RSVP counts for event
  └── referrals/
      ├── route.ts                     # POST (generate user's unique code with nanoid)
      ├── [code]/route.ts              # GET (validate referral code and get associated user)
      ├── [code]/register/route.ts     # POST (register user via referral)
      ├── analytics/route.ts           # GET (user's analytics: total clicks, signups, conversion)
      └── track-click/route.ts         # POST (track anonymous user clicks)
```

All API routes handle authentication via `supabase.auth.getUser()` and enforce ownership/permissions via RLS and manual checks. Public routes (GET events, GET counts, track-click) are configured in middleware.

### Data Fetching Pattern

Components use direct `fetch()` calls with `useTransition()` and `router.refresh()` for mutations. Server Components fetch data directly from Supabase. No global state management or query caching library is used.

### Supabase Client Architecture

This project uses `@supabase/ssr` for cookie-based authentication across Next.js environments. **Critical**: Never instantiate Supabase clients as global variables—always create fresh instances per request when using Fluid compute.

#### Three distinct client patterns:

1. **Browser Client** (`lib/supabase/client.ts`): For Client Components
   - Uses `createBrowserClient()`
   - Called via `createClient()`

2. **Server Client** (`lib/supabase/server.ts`): For Server Components, Route Handlers, Server Actions
   - Uses `createServerClient()` with cookies integration
   - Called via `createClient()` (async function)
   - Must handle `setAll()` errors in Server Components (middleware refreshes sessions)

3. **Middleware Client** (`lib/supabase/middleware.ts`): For session management
   - Uses `createServerClient()` in middleware context
   - **Must** call `supabase.auth.getClaims()` immediately after client creation to prevent random logouts
   - Returns modified `supabaseResponse` with updated cookies
   - Never modify cookies manually—always return the supabaseResponse object intact

#### Auth Flow

Middleware (`middleware.ts`) handles authentication and redirects:

**Public Routes** (no auth required):
- `/` - Home page
- `/events` and `/events/[id]` - View events (read-only)
- `/auth/*` - All auth pages
- GET `/api/events`, `/api/events/[id]`, `/api/events/latest` - Public API
- GET `/api/rsvps/counts`, `/api/rsvps/event/[eventId]` - Public RSVP data
- POST `/api/referrals/track-click` - Anonymous click tracking

**Protected Routes** (require full authentication, not anonymous):
- `/events/create` - Create new events
- `/invites` - View and manage invites
- `/protected/*` - Protected area
- All POST/PATCH/DELETE API endpoints (except track-click)

**Anonymous User Behavior**:
- Anonymous sessions are created when users click referral links
- Anonymous users can browse but cannot create/modify content
- Converting from anonymous to authenticated preserves their session
- Only anonymous users trigger click tracking in referral system

### TypeScript Types

Database types are auto-generated in `lib/types/database.types.ts` from Supabase schema using CLI. **Always regenerate after schema changes.**

Access types:
```typescript
import { Database } from '@/lib/types/database.types'
type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
```

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → Root directory

## UI Styling

**Native Tailwind CSS only** - no component library. All components use inline Tailwind classes:
- Button styles: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 h-9 px-4 py-2`
- Card styles: `bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm`
- Input styles: `flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300`

The `cn()` utility in `lib/utils.ts` uses only `clsx` for conditional class names.

## Testing

Uses Vitest for testing with 80% coverage threshold requirement.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- **Test files**: Located in `__tests__/` directory or colocated with source files as `*.test.ts`
- **Mocks**: Supabase client mocks in `__tests__/mocks/supabase.ts`
- **Setup**: Global test setup in `__tests__/setup.ts`
- **Coverage scope**: Focuses on `app/api/**/*.ts` and `lib/utils.ts` (components excluded)

### Writing Tests for API Routes

API route tests use mocked Supabase clients. Example pattern:

```typescript
import { vi } from 'vitest'
import { GET } from './route'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

// Test with mocked responses
test('should return events', async () => {
  const mockSupabase = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [...], error: null })
      })
    }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: {...} } }) }
  }
  // ... test implementation
})
```

## Component Architecture

### Server vs Client Components

**Server Components** (default):
- All pages in `app/**/page.tsx` are Server Components
- Fetch data directly from Supabase using `createClient()` from `lib/supabase/server.ts`
- Pass data as props to Client Components
- Examples: `app/events/[id]/page.tsx`, `app/events/page.tsx`

**Client Components** (with `'use client'` directive):
- Interactive components that need state, effects, or event handlers
- Use `createClient()` from `lib/supabase/client.ts` if needed
- Examples: `components/event-rsvp-section.tsx`, `components/events-list.tsx`

### Key Component Patterns

**Event Display**:
- `components/event-card.tsx` - Reusable event card with gradient header
- `components/events-list.tsx` - Paginated list with upcoming/past sections
- `lib/utils/event-utils.ts` - Shared utilities for gradients, date formatting, past event detection

**Form Handling**:
- Use `useTransition()` for pending states during mutations
- Call `router.refresh()` after successful mutations to revalidate Server Component data
- Validate inputs before submission (e.g., `app/events/create/page.tsx`)

**Analytics Integration**:
- Vercel Analytics via `@vercel/analytics` package
- Track events using `track()` function from `@vercel/analytics`
- Examples: RSVP actions, past events viewed, referral clicks

## Referral System Flow

**User-based referral system** - each user gets one unique code (not tied to specific events):

1. **Code Generation**: User creates their referral code via `/api/referrals` (uses `nanoid(10)`)
   - One code per user, stored in `referral_codes` table
   - Code can be used to share any content, not event-specific
2. **Click Tracking**: Anonymous users clicking referral links trigger `/api/referrals/track-click`
   - Creates anonymous session if none exists
   - Tracks click in `referral_clicks` table (one per anon user per code via unique constraint)
3. **Registration**: When anon user signs up, `/api/referrals/[code]/register` is called
   - Creates entry in `referral_registrations` (one per user per code via unique constraint)
   - Converts anonymous session to authenticated user
4. **Analytics**: Users view their own analytics at `/api/referrals/analytics`
   - Returns: total clicks, total signups, conversion rate for user's referral code
   - Only accessible to the code owner (ownership verified)

## Known Issues & Considerations

### Timezone Handling
- Event dates are stored as DATE (YYYY-MM-DD) and times as TIME (HH:MM)
- **Important**: Date parsing from string creates UTC midnight, but time setting uses local timezone
- Past event detection in `lib/utils/event-utils.ts` and `components/event-rsvp-section.tsx` may have edge cases with timezone boundaries
- Event creation in `app/events/create/page.tsx` converts `datetime-local` input to date/time parts

### Data Fetching
- Currently uses direct fetch + `router.refresh()` pattern
- No global loading states or error boundaries
- Mutations don't have optimistic updates

### Security Notes
- All API routes require authentication except explicitly public ones (defined in middleware)
- Ownership checks are manual (not purely RLS-based) in update/delete endpoints
- Input validation is basic - consider adding Zod or similar for production
- Console logging in production may expose internal details