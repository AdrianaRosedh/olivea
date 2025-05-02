// lib/section-navigation.ts

// Event name constants
export const SECTION_EVENTS = {
  SECTION_IN_VIEW: "sectionInView",
  SECTION_CHANGE: "sectionChange",
  SCROLL_START: "scrollStart",
  SCROLL_END: "scrollEnd",
} as const;

type SectionEventValue = typeof SECTION_EVENTS[keyof typeof SECTION_EVENTS];

// Notify that a section is in view
export function notifySectionChange(
  sectionId: string,
  source: string = "scroll"
) {
  console.log(
    `[section-navigation] Notifying section change: ${sectionId} (source: ${source})`
  );

  // Dispatch the new event name
  document.dispatchEvent(
    new CustomEvent(SECTION_EVENTS.SECTION_IN_VIEW, {
      detail: { id: sectionId, intersectionRatio: 1.0, source },
    })
  );

  // Dispatch legacy event for backwards compatibility
  document.dispatchEvent(
    new CustomEvent("sectionInView", {
      detail: { id: sectionId, intersectionRatio: 1.0, source },
    })
  );
}

// Scroll to a section
export function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const container =
    document.querySelector<HTMLElement>(".scroll-container") ||
    document.documentElement;

  // Notify scroll start
  document.dispatchEvent(
    new CustomEvent(SECTION_EVENTS.SCROLL_START, {
      detail: { sectionId },
    })
  );

  // Perform smooth scroll
  container.scrollTo({ top: section.offsetTop, behavior: "smooth" });

  // Update the URL hash
  window.history.pushState(null, "", `#${sectionId}`);

  // Notify section change
  notifySectionChange(sectionId, "click");

  // Notify scroll end after animation duration
  setTimeout(() => {
    document.dispatchEvent(
      new CustomEvent(SECTION_EVENTS.SCROLL_END, {
        detail: { sectionId },
      })
    );
  }, 1000);
}

// Force a scroll update
export function forceScrollUpdate() {
  window.scrollBy(0, 1);
  window.scrollBy(0, -1);
  document.dispatchEvent(new Event("scroll"));
}

// Calculate scroll progress (0 to 1)
export function getScrollProgress(): number {
  const container =
    document.querySelector<HTMLElement>(".scroll-container") ||
    document.documentElement;
  const scrollHeight = container.scrollHeight - container.clientHeight;
  return scrollHeight > 0 ? container.scrollTop / scrollHeight : 0;
}

// Helper to get the current active section ID (or null)
export function getCurrentSection(): string | null {
  if (typeof window === "undefined") return null;

  // Gather all sections as HTMLElements
  const sections: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>("section[id]")
  );
  if (sections.length === 0) return null;

  let activeSection: HTMLElement | null = null;
  let maxVisibility = 0;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    const visibility = visibleHeight / rect.height;
    if (visibility > maxVisibility) {
      maxVisibility = visibility;
      activeSection = section;
    }
  }

  return activeSection ? activeSection.id : null;
}
