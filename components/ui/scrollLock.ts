// components/ui/scrollLock.ts

let lockCount = 0;
let previousOverflow: string | null = null;

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

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  lockCount++;

  return () => {
    lockCount--;

    if (lockCount <= 0) {
      lockCount = 0;
      document.body.style.overflow = previousOverflow ?? "";
      previousOverflow = null;
    }
  };
}
