// PUT /api/admin/users/[id] — admin-only endpoint to update user role (promotion/demotion)
import pool from '../../../../../lib/db';
import { getSession } from '../../../../../lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getSession();

    // Require valid session with admin role
    if (!session || !session.id || session.role !== 'admin') {
      return Response.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id, 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      return Response.json(
        { error: 'Invalid user ID.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const newRole = body?.role?.trim();

    // Validate new role is one of the allowed values
    const allowedRoles = ['attendee', 'organiser'];
    if (!newRole || !allowedRoles.includes(newRole)) {
      return Response.json(
        { error: 'Invalid role. Must be "attendee" or "organiser".' },
        { status: 400 }
      );
    }

    // Verify user exists before updating
    const [user] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (!user || user.length === 0) {
      return Response.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    const currentUser = user[0];

    // Prevent admin from promoting themselves (safety check)
    if (userId === session.id) {
      return Response.json(
        { error: 'Cannot change your own role.' },
        { status: 400 }
      );
    }

    // Update user role
    await pool.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [newRole, userId]
    );

    return Response.json(
      {
        message: `User promoted successfully to ${newRole}.`,
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: newRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Unable to update user at this time.' },
      { status: 500 }
    );
  }
}
