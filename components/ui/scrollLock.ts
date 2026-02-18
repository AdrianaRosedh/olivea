// components/ui/scrollLock.ts

let lockCount = 0;

// saved styles/state for restore
let prevOverflow: string | null = null;
let prevPosition: string | null = null;
let prevTop: string | null = null;
let prevWidth: string | null = null;
let prevPaddingRight: string | null = null;

let scrollYAtLock = 0;

let hasSafetyListeners = false;

function getScrollbarWidth() {
  if (typeof window === "undefined") return 0;
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

function applyLock() {
  const body = document.body;

  scrollYAtLock = window.scrollY || window.pageYOffset || 0;

  prevOverflow = body.style.overflow;
  prevPosition = body.style.position;
  prevTop = body.style.top;
  prevWidth = body.style.width;
  prevPaddingRight = body.style.paddingRight;

  // prevent layout shift when scrollbar disappears (desktop)
  const sbw = getScrollbarWidth();
  if (sbw > 0) body.style.paddingRight = `${sbw}px`;

  // strongest cross-browser lock
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollYAtLock}px`;
  body.style.width = "100%";
}

function restoreStylesAndScroll() {
  const body = document.body;

  body.style.overflow = prevOverflow ?? "";
  body.style.position = prevPosition ?? "";
  body.style.top = prevTop ?? "";
  body.style.width = prevWidth ?? "";
  body.style.paddingRight = prevPaddingRight ?? "";

  window.scrollTo(0, scrollYAtLock);

  prevOverflow = null;
  prevPosition = null;
  prevTop = null;
  prevWidth = null;
  prevPaddingRight = null;
  scrollYAtLock = 0;
}

function ensureSafetyListeners() {
  if (typeof window === "undefined") return;
  if (hasSafetyListeners) return;
  hasSafetyListeners = true;

  window.addEventListener(
    "pagehide",
    () => {
      // kill any leaked locks
      lockCount = 0;
      try {
        restoreStylesAndScroll();
      } catch {}
    },
    { passive: true }
  );

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") {
        lockCount = 0;
        try {
          restoreStylesAndScroll();
        } catch {}
      }
    },
    { passive: true }
  );
}

/** Emergency escape hatch: use on route changes / error boundaries */
export function forceUnlockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount = 0;
  restoreStylesAndScroll();
}

/**
 * Ref-counted body scroll lock.
 * Safe for multiple overlays, sheets, modals, transitions.
 */
export function lockBodyScroll() {
  if (typeof document === "undefined") return () => {};

  ensureSafetyListeners();

  if (lockCount === 0) {
    applyLock();
  }

  lockCount++;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      restoreStylesAndScroll();
    }
  };
}

export function getScrollLockState() {
  return {
    lockCount,
    scrollYAtLock,
    body: typeof document === "undefined" ? null : {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    },
  };
}
