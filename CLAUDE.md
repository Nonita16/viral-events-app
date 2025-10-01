# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Viral Events App - a Next.js 15 application with Supabase backend for creating and managing events with viral sharing capabilities. Built with TypeScript, App Router, TanStack Query, and native Tailwind CSS. **Note**: This project was originally based on the Next.js + Supabase starter template but shadcn/ui has been removed in favor of native Tailwind CSS.

### Core Features
- **Events**: Authenticated users can create, edit, and delete events (single-day events with optional time)
- **Invites**: Authenticated users can send email invites to any event
- **RSVPs**: Authenticated users can RSVP to events (going/maybe/not_going)
- **Referral System**: Users can generate shareable referral codes that auto-register and RSVP new users to events
- **Analytics**: Event creators can track how many users registered via each referral code

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
```

Development server runs on http://localhost:3000

## Database & Migrations

Uses Supabase for PostgreSQL database with Row Level Security (RLS).

### Database Schema
- **events**: id, created_by, title, description, location, event_date, event_time, image_url
- **invites**: id, event_id, sent_by, sent_to_email, status (pending/accepted/declined)
- **rsvps**: id, event_id, user_id, status (going/maybe/not_going) - unique per user/event
- **referral_codes**: id, code (unique), event_id, created_by
- **referral_registrations**: id, referral_code_id, user_id, event_id - for analytics tracking

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
  │   ├── route.ts              # GET (list), POST (create)
  │   ├── [id]/route.ts         # GET, PATCH, DELETE
  │   └── my/route.ts           # GET user's events
  ├── invites/
  │   ├── route.ts              # POST (send invite)
  │   ├── [id]/route.ts         # PATCH (update status)
  │   └── event/[eventId]/route.ts  # GET invites for event
  ├── rsvps/
  │   ├── route.ts              # POST (upsert RSVP)
  │   ├── [id]/route.ts         # DELETE
  │   ├── my/route.ts           # GET user's RSVPs
  │   └── event/[eventId]/route.ts  # GET RSVPs for event
  └── referrals/
      ├── route.ts              # POST (generate code)
      ├── [code]/route.ts       # GET (validate)
      ├── [code]/register/route.ts  # POST (register + auto-RSVP)
      ├── event/[eventId]/route.ts  # GET codes for event
      └── analytics/[eventId]/route.ts  # GET analytics (owner only)
```

All API routes handle authentication via `supabase.auth.getUser()` and enforce ownership/permissions via RLS and manual checks.

### TanStack Query Integration

**Critical**: All data fetching uses TanStack Query hooks (never direct fetch in components). Provider wraps app in `app/layout.tsx`.

Custom hooks in `lib/hooks/`:
- **use-events.ts**: `useEvents()`, `useEvent(id)`, `useMyEvents()`, `useCreateEvent()`, `useUpdateEvent()`, `useDeleteEvent()`
- **use-invites.ts**: `useInvites(eventId)`, `useSendInvite()`, `useUpdateInviteStatus()`
- **use-rsvps.ts**: `useRSVPs(eventId)`, `useMyRSVPs()`, `useCreateRSVP()`, `useDeleteRSVP()`
- **use-referrals.ts**: `useReferralCodes(eventId)`, `useReferralCode(code)`, `useGenerateReferral()`, `useRegisterWithReferral()`, `useReferralAnalytics(eventId)`

All mutations automatically invalidate related queries for cache consistency.

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

- Middleware (`middleware.ts`) checks authentication on all routes except static assets
- Unauthenticated users are redirected to `/auth/login` (except from `/` and `/auth/*` paths)
- Auth routes: `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`, `/auth/confirm`
- Protected area: `/protected/*`

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