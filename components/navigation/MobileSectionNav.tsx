// components/navigation/MobileSectionNav.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLenis } from "@/components/providers/ScrollProvider";

/* Types */
type Lenis = {
  scrollTo: (y: number, opts?: { duration?: number; easing?: (t: number) => number }) => void;
};
export interface MobileSectionNavItem { id: string; label: string; }
interface Props { items: MobileSectionNavItem[]; }
type NavSub = { id: string; label: string };

/* Constants (align with DockLeft) */
const TOP_OFFSET_PX  = 120;
const MANUAL_MS      = 600;                  // ignore updates briefly after taps
const STABLE_MS      = 160;                  // hysteresis window
const IO_ROOT_MARGIN = "-50% 0px -50% 0px";  // centerline strip
const RAF_MIN_MS     = 16;                   // throttle to ~1/frame

const EMPTY_SUBS: NavSub[] = [];

/* Helpers */
const isSub = (el: Element) => el.classList.contains("subsection");
const labelFor = (el: HTMLElement) =>
  el.getAttribute("data-label")?.trim() ||
  el.getAttribute("aria-label")?.trim() ||
  el.querySelector<HTMLElement>("h2,h3,h4")?.innerText?.trim() ||
  el.id || "…";

function centerYFor(el: HTMLElement, topOffset = TOP_OFFSET_PX) {
  const vh = window.innerHeight;
  const r  = el.getBoundingClientRect();
  const pageY = window.pageYOffset;
  const h  = Math.max(el.offsetHeight, 1);
  const ideal    = r.top + pageY - (vh - h) / 2 - topOffset;
  const alignTop = r.top + pageY - topOffset;
  return h > vh ? Math.max(0, alignTop) : Math.max(0, ideal);
}
function clampToMaxScroll(y: number) {
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, y), maxY);
}
function setSnapDisabled(disabled: boolean) {
  document.documentElement.classList.toggle("snap-disable", disabled);
}

