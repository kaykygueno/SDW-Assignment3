// app/not-found.js — Custom 404 page rendered inside the root layout (App Router)
// The layout (nav bar) always wraps this page — that is expected Next.js behaviour.
import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
            {/* F1-styled 404 */}
            <p className="text-[#e10600] font-bold tracking-widest uppercase text-sm mb-4">
                Error 404
            </p>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-4">
                Off Track
            </h1>
            <p className="text-gray-400 text-lg mb-10 max-w-md">
                This page does not exist. It looks like you have taken a wrong turn at the chicane.
            </p>
            <Link
                href="/"
                className="bg-[#e10600] text-white font-bold px-8 py-3 rounded hover:bg-red-700 transition-colors"
            >
                Back to the Pits
            </Link>
        </main>
    );
}
