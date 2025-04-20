// app/[lang]/layout.tsx

import "@/app/globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "en" | "es" };
}) {
  const lang = params.lang;

  return (
    <html lang={lang}>
      <body className={inter.className}>
        <Navbar lang={lang} />
        <main className="min-h-screen">{children}</main>
        <MobileNav lang={lang} />
        <Footer lang={lang} />
        <div className="hidden md:block">
          <div className="fixed bottom-6 left-6 z-50">
            <a
              href={`/${lang}/reservations`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg transition"
            >
              Reserve
            </a>
          </div>
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