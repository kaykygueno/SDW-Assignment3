// app/events/page.js — Public events listing + organiser "Create Event" form
// Server Component: reads session server-side, passes role to the client layer.
import { getSession } from '@/lib/auth';
import EventsPageClient from '@/app/components/EventsPageClient';

export default async function EventsPage() {
  // Read session server-side — no auth required to view this page
  const session = await getSession();


  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">
        2026 Calendar
      </p>
      <h1 className="text-3xl font-black mb-8">Upcoming Races</h1>

      {/* Client component handles the form (organisers) + the live events list */}
      <EventsPageClient role={session?.role ?? null} />
    </main>
  );
}
