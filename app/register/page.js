// app/register/page.js — registration form (client component)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  // Controlled form state for name, email, and password fields
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  // Holds any error message returned by the API
  const [error, setError] = useState('');

  // Generic change handler — updates the field matching the input's name attribute
  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // POST form data to the register API; redirect to /login on success
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed. Please try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-gray-700 bg-[#1e1e2e] p-8 shadow-lg"
      >
        <div className="mb-2">
          <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">
            F1 Ticket Booking
          </p>
          <h1 className="text-2xl font-black">Create Account</h1>
        </div>

        {error && (
          <p className="rounded bg-red-900/40 border border-red-600 p-2 text-sm text-red-400">{error}</p>
        )}

        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full rounded border border-gray-600 bg-[#15151e] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#e10600]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded border border-gray-600 bg-[#15151e] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#e10600]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="w-full rounded border border-gray-600 bg-[#15151e] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#e10600]"
          />
        </div>

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full rounded border border-gray-600 bg-[#15151e] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#e10600]"
        >
          <option value="">Select Role</option>
          <option value="attendee">Attendee</option>
          <option value="organiser">Organiser</option>
        </select>

        <button
          type="submit"
          className="w-full rounded bg-[#e10600] py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
        >
          Register
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-[#e10600] hover:underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}

