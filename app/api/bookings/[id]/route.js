import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * DELETE /api/bookings/[id]
 * Cancel a booking owned by the logged-in user
 * 
 * Verification: Ensures the requester is the booking owner
 * Execution: Removes the booking record from database
 * 
 * Responses:
 * 200: { message: "Booking cancelled successfully" }
 * 400: { error } — invalid booking ID
 * 401: { error } — not authenticated
 * 404: { error } — booking not found or doesn't belong to user
 * 500: { error } — database error
 */
export async function DELETE(request, { params }) {
    try {
        // Authentication: Get current logged-in user from session cookie
        const user = await getSession();

        // User must be authenticated
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get booking id from URL params and validate
        const { id } = await params;

        if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
            return NextResponse.json(
                { error: 'Booking ID must be a positive integer' },
                { status: 400 }
            );
        }

        const bookingId = parseInt(id);

        // VERIFICATION: Check if booking exists and belongs to this user
        const [rows] = await pool.execute(
            'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, user.id]
        );

        // Booking not found or doesn't belong to this user
        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // EXECUTION: Delete booking from database (with double protection)
        await pool.execute(
            'DELETE FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, user.id]
        );

        // Success response
        return NextResponse.json(
            { message: 'Booking cancelled successfully' },
            { status: 200 }
        );
    } catch (error) {
        // Log server error
        console.error('DELETE /api/bookings/[id] error:', error);

        // Generic server error response
        return NextResponse.json(
            { error: 'Failed to cancel booking' },
            { status: 500 }
        );
    }
}