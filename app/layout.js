// app/layout.js — Root layout with role-aware F1 global navigation
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";
import { getSession } from "@/lib/auth";
import "./globals.css";

export const metadata = {
  title: "F1 Ticket Booking",
  description: "Book tickets for Formula 1 Grand Prix events worldwide",
};

export default async function RootLayout({ children }) {
  // Read the session on every request so nav links reflect the current role
  const session = await getSession();
  const role = session?.role; // 'attendee' | 'organiser' | 'admin' | undefined

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#15151e] text-white">
        {/* Global navigation bar */}
        <header className="bg-[#e10600]">
          <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Brand logo */}
            <Link
              href="/"
              className="text-white font-bold text-xl tracking-widest uppercase"
            >
              F1 Tickets
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium text-white">
              {/* Always visible */}
              <Link href="/events" className="hover:text-white/70 transition-colors">
                Events
              </Link>

              {/* Attendee-only links */}
              {role === "attendee" && (
                <Link href="/bookings" className="hover:text-white/70 transition-colors">
                  My Bookings
                </Link>
              )}

              {/* Organiser-only links */}
              {role === "organiser" && (
                <>
                  <Link href="/organiser/create-event" className="hover:text-white/70 transition-colors">
                    Create Event
                  </Link>
                  <Link href="/organiser/events" className="hover:text-white/70 transition-colors">
                    My Events
                  </Link>
                </>
              )}

              {/* Admin-only links */}
              {role === "admin" && (
                <Link href="/admin" className="hover:text-white/70 transition-colors">
                  Manage Users
                </Link>
              )}

              {/* Auth links — show Login/Register when logged out, Logout when logged in */}
              {!session ? (
                <>
                  <Link href="/login" className="hover:text-white/70 transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-[#e10600] px-4 py-1.5 rounded hover:bg-gray-100 transition-colors"
                  >
                    Register
                  </Link>
                </>
              ) : (
                /* Client component — POSTs to /api/auth/logout then redirects to /login */
                <LogoutButton />
              )}
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
