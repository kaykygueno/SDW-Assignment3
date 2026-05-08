// app/layout.js
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";
import { getSession } from "@/lib/auth";
import "./globals.css";

export const metadata = {
  title: "F1 Ticket Booking",
  description: "Book tickets for Formula 1 Grand Prix events worldwide",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const role = session?.role;

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#15151e] text-white">
        <header className="bg-[#e10600]">
          <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-white font-bold text-xl tracking-widest uppercase">
              F1 Tickets
            </Link>

            <div className="flex items-center gap-6 text-sm font-medium text-white">
              <Link href="/events" className="hover:text-white/70">
                Events
              </Link>

              {session && (
                <Link href="/dashboard" className="hover:text-white/70">
                  Dashboard
                </Link>
              )}

              {role === "attendee" && (
                <Link href="/bookings" className="hover:text-white/70">
                  My Bookings
                </Link>
              )}

              {(role === "organiser" || role === "admin") && (
                <Link href="/events" className="hover:text-white/70">
                  Create Event
                </Link>
              )}

              {role === "admin" && (
                <Link href="/admin" className="hover:text-white/70">
                  Admin
                </Link>
              )}

              {session && (

                <span className="text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded">
                  {role}
                </span>
              )}

              {!session ? (
                <>
                  <Link href="/login" className="hover:text-white/70">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-[#e10600] px-4 py-1.5 rounded hover:bg-gray-100"
                  >
                    Register
                  </Link>
                </>
              ) : (
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