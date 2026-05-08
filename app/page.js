// app/page.js — F1 Ticket Booking landing page (Server Component)
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <p className="text-[#e10600] font-bold tracking-widest uppercase text-sm mb-4">
          2026 Season
        </p>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
          Formula 1<br />
          <span className="text-[#e10600]">Grand Prix</span> Tickets
        </h1>
        <p className="max-w-xl text-gray-400 text-lg mb-10">
          Book your seats at the most iconic racing events on the planet.
          Experience the speed, sound, and spectacle of Formula 1 live.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/events"
            className="bg-[#e10600] text-white font-bold px-8 py-3 rounded hover:bg-red-700 transition-colors"
          >
            Browse Events
          </Link>
          <Link
            href="/register"
            className="border border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-[#15151e] transition-colors"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Stats highlights */}
      <section className="bg-[#1e1e2e] py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-[#e10600] text-4xl font-black mb-2">24</div>
            <div className="text-gray-300 font-medium">Races This Season</div>
          </div>
          <div>
            <div className="text-[#e10600] text-4xl font-black mb-2">20</div>
            <div className="text-gray-300 font-medium">Legendary Drivers</div>
          </div>
          <div>
            <div className="text-[#e10600] text-4xl font-black mb-2">5</div>
            <div className="text-gray-300 font-medium">Continents</div>
          </div>
        </div>
      </section>
    </main>
  );
}
