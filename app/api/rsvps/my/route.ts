import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/rsvps/my - Get current user's RSVPs
export async function GET() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rsvps, error } = await supabase
    .from('rsvps')
    .select('*, events(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rsvps })
}
