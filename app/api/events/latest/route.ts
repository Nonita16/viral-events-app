import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/events/latest - Get latest 3 upcoming events (future dates)
export async function GET() {
  const supabase = await createClient()

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
    .limit(3)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}
