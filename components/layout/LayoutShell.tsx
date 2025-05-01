// components/layout/LayoutShell.tsx
"use client"

import React, { memo, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import DockLeft from "@/components/navigation/DockLeft"
import DockRight from "@/components/navigation/DockRight"
import MobileSectionNav from "@/components/ui/MobileSectionNav"
import ClientOnly from "@/components/ClientOnly"
import MagneticButton from "@/components/ui/MagneticButton"
import { MessageCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/useMediaQuery"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import { supabase } from "@/lib/supabase"
import { NavigationProvider } from "@/contexts/NavigationContext"

const BASE_CAFE_ITEMS = [
  { id: "about", number: "01", label: "About" },
  { id: "coffee", number: "02", label: "Coffee" },
  { id: "pastries", number: "03", label: "Pastries" },
  { id: "menu", number: "04", label: "Menu" },
]

const CASA_ITEMS = [
  { id: "rooms", number: "01", label: "Rooms" },
  { id: "breakfast", number: "02", label: "Breakfast" },
  { id: "experiences", number: "03", label: "Experiences" },
  { id: "location", number: "04", label: "Location" },
]

const RESTAURANT_ITEMS = [
  { id: "story", number: "01", label: "Story" },
  { id: "garden", number: "02", label: "Garden" },
  { id: "menu", number: "03", label: "Menu" },
  { id: "wines", number: "04", label: "Wines" },
]

interface LayoutShellProps {
  lang: string
  children: React.ReactNode
}

function LayoutShell({ lang, children }: LayoutShellProps) {
  useSmoothScroll()

  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isHome = pathname === `/${lang}`

  // Figure out which section we’re in
  const isCasaPage = pathname.includes("/casa")
  const isCafePage = pathname.includes("/cafe")
  const isRestaurantPage = pathname.includes("/restaurant")

  // Load café categories (for Café section)
  const [cafeCategories, setCafeCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(isCafePage)
  useEffect(() => {
    if (!isCafePage) {
      setIsLoading(false)
      return
    }
    let mounted = true
    supabase
      .from("cafe_menu")
      .select("category")
      .eq("available", true)
      .order("category")
      .then(({ data }) => {
        if (!mounted) return
        setCafeCategories(
          Array.from(new Set((data ?? []).map((i) => i.category).filter(Boolean)))
        )
        setIsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [isCafePage])

  // Decide nav items for side docks / mobile section nav
  let navItems = []
  if (isCasaPage) navItems = CASA_ITEMS
  else if (isRestaurantPage) navItems = RESTAURANT_ITEMS
  else if (isCafePage)
    navItems = [
      ...BASE_CAFE_ITEMS,
      ...cafeCategories.map((cat, i) => ({ id: cat, number: `0${i + 5}`, label: cat })),
    ]

  // Mobile section nav wants just id+label
  const mobileNavItems = navItems.map(({ id, label }) => ({ id, label }))

  // Right-hand dock always includes chat link too (desktop)
  const dockRightItems = [
    { id: "journal", href: `/${lang}/journal`, label: "Journal" },
    { id: "sustainability", href: `/${lang}/sustainability`, label: "Sustainability" },
    { id: "policies", href: `/${lang}/legal`, label: "Policies" },
  ]

  return (
    <>
      {/* Top Navbar */}
      {!isHome && <Navbar lang={lang} />}

      {/* Main Content */}
      <main
        className={
          isHome
            ? "p-0 m-0 overflow-hidden"
            : "max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20"
        }
      >
        {(isCasaPage || isCafePage || isRestaurantPage) ? (
          <NavigationProvider>{children}</NavigationProvider>
        ) : (
          children
        )}
      </main>

      {/* Footer */}
      {!isHome && <Footer />}

      {/* Desktop: left & right docks */}
      {!isHome && !isMobile && navItems.length > 0 && (
        <ClientOnly>
          <DockLeft items={navItems} />
          <DockRight items={dockRightItems} />
        </ClientOnly>
      )}

      {/* Mobile: section nav at bottom (above the main bottom nav) */}
      {!isHome && isMobile && !isLoading && navItems.length > 0 && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-40 bg-transparent backdrop-blur-md border-t border-[var(--olivea-soil)]/10">
            <MobileSectionNav items={mobileNavItems} />
          </div>
        </ClientOnly>
      )}

      {/* Floating Chat button on desktop only */}
      {!isHome && !isMobile && (
        <ClientOnly>
          <div className="fixed bottom-20 right-6 z-50 hidden md:block">
            <MagneticButton
              id="chatbot-toggle"
              href="#chat"
              aria-label="Open Chat"
              className="w-14 h-14 bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] rounded-[40%_60%_60%_40%] transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </MagneticButton>
          </div>
        </ClientOnly>
      )}
    </>
  )
}

export default memo(LayoutShell)