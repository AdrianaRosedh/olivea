"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import type { Identity, ItemKind, PressItem } from "./pressTypes";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

const TOP_OFFSET_PX = 120;

/**
 * Lightweight RAF-based smooth scroll — replaces GSAP + ScrollToPlugin (~15KB).
 * Uses power3.out easing for matching feel.
 */
function smoothScrollTo(
  targetY: number,
  durationMs: number,
  reduce: boolean,
) {
  const startY = window.scrollY;
  const delta = targetY - startY;

  if (Math.abs(delta) < 2 || durationMs === 0 || reduce) {
    window.scrollTo({ top: targetY, behavior: "auto" });
    return;
  }

  const start = performance.now();

  const step = (now: number) => {
    const elapsed = Math.min((now - start) / durationMs, 1);
    // power3.out easing: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - elapsed, 3);
    window.scrollTo({ top: startY + delta * eased, behavior: "auto" });

    if (elapsed < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function clampScroll(y: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(0, y), Math.max(0, max));
}

export function usePressDock({
  items,
  kind,
  setKind,
  identity,
  setIdentity,
  year,
  setYear,
  q,
  setQ,
  reduce,
}: {
  items: PressItem[];
  kind: ItemKind;
  setKind: (v: ItemKind) => void;
  identity: Identity;
  setIdentity: (v: Identity) => void;
  year: number | "all";
  setYear: (v: number | "all") => void;
  q: string;
  setQ: (v: string) => void;
  reduce: boolean;
}) {
  // ✅ Collapsed state (desktop)
  const [collapsed, setCollapsed] = useState(false);
  const userOverride = useRef<boolean | null>(null);

  // ✅ Mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);

  // ✅ Desktop gate (prevents desktop behaviors from running on mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  const isDesktopRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)"); // Tailwind md
    const sync = () => {
      setIsDesktop(mq.matches);
      isDesktopRef.current = mq.matches;
    };
    sync();

    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);

  // ✅ Desktop: auto-collapse at narrow widths
  useEffect(() => {
    const COLLAPSE_AT = 1180;
    const onResize = () => {
      if (userOverride.current !== null) return;
      setCollapsed(window.innerWidth <= COLLAPSE_AT);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleCollapsed = () => {
    userOverride.current = !collapsed;
    setCollapsed((v) => !v);
  };

  // ✅ Update CSS var for dock width
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--press-dock-left", collapsed ? "5.0rem" : "18.25rem");
    return () => {
      root.style.removeProperty("--press-dock-left");
    };
  }, [collapsed]);

  // ✅ Mobile bar hide/show (Safari-like)
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    // ✅ MOBILE ONLY
    if (isDesktopRef.current) return;

    const prev = lastY.current;
    lastY.current = y;

    // don't hide/show while sheet is open
    if (sheetOpen) return;

    // near top: always show
    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;

    const HIDE_DELTA = 14;
    const SHOW_DELTA = -2;

    if (delta > HIDE_DELTA) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < SHOW_DELTA) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
    }
  });

  // ✅ Lock body scroll when mobile sheet open
  useEffect(() => {
    if (!sheetOpen) return;

    setModalOpen(true);
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [sheetOpen]);

  // ✅ Timer management (cleanup on unmount)
  const safetyTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    safetyTimer.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // ✅ Year data
  const years = useMemo(() => {
    const s = new Set<number>();
    items.forEach((a) => {
      const y = Number(a.publishedAt.slice(0, 4));
      if (Number.isFinite(y)) s.add(y);
    });
    return Array.from(s).sort((a, b) => b - a);
  }, [items]);

  const topYearPicks = years.slice(0, 4);

  // ✅ Filter counts
  const countsByIdentity = useMemo(() => {
    const base = {
      all: items.length,
      olivea: 0,
      hotel: 0,
      restaurant: 0,
      cafe: 0,
    } as Record<Identity, number>;
    for (const it of items) base[it.for] += 1;
    return base;
  }, [items]);

  const anyFiltersOn = q || identity !== "all" || kind !== "all" || year !== "all";

  const resetAll = () => {
    setQ("");
    setIdentity("all");
    setKind("all");
    setYear("all");
  };

  // ✅ Smooth scroll to section (lightweight RAF on desktop, native on mobile)
  const scrollToSection = useCallback(
    (id: string) => {
      if (!isDesktopRef.current) return;

      const el =
        document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();

      const rect = el.getBoundingClientRect();
      const targetY = clampScroll(window.scrollY + rect.top - TOP_OFFSET_PX);
      smoothScrollTo(targetY, 950, reduce);

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }
    },
    [clearTimers, reduce]
  );

  const onNav = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();

      // ✅ mobile: native smooth scroll (no GSAP)
      if (!isDesktopRef.current) {
        const el =
          document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
          document.getElementById(id);
        if (el) {
          el.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        }
        setSheetOpen(false);
        return;
      }

      // ✅ desktop: GSAP
      scrollToSection(id);
      setSheetOpen(false);
    },
    [reduce, scrollToSection]
  );

  // ✅ Deep link on mount — DESKTOP ONLY
  useEffect(() => {
    if (!isDesktop) return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let tries = 0;
    const kick = () => {
      const el = document.getElementById(hash);
      if (!el && ++tries < 40) return window.setTimeout(kick, 50);
      if (!el) return;
      scrollToSection(hash);
    };
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    sheetOpen,
    setSheetOpen,
    isDesktop,
    isDesktopRef,
    barHidden,
    years,
    topYearPicks,
    countsByIdentity,
    anyFiltersOn,
    resetAll,
    onNav,
  };
}
