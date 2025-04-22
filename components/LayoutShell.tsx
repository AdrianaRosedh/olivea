"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import { MobileNav } from "@/components/navbar/MobileNav"

type LayoutShellProps = {
  lang: "en" | "es"
  children: React.ReactNode
}

export default function LayoutShell({ lang, children }: LayoutShellProps) {
  const pathname = usePathname()
  const isHome = pathname === `/${lang}`

  return (
    <>
      {!isHome && <Navbar lang={lang} />}

      <main className={isHome ? "" : "max-w-7xl mx-auto px-1 pt-10 min-h-screen"}>
        {children}
      </main>

      <MobileNav lang={lang} isDrawerOpen={false} />

      {!isHome && <Footer lang={lang} />}

      {/* Desktop-only floating buttons */}
      {!isHome && (
        <div className="hidden md:block">
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
      )}
    </>
  )
}