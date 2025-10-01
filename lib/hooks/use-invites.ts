'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database } from '@/lib/types/database.types'

type Invite = Database['public']['Tables']['invites']['Row']
type InviteInsert = Database['public']['Tables']['invites']['Insert']

// GET invites for an event
export function useInvites(eventId: string) {
  return useQuery({
    queryKey: ['invites', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/invites/event/${eventId}`)
      if (!res.ok) throw new Error('Failed to fetch invites')
      const data = await res.json()
      return data.invites as Invite[]
    },
    enabled: !!eventId,
  })
}

// SEND invite
export function useSendInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invite: InviteInsert) => {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      })
      if (!res.ok) throw new Error('Failed to send invite')
      const data = await res.json()
      return data.invite as Invite
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invites', data.event_id] })
    },
  })
}

// UPDATE invite status
export function useUpdateInviteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'accepted' | 'declined' }) => {
      const res = await fetch(`/api/invites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update invite status')
      const data = await res.json()
      return data.invite as Invite
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invites', data.event_id] })
    },
  })
}
