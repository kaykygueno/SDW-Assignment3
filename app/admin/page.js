// app/admin/page.js — Admin panel (Server Component)
export default function AdminPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">Admin</p>
      <h1 className="text-3xl font-black mb-4">Admin Panel</h1>
      <p className="text-gray-400">Manage events, users, and bookings here.</p>
    </main>
  );
}
