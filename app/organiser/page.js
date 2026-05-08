// app/organiser/page.js — Organiser dashboard (Server Component)
// Defence-in-depth: verify role server-side even though proxy.js already gates this route.
import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth';

export default async function OrganiserPage() {
    // Read and verify the JWT session on the server
    const session = await getSession();

    // Only organisers and admins may access this page
    if (!session || (session.role !== 'organiser' && session.role !== 'admin')) {
        redirect('/dashboard?error=access_denied');
    }

    return (
        <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
            <p className="text-[#e10600] text-xs font-bold tracking-widest uppercase mb-1">Organiser</p>
            <h1 className="text-3xl font-black mb-4">Organiser Dashboard</h1>
            <p className="text-gray-400 mb-6">
                Logged in as{' '}
                <span className="text-white font-medium">{session.email}</span> &mdash; role:{' '}
                <span className="text-[#e10600] font-bold">{session.role}</span>
            </p>
            <p className="text-gray-400">Create and manage race events and ticket availability here.</p>
        </main>
    );
}
