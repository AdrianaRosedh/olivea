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

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function setGlobalLockedFlag(on: boolean) {
  const el = document.documentElement;
  if (on) el.dataset.scrollLocked = "1";
  else delete el.dataset.scrollLocked;
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

  // ✅ Android-safe: avoid body position:fixed (some Android builds get “stuck”)
  if (isAndroid()) {
    body.style.overflow = "hidden";
    // keep existing positioning intact
    body.style.position = prevPosition ?? "";
    body.style.top = prevTop ?? "";
    body.style.width = prevWidth ?? "";
  } else {
    // iOS/desktop: fixed-body lock prevents background scroll reliably
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYAtLock}px`;
    body.style.width = "100%";
  }

  setGlobalLockedFlag(true);
}

function releaseLock() {
  const body = document.body;

  body.style.overflow = prevOverflow ?? "";
  body.style.position = prevPosition ?? "";
  body.style.top = prevTop ?? "";
  body.style.width = prevWidth ?? "";
  body.style.paddingRight = prevPaddingRight ?? "";

  // restore scroll position (only needed when we used fixed-body lock)
  if (!isAndroid()) {
    window.scrollTo(0, scrollYAtLock);
  }

  setGlobalLockedFlag(false);
}

function ensureSafetyListeners() {
  if (hasSafetyListeners || typeof window === "undefined") return;
  hasSafetyListeners = true;

  const hardUnlock = () => {
    if (document.documentElement.dataset.scrollLocked === "1") {
      lockCount = 0;
      releaseLock();
    }
  };

  // bfcache / tab switches / interrupted transitions
  window.addEventListener("pagehide", hardUnlock, { passive: true });
  window.addEventListener("pageshow", hardUnlock, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") hardUnlock();
  });

  // Panic unlock if user tries to scroll and we’re locked but no modal is open.
  // modal flag is controlled via components/ui/modalFlag.ts
  const tryPanicUnlock = () => {
    const locked = document.documentElement.dataset.scrollLocked === "1";
    const modalOpen = document.documentElement.dataset.modalOpen === "1";
    if (locked && !modalOpen) hardUnlock();
  };

  window.addEventListener("wheel", tryPanicUnlock, { passive: true });
  window.addEventListener("touchmove", tryPanicUnlock, { passive: true });
}

export function lockBodyScroll() {
  if (typeof window === "undefined") return;
  ensureSafetyListeners();

  lockCount += 1;
  if (lockCount === 1) applyLock();
}

export function unlockBodyScroll() {
  if (typeof window === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) releaseLock();
}

export function forceUnlockBodyScroll() {
  if (typeof window === "undefined") return;
  lockCount = 0;
  releaseLock();
}
