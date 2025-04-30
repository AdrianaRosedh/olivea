// Event name constants
export const SECTION_EVENTS = {
  SECTION_IN_VIEW: "sectionInView", // Changed to match the event name used elsewhere
  SECTION_CHANGE: "sectionChange",
  SCROLL_START: "scrollStart",
  SCROLL_END: "scrollEnd",
}

// Notify that a section is in view
export function notifySectionChange(sectionId: string, source = "scroll") {
  console.log(`[section-navigation] Notifying section change: ${sectionId} (source: ${source})`)

  // Dispatch both event types to ensure compatibility
  document.dispatchEvent(
    new CustomEvent(SECTION_EVENTS.SECTION_IN_VIEW, {
      detail: {
        id: sectionId,
        intersectionRatio: 1.0,
        source,
      },
    }),
  )

  // Also dispatch the legacy event name that's used in some components
  document.dispatchEvent(
    new CustomEvent("sectionInView", {
      detail: {
        id: sectionId,
        intersectionRatio: 1.0,
        source,
      },
    }),
  )
}

// Scroll to a section
export function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId)
  if (section) {
    const container = document.querySelector(".scroll-container") as HTMLElement
    if (container) {
      // Notify that we're starting a scroll
      document.dispatchEvent(new CustomEvent(SECTION_EVENTS.SCROLL_START, { detail: { sectionId } }))

      // Scroll to the section
      container.scrollTo({ top: section.offsetTop, behavior: "smooth" })

      // Update URL hash without scrolling
      window.history.pushState(null, "", `#${sectionId}`)

      // Notify that the section has changed (due to click)
      notifySectionChange(sectionId, "click")

      // Notify that the scroll has ended after animation completes
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent(SECTION_EVENTS.SCROLL_END, { detail: { sectionId } }))
      }, 1000)
    }
  }
}

// Force a scroll update
export function forceScrollUpdate() {
  window.scrollBy(0, 1)
  window.scrollBy(0, -1)
  document.dispatchEvent(new Event("scroll"))
}

// Calculate scroll progress (0 to 1)
export function getScrollProgress() {
  const container = document.querySelector(".scroll-container") as HTMLElement
  if (!container) return 0

  const scrollHeight = container.scrollHeight - container.clientHeight
  return scrollHeight > 0 ? container.scrollTop / scrollHeight : 0
}

// Helper to get the current active section
export function getCurrentSection() {
  if (typeof window === "undefined") return null

  const sections = document.querySelectorAll("section[id]")
  if (sections.length === 0) return null

  let activeSection = null
  let maxVisibility = 0

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const windowHeight = window.innerHeight

    // Calculate how much of the section is visible
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)
    const visibility = visibleHeight / rect.height

    if (visibility > maxVisibility) {
      maxVisibility = visibility
      activeSection = section
    }
  })

  return activeSection ? activeSection.id : null
}
