// app/dashboard/page.js — User dashboard (Server Component)
// Receives ?error=access_denied when proxy.js redirects a non-admin away from /admin
export default async function DashboardPage({ searchParams }) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
      <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">Dashboard</p>
      <h1 className="text-3xl font-black mb-4">My Account</h1>

      {/* Show a banner if the user was redirected due to insufficient permissions */}
      {error === 'access_denied' && (
        <div className="mb-6 rounded border border-red-600 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          You do not have permission to access that page.
        </div>
      )}

      <p className="text-gray-400">Your bookings and account details will appear here.</p>
    </main>
  );
}
