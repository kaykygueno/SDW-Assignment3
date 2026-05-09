// POST /api/auth/login
// Verify user credentials and create session cookie

import bcrypt from 'bcryptjs';
import pool from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';

export async function POST(request) {
    try {

        // Read login form data
        const body = await request.json();

        // Normalise email input
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password;

        // Validate required fields
        if (!email || !password) {
            return Response.json(
                { error: 'Email and password are required.' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return Response.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        // Find user by email
        const [rows] = await pool.execute(
            `SELECT
                id,
                name,
                email,
                password,
                role
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        // User not found
        if (!rows.length) {
            return Response.json(
                { error: 'Invalid email or password.' },
                { status: 401 }
            );
        }

        const user = rows[0];

        // Compare password with hashed password in database
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Password incorrect
        if (!passwordMatch) {
            return Response.json(
                { error: 'Invalid email or password.' },
                { status: 401 }
            );
        }

        // Create JWT session cookie after successful login
        // Cookie stores user id, email and role securely
        await createSession({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        // Success response
        return Response.json({
            message: 'Login successful.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {

        // Generic server error
        return Response.json(
            { error: 'Unable to login right now.' },
            { status: 500 }
        );
    }
}