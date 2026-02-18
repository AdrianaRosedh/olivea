// components/ui/scrollLock.ts

let lockCount = 0;
let previousOverflow: string | null = null;
let hasSafetyListeners = false;

function restore() {
  if (typeof document === "undefined") return;
  lockCount = 0;
  document.body.style.overflow = previousOverflow ?? "";
  previousOverflow = null;
}

function ensureSafetyListeners() {
  if (typeof window === "undefined") return;
  if (hasSafetyListeners) return;
  hasSafetyListeners = true;

  // If the page is being backgrounded / navigated away / put in bfcache,
  // make sure we never leave the body stuck in overflow:hidden.
  window.addEventListener(
    "pagehide",
    () => {
      restore();
    },
    { passive: true }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") restore();
    },
    { passive: true }
  );
}

/**
 * Ref-counted body scroll lock.
 * Safe for multiple overlays, sheets, modals, transitions.
 *
 * Usage:
 *   const unlock = lockBodyScroll();
 *   return unlock;
 */
export function lockBodyScroll() {
  if (typeof document === "undefined") return () => {};

  ensureSafetyListeners();

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  lockCount++;

  return () => {
    lockCount--;

    if (lockCount <= 0) {
      restore();
    }
  };
}
