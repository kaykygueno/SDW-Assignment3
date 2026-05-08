// app/api/events/[id]/route.js — GET, PUT, DELETE for a single event
// Security: ownership is verified server-side before any mutation.
import pool from '../../../../lib/db';
import { getSession } from '../../../../lib/auth';

// ── Helper: fetch event row and verify caller owns it ──────────────────────
async function getEventAndVerify(id, session) {
    const [rows] = await pool.execute(
        'SELECT * FROM events WHERE id = ? LIMIT 1',
        [id]
    );

    if (rows.length === 0) return { error: 'Event not found.', status: 404 };

    const event = rows[0];

    // Admins may act on any event; organisers only on their own
    const isOwner = event.organiser_id === session.id;
    const isAdmin = session.role === 'admin';

    if (!isOwner && !isAdmin) {
        return { error: 'Forbidden. You do not own this event.', status: 403 };
    }

    return { event };
}

// ─── GET /api/events/[id] ──────────────────────────────────────────────────
// Public — anyone can fetch a single event by id.
export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const [rows] = await pool.execute(
            `SELECT e.*, u.name AS organiser_name
             FROM events e
             JOIN users u ON u.id = e.organiser_id
             WHERE e.id = ? LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Event not found.' }, { status: 404 });
        }

        return Response.json(rows[0]);
    } catch (err) {
        console.error(`GET /api/events/${id} error:`, err);
        return Response.json({ error: 'Failed to fetch event.' }, { status: 500 });
    }
}

// ─── PUT /api/events/[id] ──────────────────────────────────────────────────
// Restricted to the event owner or admin.
// Body: { title, description, event_date, location, capacity }
export async function PUT(request, { params }) {
    const { id } = await params;

    // 1. Auth check
    const session = await getSession();
    if (!session || (session.role !== 'organiser' && session.role !== 'admin')) {
        return Response.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // 2. Ownership check
    const check = await getEventAndVerify(id, session);
    if (check.error) {
        return Response.json({ error: check.error }, { status: check.status });
    }

    try {
        const body = await request.json();
        const { title, description, event_date, location, capacity } = body;

        // 3. Validation
        if (!title?.trim() || !event_date || !location?.trim() || !description?.trim()) {
            return Response.json(
                { error: 'title, description, event_date, and location are required.' },
                { status: 400 }
            );
        }

        const eventDate = new Date(event_date);
        if (isNaN(eventDate.getTime()) || eventDate <= new Date()) {
            return Response.json(
                { error: 'event_date must be a valid date in the future.' },
                { status: 400 }
            );
        }

        const cap = parseInt(capacity, 10);
        if (isNaN(cap) || cap < 1) {
            return Response.json(
                { error: 'capacity must be a positive integer.' },
                { status: 400 }
            );
        }

        // 4. Update — only the columns the organiser is allowed to change
        await pool.execute(
            `UPDATE events
             SET title = ?, description = ?, event_date = ?, location = ?, capacity = ?
             WHERE id = ?`,
            [title.trim(), description.trim(), event_date, location.trim(), cap, id]
        );

        return Response.json({ message: 'Event updated successfully.' });
    } catch (err) {
        console.error(`PUT /api/events/${id} error:`, err);
        return Response.json({ error: 'Failed to update event.' }, { status: 500 });
    }
}

// ─── DELETE /api/events/[id] ───────────────────────────────────────────────
// Restricted to the event owner or admin.
export async function DELETE(request, { params }) {
    const { id } = await params;

    // 1. Auth check
    const session = await getSession();
    if (!session || (session.role !== 'organiser' && session.role !== 'admin')) {
        return Response.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // 2. Ownership check — prevents an organiser deleting another organiser's event
    const check = await getEventAndVerify(id, session);
    if (check.error) {
        return Response.json({ error: check.error }, { status: check.status });
    }

    try {
        await pool.execute('DELETE FROM events WHERE id = ?', [id]);

        return Response.json({ message: 'Event deleted successfully.' });
    } catch (err) {
        console.error(`DELETE /api/events/${id} error:`, err);
        return Response.json({ error: 'Failed to delete event.' }, { status: 500 });
    }
}
