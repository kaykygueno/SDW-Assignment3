// proxy.js — Security guard for F1 Ticket Booking (App Router)
// NOTE: Next.js 16 renamed middleware.js to proxy.js. This file is the active one.
// Runs on the Edge before every matched request to enforce auth and RBAC rules.
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Encode the secret the same way jose expects it
const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret'
);

// Protected routes — any logged-in user may access these (browsing /events is public)
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/organiser', '/bookings'];

// Public-only routes — already-logged-in users should be redirected away
const PUBLIC_ONLY_ROUTES = ['/login', '/register'];

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // Extract the session cookie from the incoming request
    const token = request.cookies.get('session')?.value;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isPublicOnly = PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r));

    // --- Already logged-in users visiting /login or /register ---
    // Verify the token; if valid, send them straight to /dashboard
    if (isPublicOnly && token) {
        try {
            await jwtVerify(token, SECRET);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
            // Token is invalid/expired — let them through to login/register
        }
    }

    // --- Protected routes: require a valid session ---
    if (isProtected) {
        if (!token) {
            // No cookie at all — redirect to login, preserving the intended URL
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            // Verify JWT signature and expiry; extract the payload
            const { payload } = await jwtVerify(token, SECRET);

            // --- RBAC: /admin is restricted to role === 'admin' only ---
            if (pathname.startsWith('/admin') && payload.role !== 'admin') {
                // Redirect non-admins to /dashboard with an error message
                const dashboardUrl = new URL('/dashboard', request.url);
                dashboardUrl.searchParams.set('error', 'access_denied');
                return NextResponse.redirect(dashboardUrl);
            }

            // --- RBAC: /organiser is restricted to role === 'organiser' or 'admin' ---
            if (pathname.startsWith('/organiser') && payload.role !== 'organiser' && payload.role !== 'admin') {
                // Redirect attendees to /dashboard with an error message
                const dashboardUrl = new URL('/dashboard', request.url);
                dashboardUrl.searchParams.set('error', 'access_denied');
                return NextResponse.redirect(dashboardUrl);
            }

            // Valid session and sufficient role — allow the request through
            return NextResponse.next();
        } catch {
            // Token is invalid or expired — clear the cookie and send to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('session');
            return response;
        }
    }

    // All other routes (home page, static assets etc.) pass through
    return NextResponse.next();
}

export const config = {
    // Run on all routes except Next.js internals and static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.png$).*)'],
};

