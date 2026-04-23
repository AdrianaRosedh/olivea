// components/navigation/DockLeft.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { tt, type Lang } from "@/lib/i18n";
import { scrollOffsetPx } from "@/lib/scroll-offset";

/* ── Types ───────────────────────────────────────────────────────── */
type Identity = "casa" | "cafe" | "farmtotable";

export type NavOverride = Array<{
  id: string;
  label: string;
  subs?: Array<{ id: string; label: string }>;
}>;

interface DockLeftProps {
  identity: Identity;
  sectionsOverride: NavOverride;
  lang?: Lang;
}

type Mode = "hidden" | "compact" | "expanded";

interface DockItem {
  id: string;
  label: string;
  number: string;
}

/* ── Constants ───────────────────────────────────────────────────── */
// Read from CSS --scroll-offset (single source of truth)
const TOP_OFFSET_PX = () => scrollOffsetPx();
const SNAP_LOCK_MS = 900;
const SWAP_Y = 26;
// Top: ignore the header zone (~20% of viewport).
// Bottom: ignore the lower 50%, so the "active" band is roughly 20%–50% of viewport.
// This gives a 30%-tall detection zone — much more forgiving than the old 10%.
const IO_ROOT_MARGIN = "-20% 0px -50% 0px";
const IO_THRESHOLDS = [0, 0.2, 0.4, 0.6, 0.8, 1];

/* ── Helpers ─────────────────────────────────────────────────────── */
function clampScroll(y: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(0, y), Math.max(0, max));
}

function setSnapDisabled(disabled: boolean) {
  document.documentElement.classList.toggle("snap-disable", disabled);
}

function findElement(id: string): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>(`.subsection#${CSS.escape(id)}`) ??
    document.querySelector<HTMLElement>(`.main-section#${CSS.escape(id)}`) ??
    document.getElementById(id)
  );
}

function getScrollableAncestor(el: Element): Window | Element {
  let node: Element | null = el.parentElement;
  while (node && node !== document.body) {
    if (/auto|scroll|overlay/i.test(getComputedStyle(node).overflowY)) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

/**
 * Lightweight RAF-based smooth scroll — replaces GSAP + ScrollToPlugin (~60KB).
 * Uses a cubic-bezier approximation of power3.out for matching feel.
 */
function smoothScrollTo(
  scroller: Window | Element,
  targetY: number,
  durationMs: number,
  signal: AbortSignal,
  onDone?: () => void
) {
  const startY =
    scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
  const delta = targetY - startY;

  if (Math.abs(delta) < 2 || durationMs === 0) {
    applyScroll(scroller, targetY);
    onDone?.();
    return;
  }

  const start = performance.now();

  const step = (now: number) => {
    if (signal.aborted) return;

    const elapsed = Math.min((now - start) / durationMs, 1);
    // power3.out easing: 1 - (1 - t)^3
    const eased = 1 - Math.pow(1 - elapsed, 3);
    applyScroll(scroller, startY + delta * eased);

    if (elapsed < 1) {
      requestAnimationFrame(step);
    } else {
      onDone?.();
    }
  };

  requestAnimationFrame(step);
}

function applyScroll(scroller: Window | Element, y: number) {
  if (scroller === window) {
    window.scrollTo({ top: y, behavior: "auto" });
  } else {
    (scroller as HTMLElement).scrollTop = y;
  }
}

function scrollTargetY(
  scroller: Window | Element,
  el: HTMLElement,
  offsetY: number
): number {
  const rect = el.getBoundingClientRect();

  if (scroller === window) {
    return clampScroll(window.scrollY + rect.top - offsetY);
  }

  const sEl = scroller as HTMLElement;
  const sRect = sEl.getBoundingClientRect();
  return Math.max(0, sEl.scrollTop + (rect.top - sRect.top) - offsetY);
}

/* ── Hooks ───────────────────────────────────────────────────────── */

/**
 * Reactive dock mode via matchMedia change listeners.
 * Only fires on actual breakpoint crosses (not every resize pixel).
 */
function useDockMode(): Mode {
  const [mode, setMode] = useState<Mode>("hidden");

  useEffect(() => {
    const queries = {
      portrait: window.matchMedia("(max-width: 900px) and (orientation: portrait)"),
      tablet: window.matchMedia("(min-width: 768px) and (max-width: 1024px)"),
      smallDesktop: window.matchMedia("(min-width: 1025px) and (max-width: 1280px)"),
      desktop: window.matchMedia("(min-width: 1281px)"),
    };

    const compute = () => {
      if (queries.portrait.matches) return setMode("hidden");
      if (queries.tablet.matches) return setMode("compact");
      if (queries.smallDesktop.matches) return setMode("compact");
      if (queries.desktop.matches) return setMode("expanded");
      setMode(window.innerWidth >= 768 ? "compact" : "hidden");
    };

    compute();

    const entries = Object.values(queries);
    for (const mq of entries) mq.addEventListener("change", compute);
    return () => {
      for (const mq of entries) mq.removeEventListener("change", compute);
    };
  }, []);

  return mode;
}

/**
 * Tracks which section/subsection is in the viewport center band.
 * Uses a single shared IntersectionObserver for all targets.
 */
function useActiveSection(
  items: DockItem[],
  subToParent: Record<string, string>
) {
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? "");
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // sync default when items change
  useEffect(() => {
    if (!items.length) return;
    setActiveSection((prev) => {
      if (prev && items.some((x) => x.id === prev)) return prev;
      return items[0].id;
    });
    setActiveSub(null);
  }, [items]);

  // IntersectionObserver for scroll-spy
  useEffect(() => {
    if (!items.length) return;

    const elMeta = new Map<Element, { id: string; kind: "main" | "sub" }>();

    for (const it of items) {
      const el = findElement(it.id);
      if (el) elMeta.set(el, { id: it.id, kind: "main" });
    }
    for (const subId of Object.keys(subToParent)) {
      const el = findElement(subId);
      if (el) elMeta.set(el, { id: subId, kind: "sub" });
    }

    if (elMeta.size === 0) return;

    let raf = 0;
    let pending: { id: string; kind: "main" | "sub" } | null = null;

    const flush = () => {
      raf = 0;
      if (!pending) return;
      const { id, kind } = pending;
      pending = null;

      if (kind === "sub") {
        setActiveSub(id);
        setActiveSection(subToParent[id]);
      } else {
        setActiveSub(null);
        setActiveSection(id);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        let bestRatio = 0;

        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > bestRatio) {
            best = e;
            bestRatio = e.intersectionRatio;
          }
        }

        if (!best) return;
        const meta = elMeta.get(best.target);
        if (!meta) return;

        pending = meta;
        if (!raf) raf = requestAnimationFrame(flush);
      },
      { root: null, rootMargin: IO_ROOT_MARGIN, threshold: IO_THRESHOLDS }
    );

    for (const el of elMeta.keys()) io.observe(el);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [items, subToParent]);

  return { activeSection, activeSub };
}

