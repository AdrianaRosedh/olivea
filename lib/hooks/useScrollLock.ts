"use client";

import { useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

/**
 * Locks page scrolling while `active` is true.
 *
 * Delegates to components/ui/scrollLock, which is the established lock in this
 * codebase and already does the things a hand-rolled version gets wrong:
 *
 *  - Locks BOTH html and body. globals.css sets `overflow-y: auto` on each, and
 *    when both are set the viewport scrolls <html> — so locking body alone (the
 *    usual snippet) does nothing at all.
 *  - Ref-counts, so a modal opened over another modal doesn't unlock the page
 *    when the inner one closes.
 *  - Compensates for scrollbar width, and force-unlocks on bfcache restore and
 *    tab switches so the page can never get stuck unscrollable.
 *
 * setModalOpen() is not optional. scrollLock installs a "panic unlock" on wheel
 * and touchmove that releases the lock whenever the page is locked but no modal
 * is flagged open — a safety net against a stuck page. Without the flag, the
 * first scroll gesture silently unlocks the page and it starts scrolling behind
 * the modal, which is exactly the bug this hook exists to prevent.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    setModalOpen(true);
    lockBodyScroll();

    // scrollLock force-unlocks on tab switch, bfcache restore and pagehide so a
    // page can never get stuck unscrollable. That guarantee is right for a
    // transient popup, but an editor stays open for the length of an article:
    // switch tabs once and you come back to a page scrolling behind the modal.
    // Re-assert the lock on return instead of weakening the safety net.
    const reassert = () => {
      if (document.visibilityState !== "visible") return;
      setModalOpen(true);
      if (document.documentElement.dataset.scrollLocked !== "1") {
        lockBodyScroll();
      }
    };
    document.addEventListener("visibilitychange", reassert);
    window.addEventListener("pageshow", reassert);
    window.addEventListener("focus", reassert);

    return () => {
      document.removeEventListener("visibilitychange", reassert);
      window.removeEventListener("pageshow", reassert);
      window.removeEventListener("focus", reassert);
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [active]);
}
