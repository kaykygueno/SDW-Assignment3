// POST /api/auth/logout — clear the session cookie to log the user out
import { deleteSession } from '../../../../lib/auth';

export async function POST() {
    // Remove the httpOnly session cookie via the auth helper
    await deleteSession();

    return Response.json({ message: 'Logged out successfully.' });
}