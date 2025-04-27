// This file creates a global event system for navigation events
// that works reliably with Next.js 15 and React 19

// Define custom events
export const EVENTS = {
  NAVIGATION_START: "navigation:start",
  NAVIGATION_COMPLETE: "navigation:complete",
  SCROLL_INITIALIZE: "scroll:initialize",
  SCROLL_START: "scroll:start",
  SCROLL_PROGRESS: "scroll:progress",
  SCROLL_COMPLETE: "scroll:complete",
}

// Helper to emit custom events
export function emitEvent(eventName: string, detail?: any) {
  if (typeof window === "undefined") return

  console.log(`[Navigation] Emitting event: ${eventName}`, detail)
  const event = new CustomEvent(eventName, { detail })
  document.dispatchEvent(event)
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
