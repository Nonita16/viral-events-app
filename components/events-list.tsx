'use client'

import { EventCard } from '@/components/event-card'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { track } from '@vercel/analytics'
import { Database } from '@/lib/types/database.types'

type Event = Database['public']['Tables']['events']['Row']
type RSVPCounts = Record<string, { going: number; maybe: number }>

interface EventsListProps {
  upcomingEvents: Event[]
  pastEvents: Event[]
  rsvpCounts: RSVPCounts
  currentUserId: string | null
}

export function EventsList({
  upcomingEvents,
  pastEvents,
  rsvpCounts,
  currentUserId,
}: EventsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const upcomingRef = useRef<HTMLElement>(null)
  const pastRef = useRef<HTMLElement>(null)
  const [pastEventsTracked, setPastEventsTracked] = useState(false)

  const eventsPerPage = 9
  const [upcomingPage, setUpcomingPage] = useState(
    parseInt(searchParams.get('upcoming') || '1')
  )
  const [pastPage, setPastPage] = useState(
    parseInt(searchParams.get('past') || '1')
  )

  // Scroll to upcoming section when page changes
  useEffect(() => {
    if (upcomingPage > 1 && upcomingRef.current) {
      upcomingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [upcomingPage])

  // Scroll to past section when page changes
  useEffect(() => {
    if (pastPage > 1 && pastRef.current) {
      pastRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [pastPage])

  // Update URL search params when pagination changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (upcomingPage > 1) params.set('upcoming', upcomingPage.toString())
    if (pastPage > 1) params.set('past', pastPage.toString())
    const queryString = params.toString()
    router.replace(queryString ? `?${queryString}` : '/events', { scroll: false })
  }, [upcomingPage, pastPage, router])

  // Track when past events section becomes visible
  useEffect(() => {
    if (!pastRef.current || pastEvents.length === 0 || pastEventsTracked) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !pastEventsTracked) {
            track('past_events_viewed')
            setPastEventsTracked(true)
          }
        })
      },
      { threshold: 0.1 } // Trigger when at least 10% of the section is visible
    )

    observer.observe(pastRef.current)

    return () => {
      observer.disconnect()
    }
  }, [pastEvents.length, pastEventsTracked])

  // Pagination for upcoming events
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / eventsPerPage)
  const upcomingPaginatedEvents = upcomingEvents.slice(
    (upcomingPage - 1) * eventsPerPage,
    upcomingPage * eventsPerPage
  )

  // Pagination for past events
  const pastTotalPages = Math.ceil(pastEvents.length / eventsPerPage)
  const pastPaginatedEvents = pastEvents.slice(
    (pastPage - 1) * eventsPerPage,
    pastPage * eventsPerPage
  )

  return (
    <>
      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section ref={upcomingRef} className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingPaginatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isUserEvent={currentUserId === event.created_by}
                attendeeCounts={rsvpCounts[event.id] || { going: 0, maybe: 0 }}
              />
            ))}
          </div>

          {/* Pagination for Upcoming Events */}
          {upcomingTotalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                disabled={upcomingPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {upcomingPage} of {upcomingTotalPages}
              </span>
              <button
                onClick={() =>
                  setUpcomingPage((p) => Math.min(upcomingTotalPages, p + 1))
                }
                disabled={upcomingPage === upcomingTotalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section ref={pastRef}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {pastPaginatedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isUserEvent={currentUserId === event.created_by}
                attendeeCounts={rsvpCounts[event.id] || { going: 0, maybe: 0 }}
              />
            ))}
          </div>

          {/* Pagination for Past Events */}
          {pastTotalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPastPage((p) => Math.max(1, p - 1))}
                disabled={pastPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pastPage} of {pastTotalPages}
              </span>
              <button
                onClick={() =>
                  setPastPage((p) => Math.min(pastTotalPages, p + 1))
                }
                disabled={pastPage === pastTotalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}
    </>
  )
}
