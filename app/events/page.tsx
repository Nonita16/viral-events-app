import { createClient } from '@/lib/supabase/server'
import { EventsList } from '@/components/events-list'
import { GradientButton } from '@/components/gradient-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Events | Viral Events',
  description: 'Discover and join amazing events. Browse upcoming and past events in your community.',
  openGraph: {
    title: 'All Events | Viral Events',
    description: 'Discover and join amazing events. Browse upcoming and past events in your community.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Events | Viral Events',
    description: 'Discover and join amazing events. Browse upcoming and past events in your community.',
  },
}

export default async function EventsPage() {
  const supabase = await createClient()

  // Fetch all events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  // Fetch RSVP counts for all events
  const { data: allRsvps } = await supabase
    .from('rsvps')
    .select('event_id, status')

  // Calculate RSVP counts per event
  const rsvpCounts = (allRsvps || []).reduce((acc, rsvp) => {
    if (!acc[rsvp.event_id]) {
      acc[rsvp.event_id] = { going: 0, maybe: 0 }
    }
    if (rsvp.status === 'going') acc[rsvp.event_id].going++
    if (rsvp.status === 'maybe') acc[rsvp.event_id].maybe++
    return acc
  }, {} as Record<string, { going: number; maybe: number }>)

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id || null

  // Separate upcoming and past events
  const now = new Date()
  const eventsList = events || []
  const upcomingEvents: typeof eventsList = []
  const pastEvents: typeof eventsList = []

  eventsList.forEach((event) => {
    const eventDate = new Date(event.event_date)

    // If event has time, combine date and time for comparison
    if (event.event_time) {
      const [hours, minutes] = event.event_time.split(':')
      eventDate.setHours(parseInt(hours), parseInt(minutes))
    } else {
      // If no time, set to end of day
      eventDate.setHours(23, 59, 59)
    }

    if (eventDate >= now) {
      upcomingEvents.push(event)
    } else {
      pastEvents.push(event)
    }
  })

  // Sort upcoming events by date ascending
  upcomingEvents.sort((a, b) => {
    const dateA = new Date(
      a.event_date + (a.event_time ? `T${a.event_time}` : '')
    )
    const dateB = new Date(
      b.event_date + (b.event_time ? `T${b.event_time}` : '')
    )
    return dateA.getTime() - dateB.getTime()
  })

  // Sort past events by date descending (most recent first)
  pastEvents.sort((a, b) => {
    const dateA = new Date(
      a.event_date + (a.event_time ? `T${a.event_time}` : '')
    )
    const dateB = new Date(
      b.event_date + (b.event_time ? `T${b.event_time}` : '')
    )
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
            <p className="mt-2 text-gray-600">
              Discover and join amazing events
            </p>
          </div>
        </div>

        {/* Events List */}
        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No events found</p>
            {currentUserId && (
              <GradientButton href="/events/create">
                Create First Event
              </GradientButton>
            )}
          </div>
        ) : (
          <EventsList
            upcomingEvents={upcomingEvents}
            pastEvents={pastEvents}
            rsvpCounts={rsvpCounts}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  )
}
