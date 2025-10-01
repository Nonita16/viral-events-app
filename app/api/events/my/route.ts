import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/events/my - Get current user's created events
export async function GET() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .order('event_date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events })
}
