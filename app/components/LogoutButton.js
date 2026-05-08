// app/components/LogoutButton.js — Client component that calls the logout API
'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    // POST to the logout API to expire the session cookie, then redirect to home
    async function handleLogout() {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            window.location.href = '/'; // Use full page reload to clear session state
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-400 hover:text-[#e10600] transition-colors"
        >
            Logout
        </button>
    );
}
