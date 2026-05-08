// app/dashboard/page.js — User dashboard (Server Component)
export default function DashboardPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">Dashboard</p>
      <h1 className="text-3xl font-black mb-4">My Account</h1>
      <p className="text-gray-400">Your bookings and account details will appear here.</p>
    </main>
  );
}
