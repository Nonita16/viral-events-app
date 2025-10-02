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
      user_id,
    }: {
      event_id: string
      status: 'going' | 'maybe' | 'not_going'
      user_id?: string
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
    onMutate: async ({ event_id, status, user_id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['rsvps', event_id] })
      await queryClient.cancelQueries({ queryKey: ['rsvps', 'counts'] })

      // Snapshot previous values
      const previousRSVPs = queryClient.getQueryData<RSVP[]>(['rsvps', event_id])
      const previousCounts = queryClient.getQueryData<Record<string, { going: number; maybe: number }>>(['rsvps', 'counts'])

      if (user_id) {
        // Optimistically update RSVPs list
        queryClient.setQueryData<RSVP[]>(['rsvps', event_id], (old = []) => {
          const existingRSVP = old.find(rsvp => rsvp.user_id === user_id)

          if (existingRSVP) {
            // Update existing RSVP
            return old.map(rsvp =>
              rsvp.user_id === user_id
                ? { ...rsvp, status }
                : rsvp
            )
          } else {
            // Add new RSVP
            return [
              ...old,
              {
                id: 'temp-' + Date.now(),
                event_id,
                user_id,
                status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as RSVP
            ]
          }
        })

        // Optimistically update counts
        queryClient.setQueryData<Record<string, { going: number; maybe: number }>>(['rsvps', 'counts'], (old = {}) => {
          const currentCounts = old[event_id] || { going: 0, maybe: 0 }
          const existingRSVP = previousRSVPs?.find(rsvp => rsvp.user_id === user_id)

          let newGoing = currentCounts.going
          let newMaybe = currentCounts.maybe

          // Remove from old status count
          if (existingRSVP?.status === 'going') {
            newGoing = Math.max(0, newGoing - 1)
          } else if (existingRSVP?.status === 'maybe') {
            newMaybe = Math.max(0, newMaybe - 1)
          }

          // Add to new status count
          if (status === 'going') {
            newGoing += 1
          } else if (status === 'maybe') {
            newMaybe += 1
          }

          return {
            ...old,
            [event_id]: { going: newGoing, maybe: newMaybe }
          }
        })
      }

      return { previousRSVPs, previousCounts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRSVPs) {
        queryClient.setQueryData(['rsvps', variables.event_id], context.previousRSVPs)
      }
      if (context?.previousCounts) {
        queryClient.setQueryData(['rsvps', 'counts'], context.previousCounts)
      }
    },
    onSuccess: (data) => {
      // Refetch to ensure we have the latest server data
      queryClient.invalidateQueries({ queryKey: ['rsvps', data.event_id] })
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['rsvps', 'counts'] })
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

// GET RSVP counts for all events
export function useRSVPCounts() {
  return useQuery({
    queryKey: ['rsvps', 'counts'],
    queryFn: async () => {
      const res = await fetch('/api/rsvps/counts')
      if (!res.ok) throw new Error('Failed to fetch RSVP counts')
      const data = await res.json()
      return data.counts as Record<string, { going: number; maybe: number }>
    },
  })
}
