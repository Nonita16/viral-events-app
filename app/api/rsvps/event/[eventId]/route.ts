import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/rsvps/event/[eventId] - Get RSVPs for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient()
  const { eventId } = await params

  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rsvps })
}