export default function MobileSectionNav({ items }: Props) {
  const pathname = usePathname();
  const lenis = useLenis() as Lenis | null;

  const [activeId, setActiveId] = useState(items[0]?.id || "");
  const [subsMap, setSubsMap] = useState<Record<string, NavSub[]>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs   = useRef<Record<string, HTMLAnchorElement | null>>({});

  // manual navigation guard
  const manualRef    = useRef(false);
  const manualTO     = useRef<number | null>(null);

  // hysteresis on id
  const pendingIdRef = useRef<string | null>(null);
  const pendingAtRef = useRef<number>(0);

  // IO & scroll fallback caches
  const interSet     = useRef<Set<HTMLElement>>(new Set());
  const allTargets   = useRef<HTMLElement[]>([]);

  // rAF throttle
  const tickingRef   = useRef(false);
  const lastTsRef    = useRef(0);

  const mainIds = useMemo(() => items.map(i => i.id), [items]);
  const getSubs = useCallback((mainId: string): NavSub[] => subsMap[mainId] ?? EMPTY_SUBS, [subsMap]);

  /* Build target list (subs first, then mains) */
  const rebuildTargets = useCallback(() => {
    const targets = [
      ...Array.from(document.querySelectorAll<HTMLElement>(".subsection[id]")),
      ...mainIds
        .map((id) => document.querySelector<HTMLElement>(`.main-section#${id}`))
        .filter(Boolean) as HTMLElement[],
    ];
    allTargets.current = targets;
    return targets;
  }, [mainIds]);

  /* Tap → center; suppress IO/snap briefly */
  const scrollToId = useCallback((id: string) => {
    const el =
      (document.querySelector<HTMLElement>(`.subsection#${id}`)) ||
      (document.querySelector<HTMLElement>(`.main-section#${id}`)) ||
      document.getElementById(id);
    if (!el) return;

    const y = clampToMaxScroll(centerYFor(el));
    manualRef.current = true;
    setSnapDisabled(true);
    if (manualTO.current) clearTimeout(manualTO.current);
    manualTO.current = window.setTimeout(() => {
      manualRef.current = false;
      setSnapDisabled(false);
    }, MANUAL_MS);

    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(y, { duration: 1.0, easing: (t) => 1 - Math.pow(1 - t, 3) });
      setTimeout(() => { if (Math.abs(window.scrollY - y) > 10) window.scrollTo({ top: y, behavior: "auto" }); }, 160);
    } else {
      window.scrollTo({ top: y, behavior: "smooth" as ScrollBehavior });
    }

    setActiveId(id);
    if (window.location.hash.slice(1) !== id) window.history.replaceState(null, "", `#${id}`);
    navigator.vibrate?.(10);
  }, [lenis]);

  /* Discover subsections (document order) */
  const computeSubs = useCallback(() => {
    const map: Record<string, NavSub[]> = {};
    for (const main of items) {
      const sectionEl =
        document.querySelector<HTMLElement>(`.main-section#${main.id}`) ||
        document.getElementById(main.id);
      const list: NavSub[] = [];
      if (sectionEl) {
        sectionEl.querySelectorAll<HTMLElement>(".subsection[id]").forEach((subEl) => {
          list.push({ id: subEl.id, label: labelFor(subEl) });
        });
      }
      map[main.id] = list;
    }
    setSubsMap(map);
  }, [items]);

  useEffect(() => {
    const t = window.setTimeout(computeSubs, 150);
    window.addEventListener("resize", computeSubs);
    return () => { clearTimeout(t); window.removeEventListener("resize", computeSubs); };
  }, [computeSubs, pathname]);

  // When subsMap changes (late MDX/image mounts), refresh targets
  useEffect(() => { rebuildTargets(); }, [subsMap, rebuildTargets]);

  /* IO: update interSet and try to select candidate; otherwise rely on scroll fallback */
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      if (manualRef.current) return;
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) interSet.current.add(el);
        else interSet.current.delete(el);
      }
      // We do not pick candidate here; scroll fallback will do it continuously.
      // IO only maintains interSet for an accurate pool when available.
    }, { root: null, rootMargin: IO_ROOT_MARGIN, threshold: 0 });

    const targets = rebuildTargets();
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rebuildTargets, pathname]);

  /* Scroll fallback (rAF throttled): pick nearest to center when IO has none or during scroll) */
  useEffect(() => {
    const onScroll = (ts?: number) => {
      const now = ts ?? performance.now();
      if (tickingRef.current && now - lastTsRef.current < RAF_MIN_MS) return;
      tickingRef.current = true; lastTsRef.current = now;

      requestAnimationFrame(() => {
        tickingRef.current = false;
        if (manualRef.current) return; // let tap easing finish

        const pool = interSet.current.size > 0 ? Array.from(interSet.current) : allTargets.current;
        if (pool.length === 0) return;

        let candidateId: string | null = null;
        let best = Number.POSITIVE_INFINITY;
        const mid = window.innerHeight / 2;

        for (const el of pool) {
          const r = el.getBoundingClientRect();
          const center = r.top + r.height / 2;
          const delta  = Math.abs(center - mid);
          const bias   = isSub(el) ? 0 : 4;
          const score  = delta + bias;
          if (score < best) { best = score; candidateId = el.id || null; }
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
      className="mobile-section-nav fixed bottom-1 inset-x-0 z-40 flex gap-3 py-3 px-2 overflow-x-auto no-scrollbar bg-transparent backdrop-blur supports-[backdrop-filter]:bg-transparent"
      aria-label="Mobile section navigation"
    >
      {items.map((main) => {
        const subs = getSubs(main.id);

        return (
          <Fragment key={main.id}>
            {/* Main pill */}
            <motion.a
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

            {/* Inline subsections */}
            <AnimatePresence initial={false}>
              {subs.map((sub) => (
                <motion.a
                  key={sub.id}
                  ref={(el: HTMLAnchorElement | null) => { buttonRefs.current[sub.id] = el; }}
                  href={`#${sub.id}`}
                  onClick={(e) => { e.preventDefault(); scrollToId(sub.id); }}
                  aria-current={activeId === sub.id ? "location" : undefined}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium uppercase border whitespace-nowrap ml-2",
                    activeId === sub.id
                      ? "bg-[var(--olivea-olive)] text-white border-[var(--olivea-olive)]"
                      : "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/10"
                  )}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {sub.label}
                </motion.a>
              ))}
            </AnimatePresence>
          </Fragment>
        );
      })}
    </nav>
  );
}