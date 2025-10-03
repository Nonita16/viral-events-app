# Viral Events App

A modern event management platform with viral sharing capabilities, built to enable users to create, share, and track events with powerful referral analytics.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Requirements](#-requirements)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Testing](#-testing)
- [Application Flow](#-application-flow)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Security Considerations](#-security-considerations)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Support](#-support)

## 🎯 Overview

Viral Events App is a full-stack Next.js application that combines event management with a sophisticated referral tracking system. Users can create and manage events, send invitations, track RSVPs, and leverage a viral referral system to grow their audience. The platform features anonymous user tracking, real-time analytics, and a comprehensive authentication system.

**Key Differentiators:**

- User-based referral codes (not event-specific) for maximum flexibility
- Anonymous session tracking that seamlessly converts to authenticated users
- Real-time conversion tracking with click analytics
- Modern stack with Next.js 15 App Router and Supabase

## ✨ Features

### Core Functionality

- **Event Management**

  - Create, edit, and delete events
  - Single-day events with optional time
  - Event details: title, description, location, date/time
  - Public event browsing and private event creation

- **RSVP System**

  - Three status options: Going, Maybe, Not Going
  - Real-time RSVP counts
  - User-specific RSVP tracking
  - One RSVP per user per event

- **Invitation System**

  - Email-based invitations
  - Invite status tracking: Pending, Accepted, Declined
  - Event-specific invite management

- **Referral & Analytics**

  - Unique referral code per user (10-character nanoid)
  - Anonymous click tracking
  - Conversion tracking from anonymous to registered users
  - Analytics dashboard showing:
    - Total clicks
    - Total signups
    - Conversion rate

- **Authentication**
  - Email/password authentication via Supabase
  - Anonymous sessions for tracking
  - Protected routes with middleware
  - Session persistence

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling (no component library)
- **Turbopack** - Fast bundler for development

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
- **@supabase/ssr** - Cookie-based auth for Next.js

### Testing & Quality

- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **94.91% test coverage** achieved (API routes only)

### Utilities

- **nanoid** - Unique ID generation for referral codes
- **clsx** - Conditional CSS classes
- **@vercel/analytics** - User analytics tracking

## 📦 Requirements

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 8.x or higher (comes with Node.js)
- **Git** for version control
- **Supabase account** - [Sign up at database.new](https://database.new)
- **Supabase CLI** (optional, for migrations) - [Installation guide](https://supabase.com/docs/guides/cli)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Nonita16/viral-events-app.git
cd viral-events-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**To get your credentials:**

**Supabase:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to Settings → API
4. Copy the `Project URL` and `anon/public` key

**App URL:**

- **Development**: Use `http://localhost:3000`
- **Production**: Use your deployed domain (e.g., `https://your-app.vercel.app`)
- Used for generating referral links and SEO metadata

### 4. Set Up the Database

The project includes migration files in `supabase/migrations/`. You have two options:

#### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations to your database
supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > lib/types/database.types.ts
```

#### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in `supabase/migrations/` in order (by timestamp)
4. The migrations will create all necessary tables, RLS policies, and indexes

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Setup

### Required Environment Variables

| Variable                        | Description                 | Where to Find / How to Set                         |
| ------------------------------- | --------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL   | Supabase Dashboard → Settings → API                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Settings → API                |
| `NEXT_PUBLIC_APP_URL`           | Your application URL        | `http://localhost:3000` (dev) / Your domain (prod) |

### Optional Configuration

The app includes Vercel Analytics for tracking. No additional configuration needed.

## 🗄 Database Setup

### Database Schema

The application uses the following tables:

```sql
-- Events table
events (
  id UUID PRIMARY KEY,
  created_by UUID REFERENCES auth.users,
  title TEXT,
  description TEXT,
  location TEXT,
  event_date DATE,
  event_time TIME,
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- RSVPs table
rsvps (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events,
  user_id UUID REFERENCES auth.users,
  status TEXT, -- 'going' | 'maybe' | 'not_going'
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(event_id, user_id)
)

-- Invites table
invites (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events,
  sent_by UUID REFERENCES auth.users,
  sent_to_email TEXT,
  status TEXT, -- 'pending' | 'accepted' | 'declined'
  created_at TIMESTAMP
)

-- Referral codes table (user-based)
referral_codes (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP
)

-- Referral clicks table
referral_clicks (
  id UUID PRIMARY KEY,
  referral_code_id UUID REFERENCES referral_codes,
  anon_user_id UUID, -- Anonymous user session ID
  created_at TIMESTAMP,
  UNIQUE(referral_code_id, anon_user_id)
)

-- Referral registrations table
referral_registrations (
  id UUID PRIMARY KEY,
  referral_code_id UUID REFERENCES referral_codes,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP,
  UNIQUE(referral_code_id, user_id)
)
```

### Row Level Security (RLS)

All tables have RLS policies enabled to ensure:

- Users can only modify their own data
- Public read access for events and RSVPs
- Protected write operations requiring authentication
- Referral analytics only accessible by code owners

## 💻 Development

### Available Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage (requires 80% threshold)
npm run test:coverage
```

### Development Server

The development server runs on **http://localhost:3000** with Turbopack for fast refresh.

### Test Data Generation

For development purposes, you can generate test events to populate your database with sample data.

**How it works:**

- **Endpoint**: `POST /api/events/generate-test-data`
- **Availability**: Development mode only (`NODE_ENV=development`)
- **Authentication**: Requires authenticated user
- **What it generates**: 20 test events (10 past, 10 future)
  - **Past events**: Random dates 1-30 days ago
  - **Future events**: Random dates 1-60 days ahead
  - Realistic titles (Summer Music Festival, Tech Conference, etc.)
  - Varied locations across major US cities
  - Random times between 9 AM - 8 PM

**Using the test data generator:**

```bash
# Using curl (after signing in)
curl -X POST http://localhost:3000/api/events/generate-test-data \
  -H "Content-Type: application/json"

# Or use your API client (Postman, Insomnia, etc.)
POST http://localhost:3000/api/events/generate-test-data
```

**Response:**

```json
{
  "message": "Successfully generated 20 test events",
  "count": 20,
  "events": [...]
}
```

**Security:**

- Only works in development environment
- Returns 403 Forbidden in production
- All events are owned by the authenticated user
- Can be called multiple times to generate more test data

### Code Quality

- **ESLint**: Configured with Next.js rules and strict TypeScript checking
- **TypeScript**: Strict mode enabled for type safety
- **No console statements**: Console statements are forbidden in production code (enforced by ESLint)

## 🧪 Testing

The project uses **Vitest** for testing with a focus on API route testing. Component testing is not currently implemented.

### Test Structure

```
__tests__/
├── setup.ts           # Global test setup
├── helpers.ts         # Test utilities and mock data factories
└── mocks/
    └── supabase.ts    # Supabase client mocks

app/api/
└── **/*.test.ts       # API route tests (colocated with routes)

lib/
└── utils.test.ts      # Utility function tests
```

### Running Tests

```bash
# Run all tests
npm run test

# Run with UI (Vitest UI)
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### Coverage Requirements

- **Threshold**: 80% coverage required
- **Current**: 94.91% coverage achieved ✅
- **Scope**: API routes (`app/api/**/*.ts`) and utilities (`lib/utils.ts`)
- **Components**: No component tests - only API routes are tested

### Coverage Breakdown

- **Statements**: 94.91%
- **Branches**: 93.15%
- **Functions**: 100%
- **Lines**: 94.91%

### Writing Tests

Example API route test:

```typescript
import { vi } from 'vitest'
import { GET } from './route'
import { mockCreateClient } from '@/__tests__/mocks/supabase'

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient({ data: [...], error: null })
}))

test('should return events', async () => {
  const request = new Request('http://localhost:3000/api/events')
  const response = await GET(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data).toHaveLength(3)
})
```

## 🔄 Application Flow

### User Journey

```
1. Landing Page (/)
   ↓
2. Browse Events (public)
   ├─→ View Event Details
   ├─→ See RSVP Counts
   └─→ View Past Events
   ↓
3. Sign Up / Log In
   ↓
4. Authenticated Features
   ├─→ Create Events
   ├─→ Edit/Delete Own Events
   ├─→ RSVP to Events
   ├─→ Send Invites
   ├─→ Generate Referral Code
   └─→ View Analytics
```

### Referral System Flow

```
1. User generates unique referral code
   └─→ POST /api/referrals
   └─→ Stored in referral_codes table
   ↓
2. User shares referral link (e.g., https://app.com/?ref=CODE123)
   ↓
3. Anonymous user clicks link
   ├─→ Anonymous session created
   ├─→ POST /api/referrals/track-click
   └─→ Click recorded in referral_clicks
   ↓
4. Anonymous user signs up
   ├─→ POST /api/referrals/[code]/register
   └─→ Registration recorded in referral_registrations
   ↓
5. Code owner views analytics
   └─→ GET /api/referrals/analytics
   └─→ Returns: clicks, signups, conversion rate
```

### Authentication Flow

```
Middleware (middleware.ts)
   ↓
Check route type
   ├─→ Public Route → Allow access
   ├─→ Protected Route → Check auth
   │   ├─→ Authenticated → Allow
   │   └─→ Not authenticated → Redirect to /sign-in
   └─→ API Route
       ├─→ Public endpoint → Allow
       └─→ Protected endpoint → Require auth
```

### Data Flow Pattern

**Server Components:**

```typescript
// app/events/page.tsx
async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("*");

  return <EventsList events={events} />;
}
```

**Client Components:**

```typescript
// components/rsvp-form.tsx
"use client";

function RSVPForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      await fetch("/api/rsvps", {
        method: "POST",
        body: JSON.stringify({ status: "going" }),
      });
      router.refresh(); // Revalidate server data
    });
  };
}
```

## 📁 Project Structure

```
viral-events-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── events/               # Event endpoints
│   │   ├── invites/              # Invite endpoints
│   │   ├── rsvps/                # RSVP endpoints
│   │   └── referrals/            # Referral & analytics endpoints
│   ├── auth/                     # Auth pages (sign-in, sign-up)
│   ├── events/                   # Event pages
│   ├── invites/                  # Invites page
│   ├── protected/                # Protected area
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── event-card.tsx
│   ├── events-list.tsx
│   ├── referral-tracker.tsx
│   └── ...
├── lib/                          # Utilities & configurations
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware client
│   ├── types/                    # TypeScript types
│   │   └── database.types.ts     # Generated from Supabase
│   └── utils/                    # Utility functions
│       └── event-utils.ts
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
├── __tests__/                    # Test files
│   ├── api/                      # API route tests
│   ├── mocks/                    # Test mocks
│   └── helpers.ts                # Test utilities
├── middleware.ts                 # Next.js middleware (auth)
├── .env.local                    # Environment variables (not in repo)
├── .env.example                  # Example env file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── eslint.config.mjs             # ESLint config
├── vitest.config.ts              # Vitest config
└── README.md                     # This file
```

### Key Directories

- **`app/api/`**: All backend API logic (RESTful endpoints)
- **`components/`**: Reusable React components
- **`lib/supabase/`**: Three separate Supabase client implementations
- **`supabase/migrations/`**: Database schema and migrations
- **`__tests__/`**: Test files with mocks and helpers

## 🚢 Deployment

### Vercel Deployment (Recommended)

#### Step 1: Push to Git Repository
```bash
git push origin main
```

#### Step 2: Import to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js - keep default settings

#### Step 3: Configure Environment Variables

**In Vercel Dashboard → Settings → Environment Variables, add:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (from Supabase Dashboard) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key (from Supabase Dashboard) | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | **Leave empty initially** | All environments |

**Important for `NEXT_PUBLIC_APP_URL`:**
1. **First deployment**: Leave `NEXT_PUBLIC_APP_URL` empty or set to a placeholder
2. **After deployment**: Vercel assigns you a domain (e.g., `your-app.vercel.app`)
3. **Update variable**: Go back to Settings → Environment Variables
4. **Set `NEXT_PUBLIC_APP_URL`** to `https://your-app.vercel.app` (your actual Vercel domain)
5. **Redeploy**: Trigger a new deployment for changes to take effect

