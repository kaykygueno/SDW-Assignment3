// app/dashboard/page.js
// Dashboard page based on the logged-in user role

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export default async function DashboardPage({ searchParams }) {
  // Get current user session
  const session = await getSession();

  // Redirect users who are not logged in
  if (!session) {
    redirect('/login');
  }

  const { error } = await searchParams;

  // Friendly role name
  const roleLabel = {
    admin: 'Administrator',
    organiser: 'Organiser',
    attendee: 'Attendee',
  }[session.role] ?? session.role;

  let organiserEvents = [];
  let stats = {
    events: 0,
    bookings: 0,
    users: 0,
  };

  // Attendee stats
  if (session.role === 'attendee') {
    const [[bookingStats]] = await pool.execute(
      `SELECT COUNT(*) AS bookings
       FROM bookings
       WHERE user_id = ?`,
      [session.id]
    );

    stats.bookings = bookingStats.bookings;
  }

  // Organiser stats and events
  if (session.role === 'organiser') {
    const [rows] = await pool.execute(
      `SELECT
          e.id,
          e.title,
          e.event_date,
          e.location,
          e.capacity,
          COUNT(b.id) AS booked_count
       FROM events e
       LEFT JOIN bookings b ON b.event_id = e.id
       WHERE e.organiser_id = ?
       GROUP BY e.id
       ORDER BY e.event_date ASC`,
      [session.id]
    );

    organiserEvents = rows;

    stats.events = organiserEvents.length;
    stats.bookings = organiserEvents.reduce(
      (total, event) => total + Number(event.booked_count),
      0
    );
  }

  // Admin global stats
  if (session.role === 'admin') {
    const [[userStats]] = await pool.execute(
      `SELECT COUNT(*) AS users FROM users`
    );

    const [[eventStats]] = await pool.execute(
      `SELECT COUNT(*) AS events FROM events`
    );

    const [[bookingStats]] = await pool.execute(
      `SELECT COUNT(*) AS bookings FROM bookings`
    );

    stats.users = userStats.users;
    stats.events = eventStats.events;
    stats.bookings = bookingStats.bookings;
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">
        Dashboard
      </p>

      <h1 className="text-3xl font-black mb-2">
        Welcome back, {session.name ?? session.email}!
      </h1>

      <p className="text-gray-400 mb-8">
        Logged in as{' '}
        <span className="text-white font-semibold">{session.email}</span>
        {' '}·{' '}
        <span className="text-[#e10600] font-semibold">{roleLabel}</span>
      </p>

      {error === 'access_denied' && (
        <div className="mb-6 rounded border border-red-600 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          You do not have permission to access that page.
        </div>
      )}

      {/* Stats cards */}
      <section className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
            Role
          </p>
          <p className="text-2xl font-black text-[#e10600]">
            {roleLabel}
          </p>
        </div>

        {session.role === 'attendee' && (
          <>
            <div className="rounded border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                My Bookings
              </p>
              <p className="text-3xl font-black">{stats.bookings}</p>
            </div>

            <div className="rounded border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Next Step
              </p>
              <p className="text-sm text-gray-300">Browse events</p>
            </div>
          </>
        )}

        {session.role === 'organiser' && (
          <>
            <div className="rounded border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                My Events
              </p>
              <p className="text-3xl font-black">{stats.events}</p>
            </div>

            <div className="rounded border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Total Bookings
              </p>
              <p className="text-3xl font-black">{stats.bookings}</p>
            </div>
          </>
        )}

        {session.role === 'admin' && (
          <>
            <div className="rounded border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Users
              </p>
              <p className="text-3xl font-black">{stats.users}</p>
            </div>

            <div className="rounded border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                Events / Bookings
              </p>
              <p className="text-3xl font-black">
                {stats.events} / {stats.bookings}
              </p>
            </div>
          </>
        )}
      </section>

      {/* Attendee dashboard */}
      {session.role === 'attendee' && (
        <div className="rounded border border-white/10 bg-white/5 px-6 py-5">
          <h2 className="font-bold mb-2">Your Tickets</h2>

          <p className="text-gray-400 text-sm mb-4">
            View your booked tickets or cancel bookings.
          </p>

          <div className="flex gap-3">
            <a
              href="/events"
              className="inline-block bg-[#e10600] text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-700"
            >
              Browse Events
            </a>

            <a
              href="/bookings"
              className="inline-block border border-white/20 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-white/10"
            >
              My Bookings
            </a>
          </div>
        </div>
      )}

      {/* Organiser dashboard */}
      {session.role === 'organiser' && (
        <section className="rounded border border-white/10 bg-white/5 px-6 py-5">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-bold text-xl">Organiser Dashboard</h2>
              <p className="text-gray-400 text-sm">
                Manage your events and bookings.
              </p>
            </div>

            <a
              href="/events"
              className="bg-[#e10600] text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-700"
            >
              Create Event
            </a>
          </div>

          {organiserEvents.length === 0 ? (
            <p className="text-gray-400 text-sm">
              You have not created any events yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/10 text-gray-300">
                  <tr>
                    <th className="text-left p-3">Event</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-left p-3">Bookings</th>
                    <th className="text-left p-3">Remaining</th>
                  </tr>
                </thead>

                <tbody>
                  {organiserEvents.map((event) => {
                    const booked = Number(event.booked_count);
                    const capacity = Number(event.capacity);
                    const remaining = capacity - booked;

                    return (
                      <tr key={event.id} className="border-t border-white/10">
                        <td className="p-3 font-medium">{event.title}</td>
                        <td className="p-3">
                          {new Date(event.event_date).toLocaleDateString(
                            'en-IE',
                            { dateStyle: 'medium' }
                          )}
                        </td>
                        <td className="p-3">{event.location}</td>
                        <td className="p-3">{booked} / {capacity}</td>
                        <td className="p-3">{remaining}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Admin dashboard */}
      {session.role === 'admin' && (
        <div className="rounded border border-white/10 bg-white/5 px-6 py-5">
          <h2 className="font-bold mb-2">Admin Panel</h2>

          <p className="text-gray-400 text-sm mb-4">
            Manage users, events and bookings.
          </p>

          <a
            href="/admin"
            className="inline-block bg-[#e10600] text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-700"
          >
            Open Admin Panel
          </a>
        </div>
      )}
    </main>
  );
}