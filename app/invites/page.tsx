import { createClient } from '@/lib/supabase/server'
import { InvitesClient } from '@/components/invites-client'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Referral Code | Viral Events',
  description: 'Share your unique referral code and grow your network. Track clicks, signups, and conversions.',
  openGraph: {
    title: 'My Referral Code | Viral Events',
    description: 'Share your unique referral code and grow your network. Track clicks, signups, and conversions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Referral Code | Viral Events',
    description: 'Share your unique referral code and grow your network. Track clicks, signups, and conversions.',
  },
}

export default async function InvitesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get user's referral code
  const { data: existingCode } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('created_by', user.id)
    .single()

  const referralCode = existingCode?.code || null

  // Fetch analytics (direct Supabase query for server component)
  let analytics = {
    totalClicks: 0,
    totalSignups: 0,
    totalConversion: 0,
  }

  if (referralCode) {
    // Get referral code ID
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', referralCode)
      .single()

    if (codeData) {
      // Get clicks count
      const { count: clicksCount } = await supabase
        .from('referral_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('referral_code_id', codeData.id)

      // Get registrations count
      const { count: registrationsCount } = await supabase
        .from('referral_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('referral_code_id', codeData.id)

      const totalClicks = clicksCount || 0
      const totalSignups = registrationsCount || 0

      analytics = {
        totalClicks,
        totalSignups,
        totalConversion: totalClicks > 0 ? (totalSignups / totalClicks) * 100 : 0,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Referral Code
          </h1>
          <p className="text-lg text-gray-600">
            Share your unique code and watch your network grow
          </p>
        </div>

        <InvitesClient referralCode={referralCode} analytics={analytics} />
      </div>
    </div>
  )
}
