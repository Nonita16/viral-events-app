'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ReferralTracker() {
  const searchParams = useSearchParams()
  const hasTracked = useRef(false)

  useEffect(() => {
    const referralCode = searchParams.get('ref')
    if (!referralCode || hasTracked.current) return

    const trackReferral = async () => {
      // Check if we already tracked this code in this session
      const trackedCode = sessionStorage.getItem('tracked_referral')
      if (trackedCode === referralCode) {
        // Store for signup attribution only
        localStorage.setItem('referral_code', referralCode)
        return
      }

      const supabase = createClient()

      // Try to get existing session
      let { data: { session } } = await supabase.auth.getSession()
      let userId: string | null = null
      let cookiesReady = false

      if (session) {
        // Use existing session user ID
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.is_anonymous) {
          userId = user.id
          cookiesReady = true
        } else if (user) {
          // Don't track for registered users
          return
        }
      }

      // If no session, create anonymous session
      if (!session) {
        try {
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) {
            return
          }
          if (!data.session || !data.user) {
            return
          }

          // Use the user ID from the response
          userId = data.user.id
          session = data.session

          // Cookies are not immediately available after signInAnonymously
          // We'll pass the user ID directly in the request body
          cookiesReady = false
        } catch {
          return
        }
      }

      if (!userId) {
        return
      }

      // Track the click
      try {
        const res = await fetch('/api/referrals/track-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: referralCode,
            // Pass user ID for immediate post-signin request (cookies not ready yet)
            anonUserId: cookiesReady ? undefined : userId
          }),
        })

        if (!res.ok) {
          return
        }

        await res.json()

        // Mark as tracked
        hasTracked.current = true
        sessionStorage.setItem('tracked_referral', referralCode)

        // Store referral code in localStorage for later attribution
        localStorage.setItem('referral_code', referralCode)
      } catch {
        // Silently fail - tracking is non-critical
      }
    }

    trackReferral()
  }, [searchParams])

  return null
}
