// components/navigation/MobileSectionNav.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// GSAP scroll (works with window or any scroll container)
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

/* Types */
export interface MobileSectionNavItem { id: string; label: string; }
interface Props { items: MobileSectionNavItem[]; }

/* Constants */
const MANUAL_MS = 1000; // matches easing duration
const STABLE_MS = 300;  // hysteresis for active
const RAF_MIN_MS = 16;  // ~1 frame

/* Helpers */
function headerPx(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  const n = parseInt(v || "", 10);
  return Number.isFinite(n) && n > 0 ? n : 64;
}
function setSnapDisabled(disabled: boolean) {
  document.documentElement.classList.toggle("snap-disable", disabled);
}

/** Find the nearest vertical scrollable ancestor (else fall back to window) */
function getScrollableAncestor(el: Element): Window | Element {
  let node: Element | null = el.parentElement;
  const isScrollable = (x: Element | null) =>
    !!x && /auto|scroll|overlay/i.test(getComputedStyle(x).overflowY);

  while (node && node !== document.body && !isScrollable(node)) {
    node = node.parentElement;
  }
  return node && node !== document.body && node !== document.documentElement ? node : window;
}

export default function MobileSectionNav({ items }: Props) {
  const pathname = usePathname();

  const [activeId, setActiveId] = useState(items[0]?.id || "");

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs   = useRef<Record<string, HTMLAnchorElement | null>>({});

  // manual navigation guard
  const manualRef = useRef(false);
  const manualTO  = useRef<number | null>(null);

  // hysteresis on id
  const pendingIdRef = useRef<string | null>(null);
  const pendingAtRef = useRef<number>(0);

  // IO & scroll caches
  const interSet   = useRef<Set<HTMLElement>>(new Set());
  const allTargets = useRef<HTMLElement[]>([]);

  // rAF throttle
  const tickingRef = useRef(false);
  const lastTsRef  = useRef(0);

  const mainIds = useMemo(() => items.map(i => i.id), [items]);

  /* Build target list (MAINS ONLY) */
  const rebuildTargets = useCallback(() => {
    const targets = mainIds
      .map(id => document.querySelector<HTMLElement>(`.main-section#${id}`))
      .filter((x): x is HTMLElement => Boolean(x));
    allTargets.current = targets;
    return targets;
  }, [mainIds]);

  /* Tap → smooth GSAP scroll; suppress IO/snap briefly */
  const scrollToId = useCallback((id: string) => {
    const el =
      document.querySelector<HTMLElement>(`.main-section#${id}`) ||
      document.getElementById(id);
    if (!el) {
      console.warn(`[MobileSectionNav] target not found: #${id}`);
      return;
    }

    manualRef.current = true;
    setSnapDisabled(true);
    if (manualTO.current) window.clearTimeout(manualTO.current);
    manualTO.current = window.setTimeout(() => {
      manualRef.current = false;
      setSnapDisabled(false);
    }, MANUAL_MS);

    const topOffset = headerPx() + 8;
    const scroller = getScrollableAncestor(el);

    gsap.to(scroller, {
      duration: 0.9,
      ease: "power3.out",
      scrollTo: { y: el, offsetY: topOffset, autoKill: true },
      // onStart/onComplete available if you want to flip extra flags
    });

    // reflect in UI + URL
    setActiveId(id);
    if (window.location.hash.slice(1) !== id) {
      history.replaceState(null, "", `#${id}`);
    }
    navigator.vibrate?.(8);
  }, []);

  /* IO: maintain a pool of visible MAINS; actual picking happens in rAF */
  useEffect(() => {
    const top = headerPx() + 8;
    const io = new IntersectionObserver((entries) => {
      if (manualRef.current) return;
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) interSet.current.add(el);
        else interSet.current.delete(el);
      }
    }, {
      root: null,
      // calmer “center band” (top offset aware)
      rootMargin: `-${top}px 0px -66% 0px`,
      threshold: [0.25],
    });

    const targets = rebuildTargets();
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rebuildTargets, pathname]);

  /* Scroll fallback (rAF throttled): pick top-most visible MAIN deterministically */
  useEffect(() => {
    const onScroll = (ts?: number) => {
      const now = ts ?? performance.now();
      if (tickingRef.current && now - lastTsRef.current < RAF_MIN_MS) return;
      tickingRef.current = true; lastTsRef.current = now;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        if (manualRef.current) return;

        const pool = interSet.current.size > 0 ? Array.from(interSet.current) : allTargets.current;
        if (pool.length === 0) return;

        // choose the top-most main in view; stable before switching
        let candidateId: string | null = null;
        let bestTop = Number.POSITIVE_INFINITY;

        for (const el of pool) {
          const t = el.getBoundingClientRect().top;
          if (t >= 0 && t < bestTop) { bestTop = t; candidateId = el.id || null; }
        }
        if (!candidateId || candidateId === activeId) return;

        const tNow = performance.now();
        if (pendingIdRef.current !== candidateId) {
          pendingIdRef.current = candidateId;
          pendingAtRef.current = tNow;
          return;
        }
        if (tNow - pendingAtRef.current >= STABLE_MS) setActiveId(candidateId);
      });
    };

    const handler = () => onScroll(performance.now());
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    handler(); // initial
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [activeId]);

  /* Keep active pill centered horizontally */
  useEffect(() => {
    const cont = containerRef.current;
    const btn  = buttonRefs.current[activeId];
    if (!cont || !btn) return;
    const half = (cont.clientWidth - btn.offsetWidth) / 2;
    const left = btn.offsetLeft - half;
    const max  = cont.scrollWidth - cont.clientWidth;
    cont.scrollTo({ left: Math.max(0, Math.min(left, max)), behavior: "smooth" });
  }, [activeId]);

  return (
    <nav
      ref={containerRef}
      className="mobile-section-nav fixed bottom-1 inset-x-0 z-[96] pointer-events-auto flex gap-3 py-3 px-2 overflow-x-auto no-scrollbar bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent"
      aria-label="Mobile section navigation"
    >
      {items.map((main) => (
        <motion.a
          key={main.id}
          ref={(el: HTMLAnchorElement | null) => { buttonRefs.current[main.id] = el; }}
          href={`#${main.id}`}
          onClick={(e) => { e.preventDefault(); scrollToId(main.id); }}
          aria-current={activeId === main.id ? "location" : undefined}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium uppercase border whitespace-nowrap",
            activeId === main.id
              ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
              : "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/10"
          )}
          initial={false}
        >
          {main.label}
        </motion.a>
      ))}
    </nav>
  );
}