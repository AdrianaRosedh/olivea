// lib/navigation-events.ts

export const EVENTS = {
  NAVIGATION_START: "navigation:start",
  NAVIGATION_COMPLETE: "navigation:complete",
  SCROLL_INITIALIZE: "scroll:initialize",
  SCROLL_START: "scroll:start",
  SCROLL_PROGRESS: "scroll:progress",
  SCROLL_COMPLETE: "scroll:complete",
  MOBILE_SCROLL_INITIALIZED: "mobile:scroll:initialized",
  SECTION_CHANGE: "section:change",
  SECTION_SNAP_START: "section:snap:start",
  SECTION_SNAP_COMPLETE: "section:snap:complete",
} as const;

/** Emit a typed CustomEvent */
export function emitEvent<T = unknown>(eventName: string, detail?: T): void {
  if (typeof window === "undefined") return;
  console.log(`[Navigation] Emitting event: ${eventName}`, detail);
  const event = new CustomEvent<T>(eventName, { detail });
  document.dispatchEvent(event);
}

/** Initialize the navigation event system */
export function initNavigationEvents(): () => void {
  if (typeof window === "undefined") return () => {};

  let navigationInProgress = false;

  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    if (!navigationInProgress && mutations.length > 5) {
      navigationInProgress = true;
      emitEvent(EVENTS.NAVIGATION_START);
      setTimeout(() => {
        navigationInProgress = false;
        emitEvent(EVENTS.NAVIGATION_COMPLETE);
        setTimeout(() => emitEvent(EVENTS.SCROLL_INITIALIZE), 100);
      }, 100);
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  const onPopState = (): void => {
    emitEvent(EVENTS.NAVIGATION_START);
    setTimeout(() => {
      emitEvent(EVENTS.NAVIGATION_COMPLETE);
      setTimeout(() => emitEvent(EVENTS.SCROLL_INITIALIZE), 100);
    }, 100);
  };
  window.addEventListener("popstate", onPopState);

  console.log("[Navigation] Event system initialized");

  return () => {
    observer.disconnect();
    window.removeEventListener("popstate", onPopState);
  };
}

export function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  const scrollContainer =
    document.querySelector<HTMLElement>(".scroll-container") ||
    document.documentElement;
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;
  const maxScroll = Math.max(1, scrollHeight - clientHeight);
  return Math.min(1, scrollTop / maxScroll);
}

export function getCurrentSection(): string | null {
  if (typeof window === "undefined") return null;
  const raw = document.querySelectorAll("section[id]") as NodeListOf<HTMLElement>;
  const sections = Array.prototype.slice.call(raw) as HTMLElement[];
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