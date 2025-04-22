"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import { MobileNav } from "@/components/navbar/MobileNav"
import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

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
    <motion.button
      id="chatbot-toggle"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-sm bg-white/80 shadow-xl border border-gray-300 text-black hover:bg-white"
      aria-label="Open Chat"
    >
      <MessageCircle className="w-6 h-6" />
    </motion.button>
  </div>
)}
    </>
  )
}