'use client'

import { useEvent } from '@/lib/hooks/use-events'
import { useRSVPs, useCreateRSVP } from '@/lib/hooks/use-rsvps'
import { GradientButton } from '@/components/gradient-button'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Generate a random gradient based on event ID
const generateGradient = (id: string) => {
  const gradients = [
    'from-pink-500 to-yellow-500',
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-rose-500 to-orange-500',
    'from-cyan-500 to-blue-500',
  ]

  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length
  return gradients[index]
}

const formatEventDate = (dateStr: string, timeStr: string | null) => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }

  const formattedDate = date.toLocaleDateString('en-US', options)

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${formattedDate} at ${displayHour}:${minutes} ${ampm}`
  }

  return formattedDate
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: rsvps = [], isLoading: rsvpsLoading } = useRSVPs(eventId)
  const createRSVP = useCreateRSVP()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRSVP, setUserRSVP] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (currentUserId && rsvps.length > 0) {
      const myRSVP = rsvps.find(rsvp => rsvp.user_id === currentUserId)
      setUserRSVP(myRSVP)
    }
  }, [currentUserId, rsvps])

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }

    try {
      await createRSVP.mutateAsync({
        event_id: eventId,
        status,
        user_id: currentUserId,
      })
    } catch (error) {
      console.error('Failed to RSVP:', error)
    }
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button skeleton */}
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>

          {/* Event card skeleton */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Gradient header skeleton */}
            <div className="h-64 bg-gray-200 animate-pulse"></div>

            {/* Content skeleton */}
            <div className="p-8">
              {/* Title skeleton */}
              <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-6"></div>

              {/* Event details skeleton */}
              <div className="space-y-4 mb-8">
                {/* Date & Time */}
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse mr-3 mt-1"></div>
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse mr-3 mt-1"></div>
                  <div className="flex-1">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Attendees */}
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse mr-3 mt-1"></div>
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Description skeleton */}
              <div className="mb-8">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* RSVP section skeleton */}
              <div className="border-t border-gray-200 pt-6">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="flex flex-wrap gap-3">
                  <div className="h-12 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 w-28 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
            <Link href="/events" className="text-pink-600 hover:text-pink-700">
              ← Back to events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const gradient = generateGradient(event.id)
  const goingCount = rsvps.filter(rsvp => rsvp.status === 'going').length
  const maybeCount = rsvps.filter(rsvp => rsvp.status === 'maybe').length

  // Check if event is in the past
  const isPastEvent = () => {
    const now = new Date()
    const eventDate = new Date(event.event_date)

    if (event.event_time) {
      const [hours, minutes] = event.event_time.split(':')
      eventDate.setHours(parseInt(hours), parseInt(minutes))
    } else {
      eventDate.setHours(23, 59, 59)
    }

    return eventDate < now
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/events"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to events
        </Link>

        {/* Event card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className={`h-64 bg-gradient-to-br ${gradient}`} />

          {/* Content */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {event.title}
            </h1>

            {/* Event details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="text-lg text-gray-900">
                    {formatEventDate(event.event_date, event.event_time)}
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="text-lg text-gray-900">{event.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Attendees</div>
                  <div className="text-lg text-gray-900">
                    {rsvpsLoading ? 'Loading...' : (
                      <>
                        {goingCount} going{maybeCount > 0 && `, ${maybeCount} maybe`}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* RSVP section */}
            <div className="border-t border-gray-200 pt-6">
              {isPastEvent() ? (
                <div className="text-center bg-gray-100 rounded-lg p-8">
                  <p className="text-gray-600 text-lg font-medium">Event already passed</p>
                  <p className="text-gray-500 mt-2">
                    {goingCount} {goingCount === 1 ? 'person' : 'people'} went to this event
                  </p>
                </div>
              ) : currentUserId ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {userRSVP ? 'Update your RSVP' : 'Will you attend?'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleRSVP('going')}
                      disabled={createRSVP.isPending}
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
                      disabled={createRSVP.isPending}
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
                      disabled={createRSVP.isPending}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        userRSVP?.status === 'not_going'
                          ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-pink-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ✗ Can't Go
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center bg-gray-50 rounded-lg p-8">
                  <p className="text-gray-600 mb-4">Please sign in to RSVP to this event</p>
                  <GradientButton href="/auth/login">
                    Sign In
                  </GradientButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
