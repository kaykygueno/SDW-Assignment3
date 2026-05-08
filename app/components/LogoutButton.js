// app/components/LogoutButton.js — Client component that calls the logout API
'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    // POST to the logout API to expire the session cookie, then redirect to home
    async function handleLogout() {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
            router.refresh(); // Refresh to update the layout with the new session state
            router.push('/'); // Redirect to home after logout
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
