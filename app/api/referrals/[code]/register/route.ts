import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/referrals/[code]/register - Register user via referral and auto-RSVP
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = await createClient()
  const { code } = await params

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate referral code
  const { data: referralCode, error: referralError } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (referralError || !referralCode) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
  }

  // Create referral registration for analytics
  const { error: registrationError } = await supabase
    .from('referral_registrations')
    .insert({
      referral_code_id: referralCode.id,
      user_id: user.id,
      event_id: referralCode.event_id,
    })

  if (registrationError) {
    // If already registered, continue (idempotent)
    console.log('Registration already exists or error:', registrationError.message)
  }

  // Auto-RSVP the user to the event
  const { data: rsvp, error: rsvpError } = await supabase
    .from('rsvps')
    .upsert(
      {
        event_id: referralCode.event_id,
        user_id: user.id,
        status: 'going',
      },
      {
        onConflict: 'event_id,user_id',
      }
    )
    .select()
    .single()

  if (rsvpError) {
    return NextResponse.json({ error: rsvpError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    rsvp,
    event_id: referralCode.event_id
  }, { status: 201 })
}
