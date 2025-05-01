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
import { supabase } from "@/lib/supabase"
import { NavigationProvider } from "@/contexts/NavigationContext"
import useSmoothScroll from "@/hooks/useSmoothScroll"
import { useIsMobile } from "@/hooks/useMediaQuery"

const BASE_CAFE_ITEMS = [{ id: "about", number: "01", label: "About" }, { id: "coffee", number: "02", label: "Coffee" }, { id: "pastries", number: "03", label: "Pastries" }, { id: "menu", number: "04", label: "Menu" }]
const CASA_ITEMS = [{ id: "rooms", number: "01", label: "Rooms" }, { id: "breakfast", number: "02", label: "Breakfast" }, { id: "experiences", number: "03", label: "Experiences" }, { id: "location", number: "04", label: "Location" }]
const RESTAURANT_ITEMS = [{ id: "story", number: "01", label: "Story" }, { id: "garden", number: "02", label: "Garden" }, { id: "menu", number: "03", label: "Menu" }, { id: "wines", number: "04", label: "Wines" }]

function LayoutShell({ lang, children }: { lang: string; children: React.ReactNode }) {
  useSmoothScroll()

  const pathname = usePathname()
  const isMobile = useIsMobile()
  const isHome = pathname === `/${lang}`
  const isCasaPage = pathname.includes("/casa")
  const isCafePage = pathname.includes("/cafe")
  const isRestaurantPage = pathname.includes("/restaurant")

  const [cafeCategories, setCafeCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(isCafePage)

  useEffect(() => {
    if (!isCafePage) return setIsLoading(false)

    let isMounted = true
    setIsLoading(true)

    supabase.from("cafe_menu").select("category").eq("available", true).order("category")
      .then(({ data, error }) => {
        if (error || !data || !isMounted) return setIsLoading(false)
        setCafeCategories([...new Set(data.map((item) => item.category).filter(Boolean))])
        setIsLoading(false)
      })

    return () => { isMounted = false }
  }, [isCafePage])

  let navItems = isCasaPage ? CASA_ITEMS : isRestaurantPage ? RESTAURANT_ITEMS : isCafePage ? [...BASE_CAFE_ITEMS, ...cafeCategories.map((category, i) => ({ id: category, number: `0${i + 5}`, label: category }))] : []

  const dockRightItems = [
    { id: "journal", href: `/${lang}/journal`, label: "Journal" },
    { id: "sustainability", href: `/${lang}/sustainability`, label: "Sustainability" },
    { id: "policies", href: `/${lang}/legal`, label: "Policies" },
  ]

  return (
    <>
      {!isHome && <Navbar lang={lang} />}

      <main className={isHome ? "p-0 m-0 overflow-hidden" : "max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20"}>
        {(isCasaPage || isCafePage || isRestaurantPage) ? (
          <NavigationProvider>{children}</NavigationProvider>
        ) : children}
      </main>

      {!isHome && <Footer />}

      {!isHome && !isMobile && navItems.length > 0 && (
        <ClientOnly><DockLeft items={navItems} className="fixed left-6 top-1/2 z-[60]" /></ClientOnly>
      )}

      {!isHome && !isMobile && (
        <ClientOnly><DockRight items={dockRightItems} className="fixed right-6 top-1/2 z-[60]" /></ClientOnly>
      )}

      {!isHome && isMobile && navItems.length > 0 && !isLoading && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-[60] bg-transparent backdrop-blur-md">
            <MobileSectionNav items={navItems.map(({ id, label }) => ({ id, label }))} />
          </div>
        </ClientOnly>
      )}
    </>
  )
}

export default memo(LayoutShell)