// Client component used to cancel a user's booking
// Sends a DELETE request and refreshes the page after success

'use client';

import { useRouter } from "next/navigation";

export default function CancelBookingButton({bookingId}){
    const router = useRouter();

    async function handleCancel() {
        if(!confirm('Cancel this booking?')) return;

        console.log('Cancelling booking:', bookingId);

        const res = await fetch(`/api/bookings/${bookingId}`,{
            method: 'DELETE',
        });

        const data = await res.json();

        if (res.ok) {
            router.refresh();
        }else{
            alert(data.error || 'Failed to cancel booking.');
        }
    }

    return(
        
        <button onClick={handleCancel} className="mt-3 bg-gray-700 text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors">
            Cancel Booking
        </button>
    );
}