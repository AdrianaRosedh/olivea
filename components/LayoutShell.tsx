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
import { memo, useEffect, useState } from "react"
import ScrollToTop from "@/components/ScrollToTop"
import ClientOnly from "@/components/ClientOnly"
import NextGenBackground from "@/components/NextGenBackground"
import ScrollSystem from "@/components/ScrollSystem"
import AnimationInitializer from "@/components/AnimationInitializer"
import { supabase } from "@/lib/supabase"
import { NavigationProvider } from "@/contexts/NavigationContext"

type LayoutShellProps = {
  lang: string
  children: React.ReactNode
}

// Define base navigation items
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

function LayoutShell({ lang, children }: LayoutShellProps) {
  const pathname = usePathname()
  const isHome = pathname === `/${lang}`
  const isCasaPage = pathname.includes("/casa")
  const isCafePage = pathname.includes("/cafe")
  const isRestaurantPage = pathname.includes("/restaurant")

  // State for cafe menu categories
  const [cafeCategories, setCafeCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(isCafePage)

  // Fetch cafe menu categories if on cafe page
  useEffect(() => {
    if (!isCafePage) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("cafe_menu")
          .select("category")
          .eq("available", true)
          .order("category")

        if (error) {
          console.error("Supabase error:", error)
          if (isMounted) setIsLoading(false)
          return
        }

        if (data && isMounted) {
          // Filter out any null or undefined categories
          const validCategories = data.map((item) => item?.category).filter((category) => category) as string[]

          // Get unique categories
          const uniqueCategories = Array.from(new Set(validCategories))
          setCafeCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [isCafePage])

  // Determine which navigation items to use
  let navItems = []
  if (isCasaPage) {
    navItems = [...CASA_ITEMS]
  } else if (isRestaurantPage) {
    navItems = [...RESTAURANT_ITEMS]
  } else if (isCafePage) {
    // For cafe, start with base items
    navItems = [...BASE_CAFE_ITEMS]

    // Only add dynamic categories if they've been loaded
    if (cafeCategories.length > 0) {
      const dynamicItems = cafeCategories.map((category, index) => ({
        id: category,
        number: `0${index + 5}`,
        label: category,
      }))
      navItems = [...navItems, ...dynamicItems]
    }
  }

  const mobileDockItems = navItems.map(({ id, label }) => ({ id, label }))

  const dockRightItems = [
    { id: "journal", href: `/${lang}/journal`, icon: <BookOpenText />, label: "Journal" },
    { id: "sustainability", href: `/${lang}/sustainability`, icon: <Leaf />, label: "Sustainability" },
    { id: "policies", href: `/${lang}/legal`, icon: <ShieldCheck />, label: "Policies" },
  ]

  const content = isHome ? (
    children
  ) : (
    <ScrollSystem>
      <main
        id="main-content"
        className={cn(
          "relative w-full",
          "max-w-7xl mx-auto px-1",
          (isCasaPage || isCafePage || isRestaurantPage) && "pb-16",
        )}
      >
        {children}
      </main>
    </ScrollSystem>
  )

  // Wrap content in NavigationProvider only for pages that need section navigation
  const wrappedContent =
    isCasaPage || isCafePage || isRestaurantPage ? <NavigationProvider>{content}</NavigationProvider> : content

  return (
    <>
      <AnimationInitializer />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[1001] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
        tabIndex={isHome ? -1 : 0}
        aria-hidden={isHome}
      >
        Skip to main content
      </a>

      {!isHome && <Navbar lang={lang} />}

      {wrappedContent}

      {!isHome && <Footer />}

      {!isHome && !isLoading && navItems.length > 0 && (
        <ClientOnly>
          <div className="md:hidden fixed bottom-[68px] left-0 right-0 z-40 bg-transparent backdrop-blur-md border-t border-b border-[var(--olivea-soil)]/10 w-full">
            <MobileSectionNav items={mobileDockItems} />
          </div>
        </ClientOnly>
      )}

      {!isHome && !isLoading && navItems.length > 0 && (
        <ClientOnly>
          <div className="hidden md:flex fixed top-1/2 left-6 -translate-y-1/2 z-40">
            <DockLeft items={navItems} />
          </div>
        </ClientOnly>
      )}

      {!isHome && (
        <ClientOnly>
          <div className="hidden md:flex fixed top-1/2 right-6 -translate-y-1/2 z-40">
            <DockRight items={dockRightItems} />
          </div>
        </ClientOnly>
      )}

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

      {!isHome && (
        <>
          <ScrollToTop />
          <NextGenBackground />
        </>
      )}
    </>
  )
}

export default memo(LayoutShell)
