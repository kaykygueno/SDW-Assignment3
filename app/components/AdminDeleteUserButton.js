'use client';

import { useRouter } from 'next/navigation';

// Admin button used to delete users
export default function AdminDeleteUserButton({ userId, userEmail }) {
    const router = useRouter();

    async function handleDelete() {
        if (!confirm(`Delete user ${userEmail}?`)) return;

        const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            router.refresh();
        } else {
            const data = await res.json().catch(() => ({}));
            alert(data.error || 'Failed to delete user.');
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="bg-red-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-800"
        >
            Delete
        </button>
    );
}
