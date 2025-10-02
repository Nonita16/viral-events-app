'use client'

import { track } from '@vercel/analytics'
import { GradientButton } from '@/components/gradient-button'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface EventRSVPSectionProps {
  eventId: string
  eventDate: string
  eventTime: string | null
  userRSVP: { status: 'going' | 'maybe' | 'not_going' } | null
  currentUserId: string | null
  goingCount: number
}

export function EventRSVPSection({
  eventId,
  eventDate,
  eventTime,
  userRSVP,
  currentUserId,
  goingCount,
}: EventRSVPSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }

    // Track the RSVP event
    if (status === 'going') {
      track('rsvp_going', { event_id: eventId })
    } else if (status === 'maybe') {
      track('rsvp_maybe', { event_id: eventId })
    } else if (status === 'not_going') {
      track('rsvp_not_going', { event_id: eventId })
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/rsvps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventId,
            status,
            user_id: currentUserId,
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to RSVP')
        }

        router.refresh()
      } catch {
        // RSVP failed - could show error to user
      }
    })
  }

  // Check if event is in the past
  const isPast = () => {
    const now = new Date()
    const eventDateTime = new Date(eventDate)

    if (eventTime) {
      const [hours, minutes] = eventTime.split(':')
      eventDateTime.setHours(parseInt(hours), parseInt(minutes))
    } else {
      eventDateTime.setHours(23, 59, 59)
    }

    return eventDateTime < now
  }

  if (isPast()) {
    return (
      <div className="text-center bg-gray-100 rounded-lg p-8">
        <p className="text-gray-600 text-lg font-medium">Event already passed</p>
        <p className="text-gray-500 mt-2">
          {goingCount} {goingCount === 1 ? 'person' : 'people'} went to this event
        </p>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="text-center bg-gray-50 rounded-lg p-8">
        <p className="text-gray-600 mb-4">Please sign in to RSVP to this event</p>
        <GradientButton href="/auth/login">
          Sign In
        </GradientButton>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {userRSVP ? 'Update your RSVP' : 'Will you attend?'}
      </h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleRSVP('going')}
          disabled={isPending}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            userRSVP?.status === 'going'
              ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ✓ Going
        </button>
        <button
          onClick={() => handleRSVP('maybe')}
          disabled={isPending}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            userRSVP?.status === 'maybe'
              ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ? Maybe
        </button>
        <button
          onClick={() => handleRSVP('not_going')}
          disabled={isPending}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            userRSVP?.status === 'not_going'
              ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg'
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ✗ Can&apos;t Go
        </button>
      </div>
    </div>
  )
}
