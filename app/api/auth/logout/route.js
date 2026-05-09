// POST /api/auth/logout
// Remove session cookie and log the user out

import { cookies } from 'next/headers';

export async function POST() {

    // Remove JWT session cookie
    // maxAge: 0 tells the browser to delete the cookie immediately
    (await cookies()).set('session', '', {
        httpOnly: true, // Prevent JavaScript access to cookie
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
    });

    // Success response
    return Response.json(
        { message: 'Logged out successfully.' },
        { status: 200 }
    );
}