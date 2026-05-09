// app/events/page.js
// Events page. Guests and attendees can browse events.
// Organisers/admins can also create and manage events.

import { getSession } from '@/lib/auth';
import EventsPageClient from '@/app/components/EventsPageClient';

export default async function EventsPage() {
  const session = await getSession();
  const role = session?.role ?? null;

  const canManageEvents = role === 'organiser' || role === 'admin';

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <section className="mb-10">
        <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">
          2026 Calendar
        </p>

        <h1 className="text-3xl font-black mb-3">
          {canManageEvents ? 'Manage Race Events' : 'Upcoming Races'}
        </h1>

        <p className="text-gray-400 max-w-2xl">
          {canManageEvents
            ? 'Create, edit and manage Formula 1 ticket events from one place.'
            : 'Browse upcoming Grand Prix events and book your tickets.'}
        </p>
      </section>

      <EventsPageClient role={role} />
    </main>
  );
}