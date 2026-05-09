import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// DELETE /api/admin/events/[id]
// Admin can delete any event
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const {id} = await params;
 
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete related bookings first
    await pool.query(
      'DELETE FROM bookings WHERE event_id = ?',
      [id]
    );

    // Delete event
    await pool.query(
      'DELETE FROM events WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      message: 'Event deleted successfully',
    });

  } catch (error) {
    console.error('ADMIN DELETE EVENT ERROR:', error);

    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}