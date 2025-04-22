"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import { MobileNav } from "@/components/navbar/MobileNav"
import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import MagneticButton from "@/components/ui/MagneticButton"


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
          <MagneticButton
  href="#chat"
  aria-label="Open Chat"
  className="fixed bottom-11 right-15 z-50 flex items-center justify-center w-14 h-14 
           bg-[var(--olivea-soil)] text-white hover:bg-[var(--olivea-olive)] 
           transition-colors rounded-[40%_60%_60%_40%_/_40%_40%_60%_60%]"
>
  <MessageCircle className="w-6 h-6" />
</MagneticButton>
        </div>
      )}
    </>
  )
}