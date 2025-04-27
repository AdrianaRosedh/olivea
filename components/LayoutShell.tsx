"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/Footer"
import { MessageCircle, Leaf, BookOpenText, ShieldCheck } from "lucide-react"
import MagneticButton from "@/components/ui/MagneticButton"
import DockLeft from "@/components/ui/DockLeft"
import DockRight from "@/components/ui/DockRight"
import MobileSectionNav from "@/components/ui/MobileSectionNav"
import { cn } from "@/lib/utils"
import { memo, useEffect } from "react"
import ScrollToTop from "@/components/ScrollToTop"
import ClientOnly from "@/components/ClientOnly"
import NextGenBackground from "@/components/NextGenBackground"

type LayoutShellProps = {
  lang: string
  children: React.ReactNode
}

function LayoutShell({ lang, children }: LayoutShellProps) {
  const pathname = usePathname()
  const isHome = pathname === `/${lang}`
  const isCasaPage = pathname.includes("/casa")

  // Force scroll events after component mounts
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isHome) return

    // Force scroll events to ensure components update
    const forceScrollEvents = () => {
      window.dispatchEvent(new Event("scroll"))
    }

    // Schedule multiple attempts
    const timers = [
      setTimeout(forceScrollEvents, 0),
      setTimeout(forceScrollEvents, 100),
      setTimeout(forceScrollEvents, 500),
      setTimeout(forceScrollEvents, 1000),
    ]

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [isHome, pathname])

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
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[1001] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        tabIndex={isHome ? -1 : 0}
        aria-hidden={isHome}
      >
        Skip to main content
      </a>

      {!isHome && <Navbar lang={lang} />}

      <main
        id="main-content"
        className={cn("relative w-full", isHome ? "" : "max-w-7xl mx-auto px-1", isCasaPage && "pb-16")}
      >
        {children}
      </main>

      {/* Restore footer for all non-home pages */}
      {!isHome && <Footer />}

      {/* Mobile section navigation - moved to bottom and only rendered on client */}
      {!isHome && mobileDockItems.length > 0 && (
        <ClientOnly>
          <div className="md:hidden fixed bottom-[68px] left-0 right-0 z-40 bg-transparent backdrop-blur-md border-t border-b border-[var(--olivea-soil)]/10 w-full">
            <MobileSectionNav items={mobileDockItems} />
          </div>
        </ClientOnly>
      )}

      {/* Left Dock - only rendered on client */}
      {!isHome && dockLeftItems.length > 0 && (
        <ClientOnly>
          <div className="hidden md:flex fixed top-1/2 left-6 -translate-y-1/2 z-40">
            <DockLeft items={dockLeftItems} />
          </div>
        </ClientOnly>
      )}

      {/* Right Dock - only rendered on client */}
      {!isHome && (
        <ClientOnly>
          <div className="hidden md:flex fixed top-1/2 right-6 -translate-y-1/2 z-40">
            <DockRight items={dockRightItems} />
          </div>
        </ClientOnly>
      )}

      {/* Chat Button - only rendered on client */}
      {!isHome && (
        <ClientOnly>
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
        </ClientOnly>
      )}

      {/* Scroll components - directly rendered for reliability */}
      {!isHome && (
        <>
          <ScrollToTop />
          <NextGenBackground />
        </>
      )}
    </>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(LayoutShell)
