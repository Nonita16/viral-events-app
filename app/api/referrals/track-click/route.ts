import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// POST /api/referrals/track-click - Track referral link click
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const body = await request.json()
    const { code, anonUserId } = body

    if (!code) {
      return NextResponse.json(
        { error: 'code is required' },
        { status: 400 }
      )
    }

    // Validate anonUserId format if provided (must be UUID)
    if (anonUserId && !isValidUUID(anonUserId)) {
      return NextResponse.json(
        { error: 'Invalid user identifier format' },
        { status: 400 }
      )
    }

    // Get current user (might be anonymous or might not exist)
    const { data: { user } } = await supabase.auth.getUser()

    // Determine the anonymous user ID
    let trackingUserId: string | null = null

    if (user?.is_anonymous) {
      // Prefer authenticated anonymous user ID from session
      trackingUserId = user.id

      // If client also sent anonUserId, verify they match
      // Still use session user ID as it's more authoritative even if mismatch
      if (anonUserId && anonUserId !== user.id) {
        // Session user ID takes precedence
      }
    } else if (anonUserId) {
      // Use client-provided anonymous user ID (from signInAnonymously response)
      // This handles the case where cookies aren't set yet
      trackingUserId = anonUserId
    } else if (user && !user.is_anonymous) {
      // Don't track clicks for fully registered users
      return NextResponse.json({ message: 'Click not tracked - user already registered' })
    }

    if (!trackingUserId) {
      return NextResponse.json({ error: 'Unable to track click - no user identifier' }, { status: 400 })
    }

    // Find the referral code
    const { data: referralCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single()

    if (codeError || !referralCode) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    // Check if click already tracked for this anonymous user
    const { data: existingClick } = await supabase
      .from('referral_clicks')
      .select('id')
      .eq('referral_code_id', referralCode.id)
      .eq('anon_user_id', trackingUserId)
      .maybeSingle()

    if (existingClick) {
      return NextResponse.json({ message: 'Click already tracked' })
    }

    // Track the click
    const { error: insertError } = await supabase
      .from('referral_clicks')
      .insert({
        referral_code_id: referralCode.id,
        anon_user_id: trackingUserId,
      })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Click tracked successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
