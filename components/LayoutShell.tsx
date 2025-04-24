"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import { MobileNav } from "@/components/navbar/MobileNav"
import { MessageCircle, Leaf, BookOpenText, ShieldCheck } from "lucide-react"
import MagneticButton from "@/components/ui/MagneticButton"
import DockLeft from "@/components/ui/DockLeft"
import DockRight from "@/components/ui/DockRight"
import MobileSectionNav from "@/components/ui/MobileSectionNav"
import { cn } from "@/lib/utils"

type LayoutShellProps = {
  lang: "en" | "es"
  children: React.ReactNode
}

export default function LayoutShell({ lang, children }: LayoutShellProps) {
  const pathname = usePathname()
  const isHome = pathname === `/${lang}`
  const isCasaPage = pathname.includes("/casa")

  const scrollRef = useRef<HTMLDivElement>(null)

  const dockLeftItems = isCasaPage
    ? [
        { id: "rooms", number: "01", label: "Rooms" },
        { id: "breakfast", number: "02", label: "Breakfast" },
        { id: "experiences", number: "03", label: "Experiences" },
        { id: "location", number: "04", label: "Location" },
      ]
    : []

  const dockRightItems = [
    { id: "journal", href: `/${lang}/journal`, icon: <BookOpenText />, label: "Journal" },
    { id: "sustainability", href: `/${lang}/sustainability`, icon: <Leaf />, label: "Sustainability" },
    { id: "policies", href: `/${lang}/legal`, icon: <ShieldCheck />, label: "Policies" },
  ]

  const mobileDockItems = isCasaPage
    ? [
        { id: "rooms", label: "Habitaciones" },
        { id: "breakfast", label: "Desayuno" },
        { id: "experiences", label: "Experiencias" },
        { id: "location", label: "Ubicación" },
      ]
    : []

  return (
    <>
      {!isHome && <Navbar lang={lang} />}

      {!isHome && mobileDockItems.length > 0 && (
        <div className="md:hidden sticky top-[5rem] z-40 bg-[rgba(252,250,247,0.95)] backdrop-blur border-b border-zinc-200">
          <MobileSectionNav items={mobileDockItems} />
        </div>
      )}

      <main
        ref={scrollRef}
        className={cn(
          "scroll-container relative w-full",
          isHome ? "" : "max-w-7xl mx-auto px-1 pt-10 min-h-screen",
          isCasaPage &&
            "snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth"
        )}
      >
        {children}
      </main>

      <MobileNav lang={lang} isDrawerOpen={false} />
      {!isHome && <Footer />}

      {/* Left Dock */}
      {!isHome && dockLeftItems.length > 0 && (
        <div className="hidden md:flex fixed top-1/2 left-6 -translate-y-1/2 z-40">
          <DockLeft items={dockLeftItems} />
        </div>
      )}

      {/* Right Dock */}
      {!isHome && (
        <div className="hidden md:flex fixed top-1/2 right-6 -translate-y-1/2 z-40">
          <DockRight items={dockRightItems} />
        </div>
      )}

      {/* Chat Button */}
      {!isHome && (
        <div className="hidden md:block">
          <MagneticButton
            href="#chat"
            aria-label="Open Chat"
            className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-14 h-14 
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