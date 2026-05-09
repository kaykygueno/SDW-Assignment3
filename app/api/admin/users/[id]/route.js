import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// PATCH /api/admin/users/[id]
// Admin-only route used to change a user's role
export async function PATCH(request, { params }) {
  try {

    // Get current logged-in user session
    const session = await getSession();

    // Only admins can update user roles
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user id from route params
    const { id } = await params;

    // Read request body
    const body = await request.json();

    // Allowed application roles
    const allowedRoles = [
      'attendee',
      'organiser',
      'admin',
    ];

    // Prevent invalid role updates
    if (!allowedRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Update user role in database
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [body.role, id]
    );

    // Success response
    return NextResponse.json({
      message: 'User role updated successfully',
    });

  } catch (error) {

    // Log server error
    console.error('UPDATE USER ROLE ERROR:', error);

    // Generic server error response
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}