**Quick way to add variables via Vercel CLI:**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_APP_URL production

# Redeploy with new env vars
vercel --prod
```

#### Step 4: Deploy
Click **"Deploy"** - Vercel will build and deploy your app.

### Environment Variables for Production

**Production values (Vercel):**

```env
# From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Vercel domain (get this AFTER first deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Custom Domain Setup:**

If you add a custom domain (e.g., `myevents.com`):
1. Add your custom domain in Vercel → Settings → Domains
2. Update `NEXT_PUBLIC_APP_URL` to `https://myevents.com`
3. Redeploy

**Important Notes:**
- ✅ Use the **same Supabase project** for production (or create a separate production Supabase project)
- ✅ `NEXT_PUBLIC_APP_URL` must match your actual deployed domain for referral links to work
- ✅ All `NEXT_PUBLIC_*` variables are exposed to the browser (never put secrets here)
- ✅ Redeploy after changing environment variables

### Quick Reference: Environment Variables by Environment

| Variable | Development (Local) | Production (Vercel) |
|----------|---------------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase Dashboard | Same as development (or separate project) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase Dashboard | Same as development (or separate project) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |

### How to Update Environment Variables in Vercel

**Via Dashboard (easiest):**
1. Go to your project on [Vercel](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Edit or add variables
4. Select which environments (Production/Preview/Development)
5. Click **Save**
6. Go to **Deployments** → Click **⋯** → **Redeploy**

**Via CLI (advanced):**
```bash
vercel env ls                    # List all env variables
vercel env add MY_VAR            # Add new variable
vercel env rm MY_VAR production  # Remove variable
vercel --prod                    # Redeploy to production
```

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

## 🔐 Security Considerations

- **Row Level Security (RLS)**: All database tables have RLS policies enabled
- **Protected Routes**: Middleware enforces authentication for protected pages
- **API Authentication**: All write operations require valid user session
- **Anonymous Sessions**: Used only for referral tracking, limited permissions
- **Input Validation**: Basic validation in place, consider Zod for production
- **Environment Variables**: Never commit `.env.local` to version control

## 📝 API Documentation

### Events API

- `GET /api/events` - List all events (public)
- `POST /api/events` - Create event (auth required)
- `GET /api/events/[id]` - Get event details (public)
- `PATCH /api/events/[id]` - Update event (owner only)
- `DELETE /api/events/[id]` - Delete event (owner only)
- `GET /api/events/my` - Get user's events (auth required)
- `GET /api/events/latest` - Get latest 6 events (public)
- `POST /api/events/generate-test-data` - Generate 20 test events (dev only, auth required)

### RSVPs API

- `POST /api/rsvps` - Create/update RSVP (auth required)
- `DELETE /api/rsvps/[id]` - Delete RSVP (owner only)
- `GET /api/rsvps/my` - Get user's RSVPs (auth required)
- `GET /api/rsvps/event/[eventId]` - Get RSVPs for event (public)
- `GET /api/rsvps/counts?eventId=...` - Get RSVP counts (public)

### Invites API

- `POST /api/invites` - Send invite (auth required)
- `PATCH /api/invites/[id]` - Update invite status (auth required)
- `GET /api/invites/event/[eventId]` - Get event invites (auth required)

### Referrals API

- `POST /api/referrals` - Generate referral code (auth required)
- `GET /api/referrals/[code]` - Validate referral code (public)
- `POST /api/referrals/[code]/register` - Register via referral (public)
- `POST /api/referrals/track-click` - Track click (public, anonymous)
- `GET /api/referrals/analytics` - Get user analytics (auth required)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and auth powered by [Supabase](https://supabase.com/)
- UI styled with [Tailwind CSS](https://tailwindcss.com/)
- Analytics by [Vercel Analytics](https://vercel.com/analytics)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Happy Event Building! 🎉**
