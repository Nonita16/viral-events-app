import Link from 'next/link'
import { Database } from '@/lib/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

interface EventCardProps {
  event: Event
  isUserEvent?: boolean
  attendeeCounts?: { going: number; maybe: number }
}

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

  // Use event ID to consistently select the same gradient
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length
  return gradients[index]
}

const formatEventDate = (dateStr: string, timeStr: string | null) => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
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

export function EventCard({ event, isUserEvent = false, attendeeCounts }: EventCardProps) {
  const gradient = generateGradient(event.id)

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
    <Link
      href={`/events/${event.id}`}
      className="group block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Gradient Header */}
      <div className={`h-48 bg-gradient-to-br ${gradient} relative`}>
        {isUserEvent && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-900 shadow-sm">
              Your Event
            </span>
          </div>
        )}
        {attendeeCounts && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {attendeeCounts.going} {isPastEvent() ? 'went' : 'going'}{attendeeCounts.maybe > 0 && !isPastEvent() && ` · ${attendeeCounts.maybe} maybe`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatEventDate(event.event_date, event.event_time)}
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
