'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/lib/types/database.types'

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

// GET all events
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error('Failed to fetch events')
      const data = await res.json()
      return data.events as Event[]
    },
  })
}

// GET event by ID
export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`)
      if (!res.ok) throw new Error('Failed to fetch event')
      const data = await res.json()
      return data.event as Event
    },
    enabled: !!id,
  })
}

// GET user's created events
export function useMyEvents() {
  return useQuery({
    queryKey: ['events', 'my'],
    queryFn: async () => {
      const res = await fetch('/api/events/my')
      if (!res.ok) throw new Error('Failed to fetch my events')
      const data = await res.json()
      return data.events as Event[]
    },
  })
}

// GET latest 3 events
export function useLatestEvents() {
  return useQuery({
    queryKey: ['events', 'latest'],
    queryFn: async () => {
      const res = await fetch('/api/events/latest')
      if (!res.ok) throw new Error('Failed to fetch latest events')
      const data = await res.json()
      return data.events as Event[]
    },
  })
}

// CREATE event
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newEvent: EventInsert) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })
      if (!res.ok) throw new Error('Failed to create event')
      const data = await res.json()
      return data.event as Event
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// UPDATE event
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EventUpdate }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update event')
      const data = await res.json()
      return data.event as Event
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    },
  })
}

// DELETE event
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
