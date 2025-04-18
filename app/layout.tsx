import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Olivea",
  description: "A farm-to-table sanctuary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <MobileNav />
        <Footer />

        {/* Desktop-only Floating Buttons */}
        <div className="hidden md:block">
          {/* Floating Reserve Button */}
          <div className="fixed bottom-6 left-6 z-50">
            <a
              href="/reservations"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg transition"
            >
              Reserve
            </a>
          </div>

          {/* Floating Chat Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <a
              href="https://your-whistle-chatbot-link.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-800 hover:bg-black text-white px-4 py-2 rounded-full shadow-lg transition"
            >
              Chat
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}