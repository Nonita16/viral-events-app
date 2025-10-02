"use client";

import { useEvents } from "@/lib/hooks/use-events";
import { useRSVPCounts } from "@/lib/hooks/use-rsvps";
import { EventCard } from "@/components/event-card";
import { GradientButton } from "@/components/gradient-button";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const { data: rsvpCounts = {} } = useRSVPCounts();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const eventsPerPage = 9;

  // Get current user
  useMemo(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Separate upcoming and past events
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    const upcoming: typeof events = [];
    const past: typeof events = [];

    events.forEach((event) => {
      const eventDate = new Date(event.event_date);

      // If event has time, combine date and time for comparison
      if (event.event_time) {
        const [hours, minutes] = event.event_time.split(":");
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      } else {
        // If no time, set to end of day
        eventDate.setHours(23, 59, 59);
      }

      if (eventDate >= now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    // Sort upcoming events by date ascending
    upcoming.sort((a, b) => {
      const dateA = new Date(
        a.event_date + (a.event_time ? `T${a.event_time}` : "")
      );
      const dateB = new Date(
        b.event_date + (b.event_time ? `T${b.event_time}` : "")
      );
      return dateA.getTime() - dateB.getTime();
    });

    // Sort past events by date descending (most recent first)
    past.sort((a, b) => {
      const dateA = new Date(
        a.event_date + (a.event_time ? `T${a.event_time}` : "")
      );
      const dateB = new Date(
        b.event_date + (b.event_time ? `T${b.event_time}` : "")
      );
      return dateB.getTime() - dateA.getTime();
    });

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  // Pagination for upcoming events
  const upcomingTotalPages = Math.ceil(upcomingEvents.length / eventsPerPage);
  const upcomingPaginatedEvents = upcomingEvents.slice(
    (upcomingPage - 1) * eventsPerPage,
    upcomingPage * eventsPerPage
  );

  // Pagination for past events
  const pastTotalPages = Math.ceil(pastEvents.length / eventsPerPage);
  const pastPaginatedEvents = pastEvents.slice(
    (pastPage - 1) * eventsPerPage,
    pastPage * eventsPerPage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Section Title Skeleton */}
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>

          {/* Event Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Image skeleton */}
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>

                {/* Content skeleton */}
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-4"></div>

                  {/* Date & Location skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Button skeleton */}
                  <div className="h-9 w-full bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
            <p className="mt-2 text-gray-600">
              Discover and join amazing events
            </p>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingPaginatedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isUserEvent={currentUserId === event.created_by}
                  attendeeCounts={rsvpCounts[event.id] || { going: 0, maybe: 0 }}
                />
              ))}
            </div>

            {/* Pagination for Upcoming Events */}
            {upcomingTotalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                  disabled={upcomingPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {upcomingPage} of {upcomingTotalPages}
                </span>
                <button
                  onClick={() =>
                    setUpcomingPage((p) => Math.min(upcomingTotalPages, p + 1))
                  }
                  disabled={upcomingPage === upcomingTotalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}

        {/* Past Events Section */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {pastPaginatedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isUserEvent={currentUserId === event.created_by}
                  attendeeCounts={rsvpCounts[event.id] || { going: 0, maybe: 0 }}
                />
              ))}
            </div>

            {/* Pagination for Past Events */}
            {pastTotalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPastPage((p) => Math.max(1, p - 1))}
                  disabled={pastPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {pastPage} of {pastTotalPages}
                </span>
                <button
                  onClick={() =>
                    setPastPage((p) => Math.min(pastTotalPages, p + 1))
                  }
                  disabled={pastPage === pastTotalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No events found</p>
            {currentUserId && (
              <GradientButton href="/events/create">
                Create First Event
              </GradientButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
