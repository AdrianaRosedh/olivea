// ✅ CafeClientPage.tsx
"use client"

import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import MobileSectionTracker from "@/components/MobileSectionTracker"

type SectionDict = { title: string; description: string }
type MenuItem = { id: number; name: string; price: number; available: boolean }

export default function CafeClientPage({ lang, sections }: { lang: string; sections: { about?: SectionDict; coffee?: SectionDict; pastries?: SectionDict; menu?: SectionDict } }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const sectionIds = ["about", "coffee", "pastries", "menu"]

  useEffect(() => {
    async function fetchMenu() {
      const { data } = await supabase.from("cafe_menu").select("id, name, price, available").order("name")
      setMenuItems((data || []).filter((item) => item.available))
      setMenuLoading(false)
    }
    fetchMenu()
  }, [])

  useEffect(() => {
    const handleScrollToSection = (e: Event) => {
      const customEvent = e as CustomEvent
      const sectionId = customEvent.detail?.sectionId
      const section = document.getElementById(sectionId)
      if (section && containerRef.current) {
        containerRef.current.scrollTo({ top: section.offsetTop, behavior: "smooth" })
        window.history.pushState(null, "", `#${sectionId}`)
        setTimeout(() => window.dispatchEvent(new Event("scroll")), 600)
      }
    }
    document.addEventListener("scroll-to-section", handleScrollToSection)
    setTimeout(() => window.dispatchEvent(new Event("scroll")), 800)
    return () => document.removeEventListener("scroll-to-section", handleScrollToSection)
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="scroll-container min-h-screen overflow-y-auto pb-[120px] md:pb-0"
        style={{ height: "100vh", scrollBehavior: "smooth", scrollSnapType: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "y none" : "y proximity", overscrollBehavior: "none", WebkitOverflowScrolling: "touch" }}
      >
        {sectionIds.map((id) => (
          <section key={id} id={id} data-section-id={id} className="min-h-screen w-full flex flex-col items-center justify-center px-6 snap-center" aria-labelledby={`${id}-heading`}>
            <div className="max-w-2xl text-center">
              <TypographyH2 id={`${id}-heading`}>{sections[id]?.title}</TypographyH2>
              <TypographyP className="mt-2">{sections[id]?.description}</TypographyP>
              {id === "menu" && (
                <div className="mt-10">
                  {menuLoading ? <p className="text-muted-foreground">Loading menu...</p> :
                    menuItems.length > 0 ? (
                      menuItems.map((item) => (
                        <div key={item.id} className="flex justify-between border-b py-2">
                          <span>{item.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))
                    ) : <p className="text-muted-foreground">No items available</p>
                  }
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  )
}