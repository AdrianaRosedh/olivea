"use client"

import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import MobileSectionTracker from "@/components/MobileSectionTracker"

type SectionDict = { title: string; description: string }
type MenuItem = { id: number; name: string; price: number; available: boolean; category: string }

export default function CafeClientPage({
  lang,
  sections,
}: {
  lang: string
  sections: { about?: SectionDict; coffee?: SectionDict; pastries?: SectionDict; menu?: SectionDict }
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const sectionIds = ["about", "coffee", "pastries", "menu"]

  function notifySectionChange(sectionId: string) {
    document.dispatchEvent(new CustomEvent("sectionInView", { detail: { id: sectionId, intersectionRatio: 1.0 } }))
  }

  function forceUpdateSections() {
    const sections = document.querySelectorAll("section[id]")
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const visibleTop = Math.max(0, rect.top)
      const visibleBottom = Math.min(windowHeight, rect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)
      const visibility = visibleHeight / rect.height
      if (visibility > 0.3) {
        notifySectionChange(section.id)
      }
    })
  }

  useEffect(() => {
    let isMounted = true

    async function fetchMenu() {
      try {
        const { data, error: supabaseError } = await supabase
          .from("cafe_menu")
          .select("id, name, price, available, category")
          .order("name")

        if (supabaseError) {
          console.error("Supabase error:", supabaseError)
          if (isMounted) {
            setError(supabaseError.message)
            setMenuLoading(false)
          }
          return
        }

        if (data && isMounted) {
          const availableItems = data.filter((item) => item.available)
          setMenuItems(availableItems)

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(availableItems.map((item) => item.category)))
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Error fetching menu:", error)
        if (isMounted) {
          setError("Failed to load menu data")
        }
      } finally {
        if (isMounted) {
          setMenuLoading(false)
        }
      }
    }

    fetchMenu()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement
      if (link) {
        e.preventDefault()
        const sectionId = link.getAttribute("href")?.substring(1)
        const section = document.getElementById(sectionId!)
        if (section && containerRef.current) {
          containerRef.current.scrollTo({ top: section.offsetTop, behavior: "smooth" })
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
          scrollTimeoutRef.current = setTimeout(() => notifySectionChange(sectionId!), 800)
        }
      }
    }
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const force = () => {
      window.scrollBy(0, 1)
      window.scrollBy(0, -1)
      document.dispatchEvent(new Event("scroll"))
    }
    force()
    const timers = [100, 300, 600, 1000].map((t) => setTimeout(force, t))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Combine standard sections with dynamic category sections
  const allSectionIds = [...sectionIds, ...categories]

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-screen overflow-y-auto pb-[120px] md:pb-0"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          scrollSnapType: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "y none" : "y proximity",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Standard sections */}
        {sectionIds.map((id) => (
          <section
            key={id}
            id={id}
            data-section-id={id}
            className="min-h-screen w-full flex flex-col items-center justify-center px-6 snap-center"
            aria-labelledby={`${id}-heading`}
          >
            <div className="max-w-2xl text-center">
              <TypographyH2 id={`${id}-heading`}>{sections[id]?.title}</TypographyH2>
              <TypographyP className="mt-2">{sections[id]?.description}</TypographyP>

              {id === "menu" && (
                <div className="mt-10">
                  {menuLoading ? (
                    <p className="text-muted-foreground">Loading menu...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : menuItems.length > 0 ? (
                    <div className="space-y-8">
                      {categories.map((category) => (
                        <div key={category} className="text-left">
                          <h3 className="text-xl font-serif mb-4 border-b pb-2">{category}</h3>
                          <div className="space-y-4">
                            {menuItems
                              .filter((item) => item.category === category)
                              .map((item) => (
                                <div key={item.id} className="flex justify-between border-b py-2">
                                  <span>{item.name}</span>
                                  <span>${item.price.toFixed(2)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No items available</p>
                  )}
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Category sections */}
        {categories.map((category) => (
          <section
            key={category}
            id={category}
            data-section-id={category}
            className="min-h-screen w-full flex flex-col items-center justify-center px-6 snap-center"
            aria-labelledby={`${category}-heading`}
          >
            <div className="max-w-2xl">
              <TypographyH2 id={`${category}-heading`}>{category}</TypographyH2>
              <div className="mt-6 space-y-4">
                {menuItems
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between border-b py-2">
                      <span>{item.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <MobileSectionTracker sectionIds={allSectionIds} />
    </>
  )
}
