import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// DELETE /api/admin/bookings/[id]
// Admin can delete any booking
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    await pool.query(
      'DELETE FROM bookings WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      message: 'Booking deleted successfully',
    });

  } catch (error) {
    console.error('ADMIN DELETE BOOKING ERROR:', error);

    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}