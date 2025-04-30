// Event name constants
export const EVENTS = {
  NAVIGATION_START: "navigation:start",
  NAVIGATION_COMPLETE: "navigation:complete",
  SCROLL_INITIALIZE: "scroll:initialize",
  SECTION_CHANGE: "section:change",
  SECTION_SNAP_START: "section:snap:start",
  SECTION_SNAP_COMPLETE: "section:snap:complete",
  SCROLL_PROGRESS: "scroll:progress",
  MOBILE_SCROLL_INITIALIZED: "mobile:scroll:initialized",
}

// Helper function to emit events
export function emitEvent(eventName: string, detail: any = {}) {
  if (typeof document !== "undefined") {
    document.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
      }),
    )
  }
}

// Initialize the navigation event system
export function initNavigationEvents() {
  if (typeof window === "undefined") return

  // Track navigation state
  let navigationInProgress = false

  // Create a MutationObserver to detect DOM changes that might indicate navigation
  const observer = new MutationObserver((mutations) => {
    // If we detect significant DOM changes and navigation isn't already in progress
    if (!navigationInProgress && mutations.length > 5) {
      navigationInProgress = true
      emitEvent(EVENTS.NAVIGATION_START)

      // After a short delay, emit navigation complete
      setTimeout(() => {
        navigationInProgress = false
        emitEvent(EVENTS.NAVIGATION_COMPLETE)

        // Trigger scroll initialization after navigation
        setTimeout(() => {
          emitEvent(EVENTS.SCROLL_INITIALIZE)
        }, 100)
      }, 100)
    }
  })

  // Start observing the entire document for changes
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  })

  // Also listen for popstate events (browser back/forward)
  window.addEventListener("popstate", () => {
    emitEvent(EVENTS.NAVIGATION_START)

    setTimeout(() => {
      emitEvent(EVENTS.NAVIGATION_COMPLETE)

      // Trigger scroll initialization after navigation
      setTimeout(() => {
        emitEvent(EVENTS.SCROLL_INITIALIZE)
      }, 100)
    }, 100)
  })

  console.log("[Navigation] Event system initialized")

  return () => {
    observer.disconnect()
    window.removeEventListener("popstate", () => {})
  }
}

// Helper to get the current scroll progress (0-1)
export function getScrollProgress() {
  if (typeof window === "undefined") return 0

  const scrollContainer = document.querySelector(".scroll-container") || document.documentElement
  const scrollTop = scrollContainer.scrollTop
  const scrollHeight = scrollContainer.scrollHeight
  const clientHeight = scrollContainer.clientHeight

  // Calculate progress (0 to 1)
  const maxScroll = Math.max(1, scrollHeight - clientHeight)
  return Math.min(1, scrollTop / maxScroll)
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
