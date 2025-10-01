import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/invites/event/[eventId] - Get invites for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient()
  const { eventId } = await params

  const { data: invites, error } = await supabase
    .from('invites')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ invites })
}
