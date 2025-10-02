import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/events/latest - Get latest 3 events
export async function GET() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}
