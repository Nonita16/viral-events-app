import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH /api/invites/[id] - Update invite status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { status } = body

  if (!status || !['pending', 'accepted', 'declined'].includes(status)) {
    return NextResponse.json(
      { error: 'Valid status is required (pending, accepted, declined)' },
      { status: 400 }
    )
  }

  // Verify sender owns the invite
  const { data: existingInvite } = await supabase
    .from('invites')
    .select('sent_by')
    .eq('id', id)
    .single()

  if (!existingInvite || existingInvite.sent_by !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: invite, error } = await supabase
    .from('invites')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ invite })
}
