import { createClient } from '@/lib/supabase/server'
import { EventRSVPSection } from '@/components/event-rsvp-section'
import { generateGradient, formatEventDate } from '@/lib/utils/event-utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  const formattedDate = formatEventDate(event.event_date, event.event_time)
  const description = event.description
    ? `${event.description.slice(0, 160)}...`
    : `Join us for ${event.title} on ${formattedDate}`

  return {
    title: `${event.title} | Viral Events`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      ...(event.location && { locale: event.location }),
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { id: eventId } = await params
  const supabase = await createClient()

  // Fetch event data
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id || null

  // Find user's RSVP if logged in
  const userRSVP = currentUserId
    ? (rsvps || []).find(rsvp => rsvp.user_id === currentUserId) || null
    : null

  const gradient = generateGradient(event.id)
  const goingCount = (rsvps || []).filter(rsvp => rsvp.status === 'going').length
  const maybeCount = (rsvps || []).filter(rsvp => rsvp.status === 'maybe').length

  // Generate JSON-LD structured data
  const startDate = event.event_time
    ? `${event.event_date}T${event.event_time}`
    : event.event_date

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.description && { description: event.description }),
    ...(event.location && {
      location: {
        '@type': 'Place',
        name: event.location,
        address: event.location,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/events/${event.id}`,
      validFrom: new Date().toISOString(),
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                    {goingCount} going{maybeCount > 0 && `, ${maybeCount} maybe`}
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
              <EventRSVPSection
                eventId={eventId}
                eventDate={event.event_date}
                eventTime={event.event_time}
                userRSVP={userRSVP}
                currentUserId={currentUserId}
                goingCount={goingCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
