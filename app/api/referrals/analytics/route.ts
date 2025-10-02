import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/referrals/analytics - Get referral analytics for current user
export async function GET() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's referral code
  const { data: referralCode, error: codeError } = await supabase
    .from('referral_codes')
    .select('id, code, created_at')
    .eq('created_by', user.id)
    .single()

  if (codeError || !referralCode) {
    // No referral code yet
    return NextResponse.json({
      totalClicks: 0,
      totalSignups: 0,
      totalConversion: 0,
    })
  }

  // Get clicks count
  const { count: clicksCount } = await supabase
    .from('referral_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('referral_code_id', referralCode.id)

  // Get registrations count
  const { count: registrationsCount } = await supabase
    .from('referral_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('referral_code_id', referralCode.id)

  const totalClicks = clicksCount || 0
  const totalSignups = registrationsCount || 0
  const totalConversion = totalClicks > 0 ? (totalSignups / totalClicks) * 100 : 0

  return NextResponse.json({
    code: referralCode.code,
    totalClicks,
    totalSignups,
    totalConversion,
  })
}
