# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 application with Supabase authentication and native Tailwind CSS. Built with TypeScript and the App Router architecture. **Note**: This project was originally based on the Next.js + Supabase starter template but shadcn/ui has been removed in favor of native Tailwind CSS.

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

## Environment Setup

Required environment variables (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: https://app.supabase.com/project/_/settings/api

Rename `.env.example` to `.env.local` and populate before running locally. Create a Supabase project at https://database.new

## Supabase Client Architecture

This project uses `@supabase/ssr` for cookie-based authentication across Next.js environments. **Critical**: Never instantiate Supabase clients as global variables—always create fresh instances per request when using Fluid compute.

### Three distinct client patterns:

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

### Auth Flow

- Middleware (`middleware.ts`) checks authentication on all routes except static assets
- Unauthenticated users are redirected to `/auth/login` (except from `/` and `/auth/*` paths)
- Auth routes: `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password`, `/auth/confirm`
- Protected area: `/protected/*`

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → Root directory

## UI Styling

**Native Tailwind CSS only** - no component library. All components use inline Tailwind classes:
- Button styles: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 h-9 px-4 py-2`
- Card styles: `bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm`
- Input styles: `flex h-9 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300`

The `cn()` utility in `lib/utils.ts` uses only `clsx` for conditional class names.

## Project Structure

```
app/
  ├── auth/          # Authentication pages (login, sign-up, etc.)
  ├── protected/     # Protected routes requiring auth
  ├── layout.tsx     # Root layout with ThemeProvider
  └── page.tsx       # Landing page
components/
  ├── tutorial/      # Tutorial step components
  └── ...            # Feature components (auth forms, theme switcher, etc.)
lib/
  ├── supabase/      # Supabase client utilities
  └── utils.ts       # Shared utilities (cn, hasEnvVars)
middleware.ts        # Auth middleware (session refresh)
```