/* ── Motion variants ─────────────────────────────────────────────── */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_IN: [number, number, number, number] = [0.12, 0, 0.39, 0];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } },
};

const subContainerVariants: Variants = {
  open: {
    opacity: 1,
    height: "auto",
    marginTop: 10,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
      ease: EASE_IN_OUT,
      duration: 0.24,
    },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      when: "afterChildren",
      ease: EASE_IN_OUT,
      duration: 0.18,
    },
  },
};

const subItemVariants: Variants = {
  open: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } },
  collapsed: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.14, ease: EASE_IN },
  },
};

/* ── Visual positioning: keep dock near content on ultrawide ────── */
function getDockLeftX(mode: Mode) {
  const dockW =
    mode === "compact"
      ? "var(--dock-left-compact)"
      : "var(--dock-left-expanded)";

  return `max(
    calc(var(--gutter) + env(safe-area-inset-left)),
    calc((100vw - var(--content-max)) / 2 - var(--dock-gap) - ${dockW})
  )`;
}

/* ── Skeleton ────────────────────────────────────────────────────── */
function DockSkeleton({ lang, mode }: { lang: Lang; mode: Mode }) {
  const left = getDockLeftX(mode);

  if (mode === "compact") {
    return (
      <nav
        className="fixed z-40 pointer-events-none"
        style={{
          left,
          top: "50%",
          transform: "translateY(-50%)",
          width: "var(--dock-left-compact)",
        }}
        aria-hidden="true"
      >
        <div className="rounded-lg border border-(--olivea-olive)/12 bg-(--olivea-cream)/70 backdrop-blur-md shadow-[0_18px_54px_-30px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="px-2 pt-3 pb-2 text-[10px] uppercase tracking-[0.32em] text-(--olivea-olive) opacity-35 text-center">
            {tt(lang, "Cap.", "Ch.")}
          </div>
          <div className="flex flex-col gap-2 p-2 pt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="min-h-(--tap) rounded-xl bg-black/5" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="hidden md:flex fixed z-40 pointer-events-none"
      style={{ left, top: "50%", transform: "translateY(-50%)" }}
      aria-hidden="true"
    >
      <div className="relative">
        <div className="mb-4 pl-10 text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-35">
          {tt(lang, "Capítulos", "Chapters")}
        </div>
        <div className="w-55">
          <div className="flex flex-col gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-3 w-10 rounded bg-black/5" />
                <div className="h-5 w-36 rounded bg-black/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ── Compact Dock (tablet + small desktop) ───────────────────────── */
function CompactDock({
  items,
  activeSection,
  hoveredId,
  lang,
  onNavigate,
  onHover,
}: {
  items: DockItem[];
  activeSection: string;
  hoveredId: string | null;
  lang: Lang;
  onNavigate: (e: React.MouseEvent, id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const left = getDockLeftX("compact");

  return (
    <nav
      className="fixed z-40 pointer-events-auto"
      style={{
        left,
        top: "50%",
        transform: "translateY(-50%)",
        width: "var(--dock-left-compact)",
      }}
      aria-label={tt(lang, "Capítulos", "Chapters")}
    >
      <motion.div
        variants={dockV}
        initial="hidden"
        animate="show"
        className="rounded-lg border border-(--olivea-olive)/12 bg-(--olivea-cream)/70 backdrop-blur-md shadow-[0_18px_54px_-30px_rgba(0,0,0,0.35)] overflow-visible"
      >
        <div className="px-2 pt-3 pb-2 text-[10px] uppercase tracking-[0.32em] text-(--olivea-olive) opacity-55 text-center">
          {tt(lang, "Cap.", "Ch.")}
        </div>

        <ul className="flex flex-col gap-1 p-2 pt-1">
          {items.map((item) => {
            const isActive = item.id === activeSection;

            return (
              <li key={item.id} className="relative">
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onNavigate(e, item.id)}
                  onFocus={() => onHover(item.id)}
                  onBlur={() => onHover(null)}
                  className={cn(
                    "relative flex items-center justify-center rounded-xl outline-none transition",
                    "min-h-(--tap)",
                    "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/25",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-cream)",
                    isActive
                      ? "bg-(--olivea-olive)/10"
                      : "hover:bg-(--olivea-olive)/6"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  <span
                    className={cn(
                      "tabular-nums text-[12px] tracking-[0.22em] font-semibold",
                      isActive
                        ? "text-(--olivea-olive) opacity-90"
                        : "text-(--olivea-olive) opacity-70"
                    )}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.number}
                  </span>

                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                      isActive ? "bg-(--olivea-olive)/45" : "bg-transparent"
                    )}
                  />
                </a>

                {/* Active / hovered label pill */}
                <AnimatePresence initial={false}>
                  {(isActive || hoveredId === item.id) && (
                    <motion.div
                      initial={{ opacity: 0, x: -6, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: EASE_OUT }}
                      className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full border border-(--olivea-olive)/12 bg-(--olivea-cream)/85 backdrop-blur-md shadow-[0_14px_40px_-24px_rgba(0,0,0,0.45)] text-[12px] font-semibold tracking-[0.08em] uppercase text-(--olivea-olive) whitespace-nowrap"
                      style={{ fontFamily: "var(--font-serif)" }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </nav>
  );
}

/* ── Expanded Dock Item (desktop) ────────────────────────────────── */
function ExpandedItem({
  item,
  isActive,
  activeSub,
  hoveredId,
  hoverEnabled,
  reduce,
  subs,
  onNavigate,
  onHover,
}: {
  item: DockItem;
  isActive: boolean;
  activeSub: string | null;
  hoveredId: string | null;
  hoverEnabled: boolean;
  reduce: boolean;
  subs: Array<{ id: string; label: string }>;
  onNavigate: (e: React.MouseEvent, id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const isHovered = item.id === hoveredId;
  const isIntent = isActive || isHovered;
  const isSwapping = hoverEnabled && isHovered;

  return (
    <div className={cn("flex flex-col", isActive ? "mb-4" : "mb-0")}>
      <a
        href={`#${item.id}`}
        onClick={(e) => onNavigate(e, item.id)}
        onMouseEnter={hoverEnabled ? () => onHover(item.id) : undefined}
        onMouseLeave={hoverEnabled ? () => onHover(null) : undefined}
        onFocus={() => onHover(item.id)}
        onBlur={() => onHover(null)}
        className={cn(
          "group relative flex items-center gap-4 rounded-md outline-none",
          "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/25",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-white)",
          isActive
            ? "text-(--olivea-olive) font-black"
            : "text-(--olivea-olive) opacity-75 hover:opacity-100 hover:text-(--olivea-olive)"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Active stem indicator */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              key="stem"
              initial={{ opacity: 0, scaleY: 0.7 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.7 }}
              transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
              className="absolute left-4.5 top-1/2 h-9 w-px -translate-y-1/2 bg-(--olivea-olive)/35 origin-center"
            />
          )}
        </AnimatePresence>

        {/* Section number */}
        <span
          className={cn(
            "w-10 tabular-nums text-[12px] tracking-[0.28em] font-semibold",
            isActive ? "opacity-80" : "opacity-55"
          )}
        >
          {item.number}
        </span>

        {/* Label with hover swap effect (single element + translateY) */}
        <div className="relative h-8 overflow-hidden min-w-55">
          <motion.div
            className="text-[18px] font-semibold whitespace-nowrap"
            style={{ fontFamily: "var(--font-serif)" }}
            initial={false}
            animate={
              reduce
                ? { y: 0, opacity: 1 }
                : { y: isSwapping ? -SWAP_Y : 0, opacity: isSwapping ? 0 : 1 }
            }
            transition={{
              y: { type: "spring", stiffness: 220, damping: 22 },
              opacity: { duration: 0.18 },
            }}
          >
            {item.label}
          </motion.div>

          {!reduce && (
            <motion.div
              className="text-[18px] font-semibold absolute top-0 left-0 whitespace-nowrap"
              style={{ fontFamily: "var(--font-serif)" }}
              initial={{ y: SWAP_Y, opacity: 0 }}
              animate={{
                y: isSwapping ? 0 : SWAP_Y,
                opacity: isSwapping ? 1 : 0,
              }}
              transition={{
                y: { type: "spring", stiffness: 220, damping: 22 },
                opacity: { duration: 0.18 },
              }}
            >
              {item.label}
            </motion.div>
          )}

          {/* Underline */}
          <motion.span
            aria-hidden="true"
            className="absolute left-0 right-6 -bottom-2 h-px bg-(--olivea-olive)/14 origin-left"
            initial={false}
            animate={{
              scaleX: isIntent ? 1 : 0,
              opacity: isIntent ? 1 : 0,
            }}
            transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
          />
        </div>
      </a>

      {/* Subsections */}
      <AnimatePresence initial={false}>
        {isActive && subs.length > 0 && (
          <motion.div
            key="subs"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={subContainerVariants}
            className="ml-14 overflow-hidden"
          >
            <div className="relative pl-4">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/10 to-transparent" />
              <div className="flex flex-col gap-3">
                {subs.map((sub) => {
                  const isSubActive = sub.id === activeSub;

                  return (
                    <motion.a
                      key={sub.id}
                      href={`#${sub.id}`}
                      onClick={(e) => onNavigate(e, sub.id)}
                      variants={subItemVariants}
                      className={cn(
                        "relative block text-[13px] leading-snug tracking-[0.02em]",
                        "rounded-sm outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/20",
                        "focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-white)",
                        isSubActive
                          ? "text-(--olivea-olive) font-semibold"
                          : "text-(--olivea-olive) opacity-70 hover:opacity-100 hover:text-(--olivea-olive)"
                      )}
                      aria-current={isSubActive ? "page" : undefined}
                    >
                      <span
                        className={cn(
                          "absolute -left-3 top-[0.62em] h-1 w-2 rounded-full",
                          isSubActive
                            ? "bg-(--olivea-olive)/40"
                            : "bg-transparent"
                        )}
                      />
                      {sub.label}
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Expanded Dock wrapper ───────────────────────────────────────── */
function ExpandedDock({
  items,
  activeSection,
  activeSub,
  hoveredId,
  reduce,
  lang,
  subsForSection,
  onNavigate,
  onHover,
}: {
  items: DockItem[];
  activeSection: string;
  activeSub: string | null;
  hoveredId: string | null;
  reduce: boolean;
  lang: Lang;
  subsForSection: (id: string) => Array<{ id: string; label: string }>;
  onNavigate: (e: React.MouseEvent, id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const left = getDockLeftX("expanded");
  const hoverEnabled = !reduce && !window.matchMedia("(pointer: coarse)").matches;

  return (
    <nav
      className="hidden md:flex fixed z-40 pointer-events-auto"
      style={{ left, top: "50%", transform: "translateY(-50%)" }}
      aria-label={tt(lang, "Capítulos", "Chapters")}
    >
      <motion.div
        variants={dockV}
        initial="hidden"
        animate="show"
        className="relative"
      >
        {/* Vertical line */}
        <div className="absolute left-4.5 top-6 bottom-6 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/12 to-transparent" />

        {/* Header */}
        <div className="mb-4 pl-10 text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-55">
          {tt(lang, "Capítulos", "Chapters")}
        </div>

        {/* Items */}
        <div className="flex flex-col gap-5">
          {items.map((item) => (
            <ExpandedItem
              key={item.id}
              item={item}
              isActive={item.id === activeSection}
              activeSub={activeSub}
              hoveredId={hoveredId}
              hoverEnabled={hoverEnabled}
              reduce={reduce}
              subs={subsForSection(item.id)}
              onNavigate={onNavigate}
              onHover={onHover}
            />
          ))}
        </div>
      </motion.div>
    </nav>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function DockLeft({
  sectionsOverride,
  lang = "es",
}: DockLeftProps) {
  const reduce = !!useReducedMotion();
  const mode = useDockMode();

  /* ── Derived data ─────────────────────────────────────────────── */
  const items = useMemo(
    () =>
      (sectionsOverride ?? []).map((s, i) => ({
        id: s.id,
        label: s.label,
        number: String(i + 1).padStart(2, "0"),
      })),
    [sectionsOverride]
  );

  const subsForSection = useCallback(
    (sectionId: string) =>
      (sectionsOverride ?? []).find((s) => s.id === sectionId)?.subs ?? [],
    [sectionsOverride]
  );

  const subToParent = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sectionsOverride ?? []) {
      for (const sub of s.subs ?? []) map[sub.id] = s.id;
    }
    return map;
  }, [sectionsOverride]);

  /* ── Active section tracking ──────────────────────────────────── */
  const { activeSection, activeSub } = useActiveSection(items, subToParent);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /* ── Scroll navigation ────────────────────────────────────────── */
  const scrollAbort = useRef<AbortController | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupScroll = useCallback(() => {
    scrollAbort.current?.abort();
    scrollAbort.current = null;
    if (snapTimer.current) {
      clearTimeout(snapTimer.current);
      snapTimer.current = null;
    }
  }, []);

  // Ensure snap-disable is cleaned up on unmount
  useEffect(() => {
    return () => {
      cleanupScroll();
      setSnapDisabled(false);
    };
  }, [cleanupScroll]);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = findElement(id);
      if (!el) return;

      // Abort any in-flight scroll
      cleanupScroll();

      const scroller = getScrollableAncestor(el);
      const targetY = scrollTargetY(scroller, el, TOP_OFFSET_PX());
      const useSmooth = !reduce;

      // Lock snap during programmatic scroll
      setSnapDisabled(true);
      const abort = new AbortController();
      scrollAbort.current = abort;

      const unlock = () => {
        if (!abort.signal.aborted) setSnapDisabled(false);
      };

      if (!useSmooth) {
        applyScroll(scroller, targetY);
        unlock();
      } else {
        smoothScrollTo(scroller, targetY, 950, abort.signal, unlock);
      }

      // Safety net: always re-enable snap
      snapTimer.current = setTimeout(() => {
        setSnapDisabled(false);
        snapTimer.current = null;
      }, SNAP_LOCK_MS + 250);

      // Update hash without triggering scroll
      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }
    },
    [cleanupScroll, reduce]
  );

  const handleNav = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollToSection(id);
    },
    [scrollToSection]
  );

  /* ── Deep link on mount (MutationObserver instead of polling) ── */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Element might already exist
    const existing = document.getElementById(hash);
    if (existing) {
      scrollToSection(hash);
      return;
    }

    // Wait for element to appear in the DOM
    const observer = new MutationObserver(() => {
      if (document.getElementById(hash)) {
        observer.disconnect();
        scrollToSection(hash);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Timeout fallback: stop watching after 3s
    const timeout = setTimeout(() => observer.disconnect(), 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Render ───────────────────────────────────────────────────── */
  if (mode === "hidden") return null;

  if (items.length === 0) {
    return <DockSkeleton lang={lang} mode={mode} />;
  }

  if (mode === "compact") {
    return (
      <CompactDock
        items={items}
        activeSection={activeSection}
        hoveredId={hoveredId}
        lang={lang}
        onNavigate={handleNav}
        onHover={setHoveredId}
      />
    );
  }

  return (
    <ExpandedDock
      items={items}
      activeSection={activeSection}
      activeSub={activeSub}
      hoveredId={hoveredId}
      reduce={reduce}
      lang={lang}
      subsForSection={subsForSection}
      onNavigate={handleNav}
      onHover={setHoveredId}
    />
  );
}
