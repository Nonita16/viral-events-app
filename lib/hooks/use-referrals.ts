'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/lib/types/database.types'

type ReferralCode = Database['public']['Tables']['referral_codes']['Row']

interface ReferralAnalytics {
  id: string
  code: string
  created_at: string
  registrations_count: number
}

// GET referral codes for an event
export function useReferralCodes(eventId: string) {
  return useQuery({
    queryKey: ['referrals', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/referrals/event/${eventId}`)
      if (!res.ok) throw new Error('Failed to fetch referral codes')
      const data = await res.json()
      return data.referralCodes as ReferralCode[]
    },
    enabled: !!eventId,
  })
}

// VALIDATE referral code
export function useReferralCode(code: string) {
  return useQuery({
    queryKey: ['referrals', 'code', code],
    queryFn: async () => {
      const res = await fetch(`/api/referrals/${code}`)
      if (!res.ok) throw new Error('Invalid referral code')
      const data = await res.json()
      return data.referralCode
    },
    enabled: !!code,
  })
}

// GENERATE referral code
export function useGenerateReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event_id: string) => {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id }),
      })
      if (!res.ok) throw new Error('Failed to generate referral code')
      const data = await res.json()
      return data.referralCode as ReferralCode
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['referrals', data.event_id] })
    },
  })
}

// REGISTER via referral code
export function useRegisterWithReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/referrals/${code}/register`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to register with referral code')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] })
    },
  })
}

// GET referral analytics for an event
export function useReferralAnalytics(eventId: string) {
  return useQuery({
    queryKey: ['referrals', 'analytics', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/referrals/analytics/${eventId}`)
      if (!res.ok) throw new Error('Failed to fetch referral analytics')
      const data = await res.json()
      return {
        analytics: data.analytics as ReferralAnalytics[],
        totalRegistrations: data.totalRegistrations as number,
      }
    },
    enabled: !!eventId,
  })
}
