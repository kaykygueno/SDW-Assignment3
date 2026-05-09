import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/bookings
// Get all bookings for the logged-in user
export async function GET() {
    try {
        // Get current user from session cookie
        const session = await getSession();

        // User must be logged in
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user bookings with event details
        const [rows] = await pool.execute(
            `SELECT
                bookings.id AS booking_id,
                events.id AS event_id,
                events.title,
                events.event_date,
                events.location,
                bookings.booking_date
             FROM bookings
             JOIN events ON bookings.event_id = events.id
             WHERE bookings.user_id = ?
             ORDER BY events.event_date ASC`,
            [session.id]
        );

        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error('GET /api/bookings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

// POST /api/bookings
// Create a new booking for the logged-in attendee
export async function POST(request) {
    try {
        // Get current user from session cookie
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'You must be logged in to create a booking.' },
                { status: 401 }
            );
        }

        // Only attendees can book events
        if (session.role !== 'attendee') {
            return NextResponse.json(
                { error: 'Only attendees can book events.' },
                { status: 403 }
            );
        }

        const userId = session.id;

        // Read event id from request body and validate
        const { event_id } = await request.json();

        if (!event_id || isNaN(parseInt(event_id)) || parseInt(event_id) < 1) {
            return NextResponse.json(
                { error: 'Event ID is required and must be a positive integer.' },
                { status: 400 }
            );
        }

        const eventId = parseInt(event_id);

        // Check if event exists and read its capacity
        const [events] = await pool.execute(
            'SELECT id, capacity FROM events WHERE id = ?',
            [eventId]
        );

        if (events.length === 0) {
            return NextResponse.json(
                { error: 'Event not found.' },
                { status: 404 }
            );
        }

        const eventCapacity = events[0].capacity;

        // Prevent duplicate bookings for the same user and event
        const [duplicateRows] = await pool.execute(
            'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
            [userId, eventId]
        );

        if (duplicateRows.length > 0) {
            return NextResponse.json(
                { error: 'You have already booked this event.' },
                { status: 400 }
            );
        }

        // Count current bookings and stop if event is full
        const [bookingCountRows] = await pool.execute(
            'SELECT COUNT(*) as count FROM bookings WHERE event_id = ?',
            [eventId]
        );

        const currentBookings = bookingCountRows[0].count;

        if (currentBookings >= eventCapacity) {
            return NextResponse.json(
                { error: 'Event is fully booked.' },
                { status: 400 }
            );
        }

        // Create booking record
        const [result] = await pool.execute(
            'INSERT INTO bookings (user_id, event_id, booking_date) VALUES (?, ?, CURRENT_TIMESTAMP)',
            [userId, eventId]
        );

        return NextResponse.json(
            { message: 'Booking created successfully.', booking_id: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/bookings error:', error);
        return NextResponse.json(
            { error: 'An error occurred while creating the booking.' },
            { status: 500 }
        );
    }
}