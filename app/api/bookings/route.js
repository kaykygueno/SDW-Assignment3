import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import BookingsPage from "@/app/bookings/page";

export async function GET() {
    try {
        const user = await getSession();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const [rows] = await pool.query(
            `SELECT
                events.id,
                events.title,
                events.event_date,
                events.location,
                bookings.created_at
             FROM bookings
             JOIN events ON bookings.event_id = events.id
             WHERE bookings.user_id = ?
             ORDER BY events.event_date ASC`,
            [user.id]
        );

        return NextResponse.json(rows);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await getSession(request);
        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in to create a booking." },
                { status: 401 }
            );
        }

        const { event_id } = await request.json();
        if (!event_id) {
            return NextResponse.json(
                { error: "Event ID is required." },
                { status: 400 }
            );
        }

        const [events] = await pool.query(
            "SELECT id, capacity FROM events WHERE id = ?",
            [event_id]
        );
        
        if (events.length === 0) {
            return NextResponse.json(
                { error: "Event not found." },
                { status: 404 }
            );
        }

        const [countRows] = await pool.query(
            "SELECT COUNT(*) AS count FROM bookings WHERE event_id = ?",
            [event_id]
        );
        
        if (countRows[0].total >= events[0].capacity) {
            return NextResponse.json(
                { error: "Event is fully booked." },
                { status: 400 }
            );
        }

        await pool.query(
            "INSERT INTO bookings (user_id, event_id) VALUES (?, ?)",
            [user.id, event_id]
        );

        return NextResponse.json(
            { message: "Booking created successfully." },
            { status: 201 }
        );
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") { // MySQL duplicate entry error code
                return NextResponse.json(
                    { error: "You have already booked this event." },
                    { status: 400 }
                );
            }

            console.error(error);
            return NextResponse.json(
                { error: "An error occurred while creating the booking." },
                { status: 500 }
            );
        }
}