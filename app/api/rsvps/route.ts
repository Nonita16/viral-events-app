import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/rsvps - Create or update RSVP
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for anonymous users
  if (user.is_anonymous) {
    return NextResponse.json(
      { error: 'Full authentication required' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { event_id, status } = body

  if (!event_id || !status) {
    return NextResponse.json(
      { error: 'event_id and status are required' },
      { status: 400 }
    )
  }

  if (!['going', 'maybe', 'not_going'].includes(status)) {
    return NextResponse.json(
      { error: 'Valid status is required (going, maybe, not_going)' },
      { status: 400 }
    )
  }

  // Use upsert to handle create or update
  const { data: rsvp, error } = await supabase
    .from('rsvps')
    .upsert(
      {
        event_id,
        user_id: user.id,
        status,
      },
      {
        onConflict: 'event_id,user_id',
      }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rsvp }, { status: 201 })
}
