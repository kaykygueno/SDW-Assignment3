// app/admin/page.js — Admin panel (Server Component)
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import AdminRoleSelect from '@/app/components/AdminRoleSelect';
import AdminDeleteBookingButton from '@/app/components/AdminDeleteBookingButton';

//--------------------------------------------------------------

export default async function AdminPage() {
  const session = await getSession();
      
      if (!session || session.role !== 'admin') {
        redirect('/dashboard?error=access_denied');
      }

//--------------------------------------------------------------

  const [users] = await pool.execute(
    `SELECT id, name, email, role
     FROM users
     ORDER BY id ASC`
  );

  const [events] = await pool.execute(
    `SELECT
        e.id,
        e.title,
        e.event_date,
        e.location,
        e.capacity,
        u.name AS organiser_name,
        COUNT(b.id) AS booked_count
     FROM events e
     LEFT JOIN users u ON e.organiser_id = u.id
     LEFT JOIN bookings b ON b.event_id = e.id
     GROUP BY e.id
     ORDER BY e.event_date ASC`
  );

  const [bookings] = await pool.execute(
    `SELECT
        b.id,
        b.created_at,
        users.name AS attendee_name,
        users.email AS attendee_email,
        events.title AS event_title
     FROM bookings b
     JOIN users ON b.user_id = users.id
     JOIN events ON b.event_id = events.id
     ORDER BY b.created_at DESC`
  );

//--------------------------------------------------------------

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">
        Admin</p>

      <h1 className="text-3xl font-black mb-2">Admin Panel</h1>

        <p className="text-gray-400 mb-8">
          Logged in as <span className="text-white font-medium">{session.email}</span>
          {' '}· role:{' '}
          <span className="text-[#e10600] font-bold">{session.role}</span>
        </p>

      <section className="mb-10">

          <h2 className="text-xl font-bold mb-4">Users</h2>

          <div className="overflow-x-auto rounded border border-white/10">

            <table className="w-full text-sm">
              <thead className="bg-white/10 text-gray-300">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <AdminRoleSelect userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

      </section>

      <section className="mb-10">

        <h2 className="text-xl font-bold mb-4">Events</h2>

        <div className="overflow-x-auto rounded border border-white/10">

          <table className="w-full text-sm">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Organiser</th>
                <th className="text-left p-3">Booked</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-white/10">
                  <td className="p-3">{event.id}</td>
                  <td className="p-3">{event.title}</td>
                  <td className="p-3">
                    {new Date(event.event_date).toLocaleDateString('en-IE', {
                      dateStyle: 'medium',
                    })}
                  </td>
                  <td className="p-3">{event.location}</td>
                  <td className="p-3">{event.organiser_name || 'Unknown'}</td>
                  <td className="p-3">
                    {event.booked_count} / {event.capacity}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Bookings</h2>

        <div className="overflow-x-auto rounded border border-white/10">

          <table className="w-full text-sm">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Attendee</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Event</th>
                <th className="text-left p-3">Booked At</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-white/10">
                  <td className="p-3">{booking.id}</td>
                  <td className="p-3">{booking.attendee_name}</td>
                  <td className="p-3">{booking.attendee_email}</td>
                  <td className="p-3">{booking.event_title}</td>
                  <td className="p-3">
                    {new Date(booking.created_at).toLocaleDateString('en-IE', {
                      dateStyle: 'medium',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

      </section>
      
    </main>
  );
}