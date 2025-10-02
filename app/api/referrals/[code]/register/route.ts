import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/referrals/[code]/register - Register user via referral
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
    })

  if (registrationError) {
    // If already registered, continue (idempotent)
    // Unique constraint violation is expected for duplicate registrations
    if (registrationError.code === '23505') {
      return NextResponse.json({
        success: true,
        message: 'Already registered via this referral code'
      }, { status: 200 })
    }
    return NextResponse.json({ error: registrationError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Successfully registered via referral code'
  }, { status: 201 })
}
