"use client";

import { useLatestEvents } from "@/lib/hooks/use-events";
import { EventCard } from "@/components/event-card";
import { GradientButton } from "@/components/gradient-button";

export function LatestEvents() {
  const { data: events, isLoading } = useLatestEvents();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse"
          >
            <div className="bg-gradient-to-br from-pink-400 to-yellow-400 h-48"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
          <EventCard key={event.id} event={event} />
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
