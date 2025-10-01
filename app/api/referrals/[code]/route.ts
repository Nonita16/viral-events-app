import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/referrals/[code] - Validate referral code and get event info
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = await createClient()
  const { code } = await params

  const { data: referralCode, error } = await supabase
    .from('referral_codes')
    .select('*, events(*)')
    .eq('code', code)
    .single()

  if (error || !referralCode) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
  }

  return NextResponse.json({ referralCode })
}
