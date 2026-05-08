// middleware.js — DEPRECATED in Next.js 16
// The active security/RBAC logic lives in proxy.js (same directory).
// This file is kept as a no-op to avoid breaking older tooling.
import { NextResponse } from 'next/server';

export function middleware(request) {
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
