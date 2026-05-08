// lib/auth.js — JWT session helpers used by login and protected routes
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Secret used to sign and verify JWT tokens
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret';

// Sign a JWT and write it to an httpOnly cookie
export async function createSession(user) {
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '1d' }
    );

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });
}

// Read and verify the session cookie; returns the decoded payload or null
export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;

    try {
        return jwt.verify(session, SECRET_KEY);
    } catch (error) {
        return null;
    }
}

// Remove the session cookie to log the user out
export async function deleteSession() {
    (await cookies()).delete('session');
}
