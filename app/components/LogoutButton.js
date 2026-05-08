// app/components/LogoutButton.js — Client component that calls the logout API
'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  // POST to the logout API to clear the session cookie, then redirect to login
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
