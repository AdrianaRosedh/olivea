import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Olivea Farm To Table",
  description: "A farm-to-table sanctuary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="w-full p-4 bg-white shadow-md sticky top-0 z-50">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/restaurant">Restaurant</Link></li>
            <li><Link href="/casa">Casa Olivea</Link></li>
            <li><Link href="/cafe">Café</Link></li>
            <li><Link href="/reservations">Reservations</Link></li>
            <li><Link href="/events">Events</Link></li>
            <li><Link href="/journal">Journal</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/legal">Legal</Link></li>
          </ul>
        </nav>
        {children}
        <footer className="w-full p-6 bg-neutral-100 text-center text-sm text-muted-foreground border-t mt-10">
          © {new Date().getFullYear()} Inmobilaria MYA by DH. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
