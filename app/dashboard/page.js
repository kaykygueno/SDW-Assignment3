// app/dashboard/page.js — User dashboard (Server Component)
// Reads the JWT session server-side to personalise the welcome message.
// Receives ?error=access_denied when proxy.js redirects an unauthorised user.
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function DashboardPage({ searchParams }) {
  // Read session from the httpOnly cookie — no client-side JS needed
  const session = await getSession();

  // Defensive guard: proxy.js should have redirected already, but belt-and-braces
  if (!session) {
    redirect('/login');
  }

  const { error } = await searchParams;

  // Role label map for a friendlier display
  const roleLabel = {
    admin: 'Administrator',
    organiser: 'Organiser',
    attendee: 'Attendee',
  }[session.role] ?? session.role;

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">Dashboard</p>
      <h1 className="text-3xl font-black mb-2">
        Welcome back, {session.name ?? session.email}!
      </h1>
      <p className="text-gray-400 mb-8">
        Logged in as <span className="text-white font-semibold">{session.email}</span>
        {' '}·{' '}
        <span className="text-[#e10600] font-semibold">{roleLabel}</span>
      </p>

      {/* Show a banner if the user was redirected due to insufficient permissions */}
      {error === 'access_denied' && (
        <div className="mb-6 rounded border border-red-600 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          You do not have permission to access that page.
        </div>
      )}

      {/* Role-specific quick-links */}
      {session.role === 'attendee' && (
        <div className="rounded border border-white/10 bg-white/5 px-6 py-5">
          <h2 className="font-bold mb-2">Your Bookings</h2>
          <p className="text-gray-400 text-sm">Head to <a href="/bookings" className="text-[#e10600] hover:underline">My Bookings</a> to view or manage your tickets.</p>
        </div>
      )}
      {session.role === 'organiser' && (
        <div className="rounded border border-white/10 bg-white/5 px-6 py-5">
          <h2 className="font-bold mb-2">Organiser Tools</h2>
          <p className="text-gray-400 text-sm">
            <a href="/organiser/create-event" className="text-[#e10600] hover:underline">Create a new event</a>
            {' '}or view{' '}
            <a href="/organiser/events" className="text-[#e10600] hover:underline">your events</a>.
          </p>
        </div>
      )}
      {session.role === 'admin' && (
        <div className="rounded border border-white/10 bg-white/5 px-6 py-5">
          <h2 className="font-bold mb-2">Admin Panel</h2>
          <p className="text-gray-400 text-sm">Go to <a href="/admin" className="text-[#e10600] hover:underline">Manage Users</a> to administer accounts.</p>
        </div>
      )}
    </main>
  );
}
