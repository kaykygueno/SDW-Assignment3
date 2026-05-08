// POST /api/auth/logout — expire the session cookie to log the user out
import { cookies } from 'next/headers';

export async function POST() {
    // Explicitly set Max-Age=0 so the browser immediately discards the cookie
    (await cookies()).set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,   // expire immediately
        path: '/',
    });

    return Response.json({ message: 'Logged out successfully.' }, { status: 200 });
}