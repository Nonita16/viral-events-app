import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/rsvps/counts - Get RSVP counts for all events
export async function GET() {
  const supabase = await createClient()

  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('event_id, status')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Count "going" and "maybe" RSVPs per event
  const counts: Record<string, { going: number; maybe: number }> = {}

  rsvps?.forEach(rsvp => {
    if (!counts[rsvp.event_id]) {
      counts[rsvp.event_id] = { going: 0, maybe: 0 }
    }

    if (rsvp.status === 'going') {
      counts[rsvp.event_id].going += 1
    } else if (rsvp.status === 'maybe') {
      counts[rsvp.event_id].maybe += 1
    }
  })

  return NextResponse.json({ counts })
}
