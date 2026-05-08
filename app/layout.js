// app/layout.js — Root layout with F1 global navigation
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "F1 Ticket Booking",
  description: "Book tickets for Formula 1 Grand Prix events worldwide",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#15151e] text-white">
        {/* Global navigation bar */}
        <header className="bg-[#15151e] border-b border-[#e10600]">
          <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-[#e10600] font-bold text-xl tracking-widest uppercase"
            >
              F1 Tickets
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/events" className="hover:text-[#e10600] transition-colors">
                Events
              </Link>
              <Link href="/bookings" className="hover:text-[#e10600] transition-colors">
                My Bookings
              </Link>
              <Link href="/login" className="hover:text-[#e10600] transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#e10600] text-white px-4 py-1.5 rounded hover:bg-red-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
