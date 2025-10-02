"use client";

import { EventCard } from "@/components/event-card";
import { GradientButton } from "@/components/gradient-button";
import { Database } from "@/lib/types/database.types";

type Event = Database['public']['Tables']['events']['Row']
type RSVPCounts = Record<string, { going: number; maybe: number }>

interface LatestEventsClientProps {
  events: Event[]
  rsvpCounts: RSVPCounts
}

export function LatestEventsClient({ events, rsvpCounts }: LatestEventsClientProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">
          No events yet. Be the first to create one!
        </p>
        <GradientButton href="/auth/sign-up">
          Get Started
        </GradientButton>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            attendeeCounts={rsvpCounts[event.id] || { going: 0, maybe: 0 }}
          />
        ))}
      </div>
      <div className="text-center mt-12">
        <GradientButton href="/events">
          View All Events
        </GradientButton>
      </div>
    </>
  );
}
