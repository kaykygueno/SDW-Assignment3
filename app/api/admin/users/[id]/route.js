// PUT /api/admin/users/[id] — admin-only endpoint to update user role (promotion/demotion)
import pool from '../../../../../lib/db';
import { getSession } from '../../../../../lib/auth';

const ROOT_ADMIN_EMAIL = 'admin@f1.com';

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

        const sessionUserId = Number(session.id);
        if (!Number.isInteger(sessionUserId) || sessionUserId <= 0) {
            return Response.json(
                { error: 'Unauthorized. Invalid session user.' },
                { status: 401 }
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

        // Immutable Root protection: no one can modify this account
        if (currentUser.email?.toLowerCase() === ROOT_ADMIN_EMAIL) {
            return Response.json(
                { error: 'Error: System Root account strictly protected.' },
                { status: 403 }
            );
        }

        // Prevent any admin from changing their own role (self-demotion protection)
        if (userId === sessionUserId) {
            return Response.json(
                { error: 'Cannot change your own role.' },
                { status: 400 }
            );
        }

        // Prevent demoting the last admin (system safeguard)
        if (currentUser.role === 'admin' && newRole !== 'admin') {
            const [adminCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = ?',
                ['admin']
            );
            if (adminCount[0].count === 1) {
                return Response.json(
                    { error: 'Cannot demote the last admin. At least one admin must exist.' },
                    { status: 400 }
                );
            }
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

export async function DELETE(request, { params }) {
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

        const sessionUserId = Number(session.id);
        if (!Number.isInteger(sessionUserId) || sessionUserId <= 0) {
            return Response.json(
                { error: 'Unauthorized. Invalid session user.' },
                { status: 401 }
            );
        }

        // Verify user exists before deleting
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

        const targetUser = user[0];

        // Immutable Root protection: no one can delete this account
        if (targetUser.email?.toLowerCase() === ROOT_ADMIN_EMAIL) {
            return Response.json(
                { error: 'Error: System Root account strictly protected.' },
                { status: 403 }
            );
        }

        // Prevent deleting your own account
        if (userId === sessionUserId) {
            return Response.json(
                { error: 'Cannot delete your own account.' },
                { status: 400 }
            );
        }

        // Prevent deleting the last admin (system safeguard)
        if (targetUser.role === 'admin') {
            const [adminCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = ?',
                ['admin']
            );
            if (adminCount[0].count === 1) {
                return Response.json(
                    { error: 'Cannot delete the last admin. At least one admin must exist.' },
                    { status: 400 }
                );
            }
        }

        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

        return Response.json(
            { message: 'User deleted successfully.' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting user:', error);
        return Response.json(
            { error: 'Unable to delete user at this time.' },
            { status: 500 }
        );
    }
}
