import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// POST /api/referrals - Generate referral code for user
export async function POST() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for anonymous users
  if (user.is_anonymous) {
    return NextResponse.json(
      { error: 'Full authentication required' },
      { status: 401 }
    )
  }

  // Check if user already has a referral code
  const { data: existingCode } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('created_by', user.id)
    .single()

  if (existingCode) {
    return NextResponse.json({ referralCode: existingCode }, { status: 200 })
  }

  // Generate unique code with retry logic
  let attempts = 0
  let referralCode = null

  while (!referralCode && attempts < 3) {
    const code = nanoid(10)
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        code,
        created_by: user.id,
      })
      .select()
      .single()

    if (!error) {
      referralCode = data
    } else if (error.code !== '23505') {
      // Not a unique violation - real error
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    attempts++
  }

  if (!referralCode) {
    return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 })
  }

  return NextResponse.json({ referralCode }, { status: 201 })
}
