'use client';

import { useRouter } from 'next/navigation';

// Admin button used to delete any booking from the admin panel
export default function AdminDeleteBookingButton({ bookingId }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this booking?')) return;

    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete booking.');
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-800"
    >
      Delete
    </button>
  );
}