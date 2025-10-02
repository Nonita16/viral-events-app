import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/events - List all events
export async function GET() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}

// POST /api/events - Create new event
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, location, event_date, event_time } = body

  if (!title || !event_date) {
    return NextResponse.json(
      { error: 'Title and event_date are required' },
      { status: 400 }
    )
  }

  // Check for anonymous users
  if (user.is_anonymous) {
    return NextResponse.json(
      { error: 'Full authentication required' },
      { status: 401 }
    )
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      created_by: user.id,
      title,
      description,
      location,
      event_date,
      event_time,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ event }, { status: 201 })
}
