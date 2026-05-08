// app/api/events/route.js — GET all events (public) | POST create event (organiser/admin only)
import pool from '../../../lib/db';
import { getSession } from '../../../lib/auth';

// ─── GET /api/events ────────────────────────────────────────────────────────
// Public endpoint — returns all upcoming events ordered by date.
export async function GET() {
    try {
        const [rows] = await pool.execute(`
            SELECT
                e.id,
                e.title,
                e.description,
                e.event_date,
                e.location,
                e.capacity,
                e.created_at,
                u.name  AS organiser_name
            FROM events e
            JOIN users  u ON u.id = e.organiser_id
            ORDER BY e.event_date ASC
        `);

        return Response.json(rows);
    } catch (err) {
        console.error('GET /api/events error:', err);
        return Response.json({ error: 'Failed to fetch events.' }, { status: 500 });
    }
}

// ─── POST /api/events ───────────────────────────────────────────────────────
// Restricted to role 'organiser' or 'admin'.
// Body: { title, description, event_date, location, capacity }
export async function POST(request) {
    // 1. Auth check — only organisers and admins may create events
    const session = await getSession();
    if (!session || (session.role !== 'organiser' && session.role !== 'admin')) {
        return Response.json(
            { error: 'Forbidden. Only organisers can create events.' },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { title, description, event_date, location, capacity } = body;

        // 2. Validation — required fields
        if (!title?.trim() || !event_date || !location?.trim()) {
            return Response.json(
                { error: 'title, event_date, and location are required.' },
                { status: 400 }
            );
        }

        if (!description?.trim()) {
            return Response.json(
                { error: 'description is required.' },
                { status: 400 }
            );
        }

        // 3. Validation — date must be in the future
        const eventDate = new Date(event_date);
        if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
            return Response.json(
                { error: 'event_date must be a valid date in the future.' },
                { status: 400 }
            );
        }

        // 4. Validation — capacity must be a positive integer
        const cap = parseInt(capacity, 10);
        if (isNaN(cap) || cap < 1) {
            return Response.json(
                { error: 'capacity must be a positive integer.' },
                { status: 400 }
            );
        }

        // 5. Insert — organiser_id comes from the verified JWT session
        const [result] = await pool.execute(
            `INSERT INTO events (organiser_id, title, description, event_date, location, capacity)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [session.id, title.trim(), description.trim(), event_date, location.trim(), cap]
        );

        return Response.json(
            {
                message: 'Event created successfully.',
                eventId: result.insertId,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error('POST /api/events error:', err);
        return Response.json({ error: 'Failed to create event.' }, { status: 500 });
    }
}
