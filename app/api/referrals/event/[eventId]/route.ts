import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/referrals/event/[eventId] - Get referral codes for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const supabase = await createClient()
  const { eventId } = await params

  const { data: referralCodes, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ referralCodes })
}
