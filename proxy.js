// proxy.js — Role-Based Access Control (RBAC) for F1 Ticket Booking
// Runs on the Edge before every matched request to enforce authentication and role rules.
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Encode the secret the same way jose expects it
const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret'
);

// Routes any logged-in user can access
const PROTECTED_ROUTES = ['/dashboard', '/bookings'];

// Routes only admins can access
const ADMIN_ROUTES = ['/admin'];

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

    // Allow public routes through immediately
    if (!isProtected && !isAdmin) {
        return NextResponse.next();
    }

    // Read the session cookie from the incoming request
    const token = request.cookies.get('session')?.value;

    if (!token) {
        // No session — redirect to login, preserving the intended destination
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify JWT signature and expiry
        const { payload } = await jwtVerify(token, SECRET);

        // Admin-only check — attendees and organisers are redirected away
        if (isAdmin && payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Valid session — let the request through
        return NextResponse.next();
    } catch {
        // Token is invalid or expired — clear the cookie and send to login
        const loginUrl = new URL('/login', request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('session');
        return response;
    }
}

export const config = {
    // Run proxy on protected paths only; skip static assets and API routes
    matcher: ['/dashboard/:path*', '/bookings/:path*', '/admin/:path*'],
};
