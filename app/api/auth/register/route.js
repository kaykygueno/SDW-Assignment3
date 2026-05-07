import bcrypt from 'bcryptjs';
import pool from '../../../../lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password;
        const role = body?.role === 'admin' ? 'admin' : 'user';

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

        if (password.length < 6) {
            return Response.json(
                { error: 'Password must be at least 6 characters.' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );

        return Response.json(
            {
                message: 'User registered successfully.',
                user: {
                    id: result.insertId,
                    email,
                    role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (error?.code === 'ER_DUP_ENTRY') {
            return Response.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            );
        }

        return Response.json(
            { error: 'Unable to register user right now.' },
            { status: 500 }
        );
    }
}
