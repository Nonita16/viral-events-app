'use client'

import { useCreateEvent } from '@/lib/hooks/use-events'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useMemo } from 'react'
import { GradientButton } from '@/components/gradient-button'

export default function CreateEventPage() {
  const router = useRouter()
  const createEvent = useCreateEvent()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [eventDateTime, setEventDateTime] = useState('')
  const [error, setError] = useState('')

  // Get minimum datetime in YYYY-MM-DDTHH:MM format (current time in user's local timezone)
  const minDateTime = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }, [])

  const validateDateTime = () => {
    if (!eventDateTime) return false

    const selectedDateTime = new Date(eventDateTime)
    const now = new Date()

    if (selectedDateTime <= now) {
      setError('Event date and time must be in the future')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateDateTime()) {
      return
    }

    // Parse datetime-local value to extract date and time
    const dateTime = new Date(eventDateTime)
    const eventDate = dateTime.toISOString().split('T')[0] // YYYY-MM-DD
    const eventTime = `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}` // HH:MM

    try {
      await createEvent.mutateAsync({
        title,
        description: description || null,
        location: location || null,
        event_date: eventDate,
        event_time: eventTime,
      })

      router.push('/events')
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Create Event</h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Fill in the details for your event. Required fields are marked with an asterisk (*).
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label htmlFor="title" className="block text-sm/6 font-medium text-gray-900">
                  Event Title *
                </label>
                <div className="mt-2">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Awesome Event"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people what your event is about..."
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm/6"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">
                  Provide details about what attendees can expect.
                </p>
              </div>

              <div className="col-span-full">
                <label htmlFor="location" className="block text-sm/6 font-medium text-gray-900">
                  Location
                </label>
                <div className="mt-2">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="123 Main St, City, State"
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="event-datetime" className="block text-sm/6 font-medium text-gray-900">
                  Event Date & Time *
                </label>
                <div className="mt-2">
                  <input
                    id="event-datetime"
                    name="event-datetime"
                    type="datetime-local"
                    required
                    min={minDateTime}
                    value={eventDateTime}
                    onChange={(e) => {
                      setEventDateTime(e.target.value)
                      setError('')
                    }}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 sm:text-sm/6"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm/6 font-semibold text-gray-900"
          >
            Cancel
          </button>
          <GradientButton
            type="submit"
            disabled={createEvent.isPending}
          >
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </GradientButton>
        </div>
      </form>
    </div>
  )
}
