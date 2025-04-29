"use client"

import { TypographyH2, TypographyP } from "@/components/ui/Typography"
import { useEffect, useRef, useState } from "react"
import MobileSectionTracker from "@/components/MobileSectionTracker"

export default function CasaClientPage({
  lang,
  dict,
}: {
  lang: string
  dict: any
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTimeRef = useRef(0)
  const sectionIds = ["rooms", "breakfast", "experiences", "location"]

  // Initialize scroll container and handle hash navigation
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    // Check if there's a hash in the URL and scroll to that section
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1)
      setTimeout(() => {
        const section = document.getElementById(sectionId)
        if (section && containerRef.current) {
          containerRef.current.scrollTo({
            top: section.offsetTop,
            behavior: "smooth",
          })
        }
      }, 300)
    }

    // Handle clicks on section links with minimal interference
    const handleSectionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]')

      if (link) {
        e.preventDefault()
        const href = link.getAttribute("href")
        if (href && href !== "#") {
          const sectionId = href.substring(1)
          const section = document.getElementById(sectionId)

          if (section && containerRef.current) {
            // Set scrolling state to prevent competing handlers
            setIsScrolling(true)

            // Update URL without reload
            window.history.pushState(null, "", href)

            // Scroll with smooth behavior
            containerRef.current.scrollTo({
              top: section.offsetTop,
              behavior: "smooth",
            })

            // Reset scrolling state after animation completes
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
            scrollTimeoutRef.current = setTimeout(() => {
              setIsScrolling(false)
            }, 1000)
          }
        }
      }
    }

    document.addEventListener("click", handleSectionClick)

    return () => {
      document.removeEventListener("click", handleSectionClick)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  // Add a scroll event handler to force section detection updates
  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to force section detection updates
    const forceUpdateSections = () => {
      // Dispatch a custom event to force section detection
      document.dispatchEvent(new Event("scroll"))

      // Also dispatch a custom event for the MobileSectionTracker
      const sections = document.querySelectorAll("section[id]")
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Calculate visibility
        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(windowHeight, rect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibility = visibleHeight / rect.height

        if (visibility > 0.3) {
          document.dispatchEvent(
            new CustomEvent("sectionInView", {
              detail: { id: section.id, intersectionRatio: visibility },
            }),
          )
        }
      })
    }

    // Add scroll event listener with throttling
    let scrollTimeout: NodeJS.Timeout | null = null
    const handleScroll = () => {
      if (scrollTimeout) return

      scrollTimeout = setTimeout(() => {
        forceUpdateSections()
        scrollTimeout = null
      }, 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    const scrollContainer = containerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true })
    }

    // Force initial update
    setTimeout(forceUpdateSections, 300)
    setTimeout(forceUpdateSections, 600)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-screen scroll-container overflow-y-auto pb-[120px] md:pb-0"
        style={{
          height: "100vh",
          scrollBehavior: "smooth",
          scrollSnapType: "y proximity", // Use proximity instead of mandatory
          overscrollBehavior: "none",
        }}
      >
        {/* Rooms Section */}
        <section
          id="rooms"
          className="min-h-screen w-full flex items-center justify-center px-6 snap-center"
          aria-labelledby="rooms-heading"
        >
          <div>
            <TypographyH2 id="rooms-heading">{dict.casa.sections.rooms.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.rooms.description}</TypographyP>
          </div>
        </section>

        {/* Breakfast Section */}
        <section
          id="breakfast"
          className="min-h-screen w-full flex items-center justify-center px-6 snap-center"
          aria-labelledby="breakfast-heading"
        >
          <div>
            <TypographyH2 id="breakfast-heading">{dict.casa.sections.breakfast.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.breakfast.description}</TypographyP>
          </div>
        </section>

        {/* Experiences Section */}
        <section
          id="experiences"
          className="min-h-screen w-full flex items-center justify-center px-6 snap-center"
          aria-labelledby="experiences-heading"
        >
          <div>
            <TypographyH2 id="experiences-heading">{dict.casa.sections.experiences.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.experiences.description}</TypographyP>
          </div>
        </section>

        {/* Location Section */}
        <section
          id="location"
          className="min-h-screen w-full flex items-center justify-center px-6 mb-0 snap-center"
          aria-labelledby="location-heading"
        >
          <div>
            <TypographyH2 id="location-heading">{dict.casa.sections.location.title}</TypographyH2>
            <TypographyP className="mt-2">{dict.casa.sections.location.description}</TypographyP>
          </div>
        </section>
      </div>

      {/* Add the MobileSectionTracker to help with mobile section detection */}
      <MobileSectionTracker sectionIds={sectionIds} />
    </>
  )
}
