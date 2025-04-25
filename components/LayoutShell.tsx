"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import { MessageCircle, Leaf, BookOpenText, ShieldCheck } from "lucide-react"
import MagneticButton from "@/components/ui/MagneticButton"
import DockLeft from "@/components/ui/DockLeft"
import DockRight from "@/components/ui/DockRight"
import MobileSectionNav from "@/components/ui/MobileSectionNav"
import { cn } from "@/lib/utils"
import ScrollAnimatedBackground from "@/components/ScrollAnimatedBackground"

type LayoutShellProps = {
  lang: "en" | "es"
  children: React.ReactNode
}

export default function LayoutShell({ lang, children }: LayoutShellProps) {
  const pathname = usePathname()
  const isHome = pathname === `/${lang}`
  const isCasaPage = pathname.includes("/casa")

  const scrollRef = useRef<HTMLDivElement>(null)

  // Fix for scroll issues in iOS
  useEffect(() => {
    // Remove fixed positioning from body to allow scrolling
    document.body.style.position = "relative"
    document.body.style.overflow = "auto"
    document.body.style.height = "auto"

    return () => {
      // Reset when component unmounts
      document.body.style.position = ""
      document.body.style.overflow = ""
      document.body.style.height = ""
    }
  }, [])

  // Handle hash navigation on page load
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1)
      const element = document.getElementById(id)

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 500)
      }
    }
  }, [pathname])

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
        <div className="md:hidden sticky top-[5rem] z-40 bg-[rgba(233,232,229,0.7)] backdrop-blur-md border-b border-[var(--olivea-olive)]/10">
          <MobileSectionNav items={mobileDockItems} />
        </div>
      )}

      <main
        ref={scrollRef}
        className={cn(
          "scroll-container relative w-full",
          isHome ? "" : "max-w-7xl mx-auto px-1", // Removed min-height
          isCasaPage && "snap-y snap-mandatory h-screen overflow-y-auto scroll-smooth pb-16", // Added pb-16 for footer space
        )}
      >
        {children}
      </main>

      {/* Restore footer for all non-home pages */}
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
              bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] 
              transition-colors rounded-[40%_60%_60%_40%_/_40%_40%_60%_60%]"
          >
            <MessageCircle className="w-6 h-6" />
          </MagneticButton>
        </div>
      )}

      {/* Add the animated background */}
      {!isHome && <ScrollAnimatedBackground />}
    </>
  )
}
