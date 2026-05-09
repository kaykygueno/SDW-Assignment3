import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

// DELETE /api/bookings/[id]
// Cancel a booking owned by the logged-in user

export async function DELETE(request, { params }) {
    try {

        //Get current logged-in user from session cookie
        const user = await getSession();

        // User must be authenticated
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        //Get booking id from URL params
        const { id } = await params;

        //Check if booking exists and belongs to this user
        const [rows] = await pool.execute(
            "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
            [id, user.id]
        );

        // Booking not found
        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        //Delete booking from database
        await pool.execute(
            "DELETE FROM bookings WHERE id = ? AND user_id = ?",
            [id, user.id]
        );

        //Success response
        return NextResponse.json(
            { message: "Booking cancelled successfully" },
            { status: 200 }
        );

    } catch (error) {

        //Log server error
        console.error("DELETE BOOKING ERROR:", error);

        //Generic server error response
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}