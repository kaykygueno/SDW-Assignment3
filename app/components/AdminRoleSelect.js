'use client';

import { useRouter } from 'next/navigation';

// Admin role selector component
// Allows admin users to change another user's role

export default function AdminRoleSelect({
  userId,
  currentRole,
}) {

  // Used to refresh page after update
  const router = useRouter();

  // Handle role change
  async function handleChange(e) {

    // Get selected role
    const newRole = e.target.value;

    // Send PATCH request to admin API
    const res = await fetch(
      `/api/admin/users/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newRole,
        }),
      }
    );

    // Refresh dashboard after successful update
    if (res.ok) {
      router.refresh();

    } else {

      // Show error message
      const data = await res.json().catch(() => ({}));

      alert(
        data.error || 'Failed to update role.'
      );
    }
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      className="bg-[#15151e] border border-white/20 rounded px-2 py-1 text-sm text-white"
    >

      {/* Available roles */}
      <option value="attendee">
        attendee
      </option>

      <option value="organiser">
        organiser
      </option>

      <option value="admin">
        admin
      </option>

    </select>
  );
}