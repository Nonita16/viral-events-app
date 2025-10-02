import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Only allow in development
const isDevelopment = process.env.NODE_ENV === 'development'

const eventTitles = [
  'Summer Music Festival',
  'Tech Conference 2025',
  'Food & Wine Tasting',
  'Art Gallery Opening',
  'Charity Run Marathon',
  'Startup Pitch Night',
  'Jazz Concert Evening',
  'Photography Workshop',
  'Yoga Retreat Weekend',
  'Cooking Masterclass',
  'Book Club Meetup',
  'Film Festival Premiere',
  'Gaming Tournament',
  'Fashion Show Gala',
  'Comedy Night Live',
  'Networking Mixer',
  'Dance Party Extravaganza',
  'Craft Beer Festival',
  'Science Fair Exhibition',
  'Poetry Slam Night',
]

const descriptions = [
  'Join us for an unforgettable experience with amazing people and great vibes!',
  'Don\'t miss out on this exciting opportunity to connect and learn.',
  'A fantastic event you won\'t want to miss. Limited spots available!',
  'Come celebrate with us and make lasting memories.',
  'Experience something truly special at this one-of-a-kind gathering.',
  'Bring your friends and family for a day of fun and entertainment.',
  'An exclusive event featuring top talent and amazing performances.',
  'Network with like-minded individuals and expand your horizons.',
  'Enjoy great food, music, and company at this spectacular event.',
  'A unique opportunity to explore, learn, and have fun!',
]

const locations = [
  'Central Park, New York, NY',
  'Golden Gate Park, San Francisco, CA',
  'Grant Park, Chicago, IL',
  'Discovery Green, Houston, TX',
  'Boston Common, Boston, MA',
  'Balboa Park, San Diego, CA',
  'Millennium Park, Chicago, IL',
  'Piedmont Park, Atlanta, GA',
  'Gas Works Park, Seattle, WA',
  'Zilker Park, Austin, TX',
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomDate(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

function getRandomTime(): string {
  const hour = Math.floor(Math.random() * 12) + 9 // 9 AM to 8 PM
  const minute = Math.random() < 0.5 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}:00`
}

export async function POST(request: Request) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const events = []

    // Generate 10 past events (1-30 days ago)
    for (let i = 0; i < 10; i++) {
      const daysAgo = -Math.floor(Math.random() * 30) - 1
      events.push({
        created_by: user.id,
        title: getRandomElement(eventTitles),
        description: getRandomElement(descriptions),
        location: getRandomElement(locations),
        event_date: getRandomDate(daysAgo),
        event_time: getRandomTime(),
      })
    }

    // Generate 10 future events (1-60 days from now)
    for (let i = 0; i < 10; i++) {
      const daysAhead = Math.floor(Math.random() * 60) + 1
      events.push({
        created_by: user.id,
        title: getRandomElement(eventTitles),
        description: getRandomElement(descriptions),
        location: getRandomElement(locations),
        event_date: getRandomDate(daysAhead),
        event_time: getRandomTime(),
      })
    }

    // Insert all events
    const { data: insertedEvents, error } = await supabase
      .from('events')
      .insert(events)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Successfully generated 20 test events',
      count: insertedEvents?.length || 0,
      events: insertedEvents,
    })
  } catch (error) {
    console.error('Error generating test events:', error)
    return NextResponse.json(
      { error: 'Failed to generate test events' },
      { status: 500 }
    )
  }
}
