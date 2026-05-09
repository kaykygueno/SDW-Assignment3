// app/bookings/page.js — User ticket bookings (Server Component)
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import CancelBookingButton from '@/app/components/CancelBookingButton';

//----------------------------------------------------------
export default async function BookingsPage() {

  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const [bookings] = await pool.execute(
    `SELECT
        b.id AS booking_id,
        b.created_at AS booked_at,
        e.id AS event_id,
        e.title,
        e.description,
        e.event_date,
        e.location,
        e.capacity,
        u.name AS organiser_name
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     LEFT JOIN users u ON e.organiser_id = u.id
     WHERE b.user_id = ?
     ORDER BY e.event_date ASC`,
    [user.id]
  );

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">
        Bookings</p>

      <h1 className="text-3xl font-black mb-4">My Tickets</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400">
          You have not booked any Grand Prix tickets yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 mt-6">
          {bookings.map((booking) => (
            <li key={booking.booking_id} className="rounded border border-white/10 bg-white/5 p-5 flex flex-col gap-2">

              <h2 className="font-bold text-lg">{booking.title}</h2>

              <p className="text-xs text-gray-400"> {new Date(booking.event_date).toLocaleDateString('en-IE', {
                  dateStyle: 'medium', })}
                &nbsp;·&nbsp; {booking.location}</p>

              <p className="text-xs text-gray-500">
                Organised by {booking.organiser_name || 'Unknown organiser'}</p>

              {booking.description && (
                <p className="text-sm text-gray-300 mt-1">
                  {booking.description}
                </p>
              )}

              <p className="text-xs text-green-400 mt-2">
                Ticket booked on{' '}
                {new Date(booking.booked_at).toLocaleDateString('en-IE', {
                  dateStyle: 'medium'})}
              </p>

              <p className="text-xs text-yellow-400">
                Booking ID: {booking.booking_id}
              </p>

              <CancelBookingButton bookingId={booking.booking_id}/>

            </li>
            
          ))}
        </ul>
      )}
    </main>
  );
}