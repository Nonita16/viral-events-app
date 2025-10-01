import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/invites - Send invite to email
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { event_id, sent_to_email } = body

  if (!event_id || !sent_to_email) {
    return NextResponse.json(
      { error: 'event_id and sent_to_email are required' },
      { status: 400 }
    )
  }

  const { data: invite, error } = await supabase
    .from('invites')
    .insert({
      event_id,
      sent_by: user.id,
      sent_to_email,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ invite }, { status: 201 })
}
