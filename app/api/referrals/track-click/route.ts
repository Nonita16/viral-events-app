import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/referrals/track-click - Track referral link click
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'code is required' },
        { status: 400 }
      )
    }

    // Get current user (might be anonymous)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Authentication error', details: userError.message }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // Find the referral code
    const { data: referralCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single()

    if (codeError) {
      console.error('Referral code lookup error:', codeError)
      return NextResponse.json({ error: 'Invalid referral code', details: codeError.message }, { status: 404 })
    }

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    // Check if this anon user already clicked this link
    const { data: existingClick, error: checkError } = await supabase
      .from('referral_clicks')
      .select('id')
      .eq('referral_code_id', referralCode.id)
      .eq('anon_user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Check existing click error:', checkError)
    }

    if (existingClick) {
      // Already tracked, don't double-count
      return NextResponse.json({ message: 'Click already tracked' })
    }

    // Track the click
    const { error: insertError } = await supabase
      .from('referral_clicks')
      .insert({
        referral_code_id: referralCode.id,
        anon_user_id: user.id,
      })

    if (insertError) {
      console.error('Insert click error:', insertError)
      return NextResponse.json({ error: 'Failed to track click', details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Click tracked successfully' })
  } catch (error) {
    console.error('Unexpected error in track-click:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
