// app/admin/page.js — Admin panel (Server Component)
// Defence-in-depth: verify role server-side even though proxy.js already gates this route.
import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth';

export default async function AdminPage() {
  // Read and verify the JWT session on the server
  const session = await getSession();

  // Redirect non-admins away (catches any edge cases the proxy misses)
  if (!session || session.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">Admin</p>
      <h1 className="text-3xl font-black mb-4">Admin Panel</h1>
      <p className="text-gray-400 mb-6">Logged in as <span className="text-white font-medium">{session.email}</span> &mdash; role: <span className="text-[#e10600] font-bold">{session.role}</span></p>
      <p className="text-gray-400">Manage events, users, and bookings here.</p>
    </main>
  );
}
