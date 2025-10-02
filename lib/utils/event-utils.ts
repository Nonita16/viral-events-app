// Generate a random gradient based on event ID
export const generateGradient = (id: string) => {
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

// Format event date with optional time
export const formatEventDate = (dateStr: string, timeStr: string | null, includeWeekday = true) => {
  // Parse date parts to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  const options: Intl.DateTimeFormatOptions = {
    ...(includeWeekday && { weekday: 'long' }),
    month: includeWeekday ? 'long' : 'short',
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

// Check if event is in the past
export const isPastEvent = (eventDate: string, eventTime: string | null) => {
  const now = new Date()

  // Parse date parts to avoid timezone issues
  const [year, month, day] = eventDate.split('-').map(Number)
  const eventDateTime = new Date(year, month - 1, day)

  if (eventTime) {
    const [hours, minutes] = eventTime.split(':').map(Number)
    eventDateTime.setHours(hours, minutes, 0, 0)
  } else {
    // If no time specified, event is considered past at end of day
    eventDateTime.setHours(23, 59, 59, 999)
  }

  return eventDateTime < now
}
