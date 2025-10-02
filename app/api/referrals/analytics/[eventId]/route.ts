import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/referrals/analytics/[eventId] - Get referral analytics for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient()
  const { eventId } = await params

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is the event creator
  const { data: event } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', eventId)
    .single()

  if (!event || event.created_by !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get all referral codes for this event with registration counts
  const { data: referralCodes, error: codesError } = await supabase
    .from('referral_codes')
    .select('id, code, created_at')
    .eq('event_id', eventId)

  if (codesError) {
    return NextResponse.json({ error: codesError.message }, { status: 500 })
  }

  // Get clicks and registration counts for each referral code
  const analyticsPromises = referralCodes.map(async (code) => {
    const { count: clicksCount } = await supabase
      .from('referral_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('referral_code_id', code.id)

    const { count: registrationsCount } = await supabase
      .from('referral_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('referral_code_id', code.id)

    const clicks = clicksCount || 0
    const signups = registrationsCount || 0
    const conversion = clicks > 0 ? (signups / clicks) * 100 : 0

    return {
      ...code,
      clicks,
      signups,
      conversion,
    }
  })

  const analytics = await Promise.all(analyticsPromises)

  // Calculate totals
  const totalClicks = analytics.reduce((sum, code) => sum + code.clicks, 0)
  const totalSignups = analytics.reduce((sum, code) => sum + code.signups, 0)
  const totalConversion = totalClicks > 0 ? (totalSignups / totalClicks) * 100 : 0

  return NextResponse.json({
    analytics,
    totalClicks,
    totalSignups,
    totalConversion,
  })
}
