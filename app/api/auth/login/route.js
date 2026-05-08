// POST /api/auth/login — verify credentials and set session cookie
import bcrypt from 'bcryptjs';
import pool from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password;

        if (!email || !password) {
            return Response.json(
                { error: 'Email and password are required.' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Response.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        // Look up the user by email
        const [rows] = await pool.execute(
            'SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (!rows.length) {
            return Response.json(
                { error: 'Invalid email or password.' },
                { status: 401 }
            );
        }

        const user = rows[0];
        // Compare submitted password against the stored hash
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return Response.json(
                { error: 'Invalid email or password.' },
                { status: 401 }
            );
        }

        // Credentials valid — create JWT session cookie (name included for personalisation)
        await createSession({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

        return Response.json({
            message: 'Login successful.',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return Response.json(
            { error: 'Unable to login right now.' },
            { status: 500 }
        );
    }
}
