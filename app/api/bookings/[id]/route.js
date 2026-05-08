import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(request, { params }) {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const [rows] = await pool.query(
            "SELECT * FROM bookings WHERE id = ? AND user_id = ?",
            [id, user.id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        await pool.query(
            "DELETE FROM bookings WHERE id = ? AND user_id = ?",
            [id, user.id]
        );

        return NextResponse.json(
            { message: "Booking cancelled successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE BOOKING ERROR:", error);

        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}