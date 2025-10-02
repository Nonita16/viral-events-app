'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGenerateReferral, useReferralAnalytics } from '@/lib/hooks/use-referrals'
import { GradientButton } from '@/components/gradient-button'
import { useRouter } from 'next/navigation'

export default function InvitesPage() {
  const router = useRouter()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [userReferralCode, setUserReferralCode] = useState<any>(null)
  const [isLoadingCode, setIsLoadingCode] = useState(true)

  const generateReferral = useGenerateReferral()

  useEffect(() => {
    const initializeUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setCurrentUserId(user.id)

      // Get user's first event to attach referral code
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('created_by', user.id)
        .limit(1)
        .single()

      let eventId = events?.id

      // If user has no events, create a placeholder event for referrals
      if (!eventId) {
        const { data: newEvent } = await supabase
          .from('events')
          .insert({
            created_by: user.id,
            title: 'My Referral Events',
            description: 'Events shared via my referral link',
            event_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single()

        eventId = newEvent?.id
      }

      // Get or create referral code
      if (eventId) {
        const { data: codes } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('event_id', eventId)
          .eq('created_by', user.id)
          .limit(1)

        if (codes && codes.length > 0) {
          setUserReferralCode(codes[0])
        } else {
          // Generate referral code
          try {
            const newCode = await generateReferral.mutateAsync(eventId)
            setUserReferralCode(newCode)
          } catch (error) {
            console.error('Failed to generate referral code:', error)
          }
        }
      }

      setIsLoadingCode(false)
    }

    initializeUser()
  }, [router, generateReferral])

  // Analytics data - we'll aggregate across all user's codes
  const { data: analytics, isLoading: analyticsLoading } = useReferralAnalytics(userReferralCode?.event_id || '')

  const handleCopyLink = () => {
    if (!userReferralCode) return
    const link = `${window.location.origin}/?ref=${userReferralCode.code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInviteViaEmail = () => {
    if (!userReferralCode) return
    const link = `${window.location.origin}/?ref=${userReferralCode.code}`
    const subject = 'Join me on My Viral Event!'
    const body = `Hey! Check out this awesome event platform I'm using. Join with my referral link: ${link}`

    // Open native email client
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (!currentUserId || isLoadingCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Referral Link Card Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 w-56 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Analytics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Email Invite Card Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-12 w-48 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
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

        {/* Referral Link Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Referral Link
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg px-6 py-2 flex items-center h-12">
              <code className="text-2xl font-bold text-pink-600">
                {userReferralCode ? userReferralCode.code : 'Loading...'}
              </code>
            </div>
            <GradientButton
              onClick={handleCopyLink}
              disabled={!userReferralCode}
              className="whitespace-nowrap h-12"
            >
              📋 {copied ? 'Copied!' : 'Copy Referral Link'}
            </GradientButton>
          </div>

          <p className="text-gray-600">
            Share this link with friends. When they sign up and RSVP to events, you'll get credit for the referrals and help your events go viral! 🚀
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Clicks */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">
              Clicks
            </div>
            {analyticsLoading ? (
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-4xl font-bold text-pink-600">
                {analytics?.totalClicks || 0}
              </div>
            )}
          </div>

          {/* Signups */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">
              Signups
            </div>
            {analyticsLoading ? (
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-4xl font-bold text-yellow-600">
                {analytics?.totalSignups || 0}
              </div>
            )}
          </div>

          {/* Conversion */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 uppercase mb-2">
              Conversion
            </div>
            {analyticsLoading ? (
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <div className="text-4xl font-bold text-purple-600">
                {analytics?.totalConversion ? `${analytics.totalConversion.toFixed(0)}%` : '0%'}
              </div>
            )}
          </div>
        </div>

        {/* Email Invite Button */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Invite Friends via Email
          </h2>

          <p className="text-gray-600 mb-4">
            Click the button below to open your email client with a pre-filled invitation message.
          </p>

          <GradientButton
            onClick={handleInviteViaEmail}
            disabled={!userReferralCode}
            className="w-full sm:w-auto"
          >
            📧 Send Invite via Email
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
