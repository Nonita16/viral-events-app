import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// POST /api/referrals - Generate referral code for event
export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { event_id } = body

  if (!event_id) {
    return NextResponse.json(
      { error: 'event_id is required' },
      { status: 400 }
    )
  }

  // Generate unique code
  const code = nanoid(10)

  const { data: referralCode, error } = await supabase
    .from('referral_codes')
    .insert({
      code,
      event_id,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ referralCode }, { status: 201 })
}
