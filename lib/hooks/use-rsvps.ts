'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/lib/types/database.types'

type RSVP = Database['public']['Tables']['rsvps']['Row']

// GET RSVPs for an event
export function useRSVPs(eventId: string) {
  return useQuery({
    queryKey: ['rsvps', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/rsvps/event/${eventId}`)
      if (!res.ok) throw new Error('Failed to fetch RSVPs')
      const data = await res.json()
      return data.rsvps as RSVP[]
    },
    enabled: !!eventId,
  })
}

// GET user's RSVPs
export function useMyRSVPs() {
  return useQuery({
    queryKey: ['rsvps', 'my'],
    queryFn: async () => {
      const res = await fetch('/api/rsvps/my')
      if (!res.ok) throw new Error('Failed to fetch my RSVPs')
      const data = await res.json()
      return data.rsvps as RSVP[]
    },
  })
}

// CREATE or UPDATE RSVP
export function useCreateRSVP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      event_id,
      status,
    }: {
      event_id: string
      status: 'going' | 'maybe' | 'not_going'
    }) => {
      const res = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id, status }),
      })
      if (!res.ok) throw new Error('Failed to create RSVP')
      const data = await res.json()
      return data.rsvp as RSVP
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', data.event_id] })
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'my'] })
    },
  })
}

// DELETE RSVP
export function useDeleteRSVP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rsvps/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete RSVP')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvps'] })
    },
  })
}
