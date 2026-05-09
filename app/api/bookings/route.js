import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";
import BookingsPage from "@/app/bookings/page";
// GET /api/bookings

// Get all bookings for the logged-in user

export async function GET() {

    try {

        // Get current user from session cookie
        const user = await getSession();

        // User must be logged in
        if (!user) {

            return NextResponse.json(
                { error: "Unauthorized" }, { status: 401 }
            );
        }

        // Get user bookings with event details
        const [rows] = await pool.query(
            `SELECT
                bookings.id AS booking_id,
                events.id AS event_id,
                events.title,
                events.event_date,
                events.location,
                bookings.created_at
             FROM bookings
             JOIN events
             ON bookings.event_id = events.id
             WHERE bookings.user_id = ?
             ORDER BY events.event_date ASC`,
            [user.id]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("GET BOOKINGS ERROR:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookings" }, { status: 500 }
        );
    }
}

// POST /api/bookings
// Create a new booking for the logged-in attendee
export async function POST(request) {

    try {

        // Get current user from session cookie
        const user = await getSession();

        // User must be logged in
        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in to create a booking." }, { status: 401 }
            );
        }

        // Only attendees can book events
        if (user.role !== "attendee") {
            return NextResponse.json(
                { error: "Only attendees can book events." }, { status: 403 }
            );
        }

        // Read event id from request body
        const { event_id } = await request.json();

        // Validate event id
        if (!event_id) {
            return NextResponse.json(
                { error: "Event ID is required." },
                { status: 400 }
            );
        }

        // Check if event exists
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

        // Count current bookings for this event
        const [countRows] = await pool.query(
            "SELECT COUNT(*) AS total FROM bookings WHERE event_id = ?",
            [event_id]
        );

        // Stop booking if event is full
        if (countRows[0].total >= events[0].capacity) {
            return NextResponse.json(
                { error: "Event is fully booked." },
                { status: 400 }
            );
        }

        // Create booking
        await pool.query(
            "INSERT INTO bookings (user_id, event_id) VALUES (?, ?)",
            [user.id, event_id]
        );

        return NextResponse.json(
            { message: "Booking created successfully." },
            { status: 201 }
        );
    } catch (error) {
        // Duplicate booking protection
        if (error.code === "ER_DUP_ENTRY") {
            return NextResponse.json(
                { error: "You have already booked this event." },
                { status: 400 }
            );
        }

        console.error("POST BOOKINGS ERROR:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the booking." },
            { status: 500 }
        );
    }
}