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

      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      // If no session, create anonymous session
      if (!session) {
        try {
          const { error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('Failed to create anonymous session:', error)
            return
          }
        } catch (error) {
          console.error('Failed to create anonymous session:', error)
          return
        }
      }

      // Track the click
      try {
        const res = await fetch('/api/referrals/track-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: referralCode }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          console.error('Failed to track click:', errorData)
          return
        }

        // Mark as tracked
        hasTracked.current = true
        sessionStorage.setItem('tracked_referral', referralCode)

        // Store referral code in localStorage for later attribution
        localStorage.setItem('referral_code', referralCode)
      } catch (error) {
        console.error('Failed to track referral click:', error)
      }
    }

    trackReferral()
  }, [searchParams])

  return null
}
