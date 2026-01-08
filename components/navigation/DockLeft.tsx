// components/navigation/DockLeft.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────────────── */
type Identity = "casa" | "cafe" | "farmtotable";
type Lang = "es" | "en";

export type NavOverride = Array<{
  id: string;
  label: string;
  subs?: Array<{ id: string; label: string }>;
}>;

interface DockLeftProps {
  identity: Identity;
  sectionsOverride: NavOverride;

  /** Optional: lets DockLeft render “Capítulos/Chapters” like PhilosophyDockLeft */
  lang?: Lang;
}

/* ── Constants ───────────────────────────────────────────────────── */
const TOP_OFFSET_PX = 120;
const MANUAL_MS = 900;

/** Must be constant for clean up/down swap */
const SWAP_Y = 26;

/** Active detection “center band” */
const IO_ROOT_MARGIN = "-45% 0px -45% 0px";

/* ── GSAP dynamic loader (cached, no `any`) ───────────────────────── */
type GsapCore = {
  to: (target: unknown, vars: Record<string, unknown>) => unknown;
  registerPlugin: (...plugins: unknown[]) => void;
  killTweensOf: (target: unknown) => void;
};

type DefaultExport<T> = { default: T };

let _gsapPromise: Promise<GsapCore> | null = null;

function pickGsap(mod: typeof import("gsap")): GsapCore {
  // Common modern shape: { gsap }
  if ("gsap" in mod && typeof mod.gsap === "object" && mod.gsap) {
    return mod.gsap as unknown as GsapCore;
  }
  // Sometimes default export
  if ("default" in mod) {
    return (mod as DefaultExport<unknown>).default as unknown as GsapCore;
  }
  throw new Error("GSAP module shape not recognized.");
}

function pickScrollToPlugin(mod: typeof import("gsap/ScrollToPlugin")): unknown {
  if ("ScrollToPlugin" in mod) return mod.ScrollToPlugin;
  if ("default" in mod) return (mod as DefaultExport<unknown>).default;
  throw new Error("ScrollToPlugin module shape not recognized.");
}

async function getGsap(): Promise<GsapCore> {
  if (_gsapPromise) return _gsapPromise;

  _gsapPromise = (async () => {
    const mod = await import("gsap");
    const gsap = pickGsap(mod);

    const pluginMod = await import("gsap/ScrollToPlugin");
    const ScrollToPlugin = pickScrollToPlugin(pluginMod);

    gsap.registerPlugin(ScrollToPlugin);
    return gsap;
  })();

  return _gsapPromise;
}

function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 768px)").matches; // Tailwind md
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

function centerYFor(el: HTMLElement, topOffset = TOP_OFFSET_PX) {
  const vh = window.innerHeight;
  const rect = el.getBoundingClientRect();
  const pageY = window.pageYOffset;
  const h = Math.max(el.offsetHeight, 1);
  const idealY = rect.top + pageY - (vh - h) / 2 - topOffset;
  const alignTop = rect.top + pageY - topOffset;
  return h > vh ? Math.max(0, alignTop) : Math.max(0, idealY);
}

function clampToMaxScroll(y: number) {
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  return Math.min(Math.max(0, y), maxY);
}

function setSnapDisabled(disabled: boolean) {
  document.documentElement.classList.toggle("snap-disable", disabled);
}

function getScrollableAncestor(el: Element): Window | Element {
  let node: Element | null = el.parentElement;
  const isScrollable = (x: Element | null) =>
    !!x && /auto|scroll|overlay/i.test(getComputedStyle(x).overflowY);

  while (node && node !== document.body && !isScrollable(node)) {
    node = node.parentElement;
  }
  return node && node !== document.body && node !== document.documentElement
    ? node
    : window;
}

/** Mobile-safe native scroll fallback (no GSAP download) */
function nativeScrollToElement(
  scroller: Window | Element,
  el: HTMLElement,
  offsetY: number,
  smooth: boolean
) {
  const rect = el.getBoundingClientRect();

  if (scroller === window) {
    const y = clampToMaxScroll(window.scrollY + rect.top - offsetY);
    window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
    return;
  }

  const sEl = scroller as Element;
  const sRect = sEl.getBoundingClientRect();
  const current = (sEl as HTMLElement).scrollTop;
  const target = Math.max(0, current + (rect.top - sRect.top) - offsetY);
  (sEl as HTMLElement).scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
}

/* ── Motion easings / variants (Philosophy look) ─────────────────── */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_IN: [number, number, number, number] = [0.12, 0, 0.39, 0];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.25 },
  },
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
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASE_OUT },
  },
  collapsed: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.14, ease: EASE_IN },
  },
};

/* ── Component ───────────────────────────────────────────────────── */
export default function DockLeft({
  sectionsOverride,
  lang = "es",
}: DockLeftProps) {
  const reduce = useReducedMotion();

  const items = useMemo(
    () =>
      sectionsOverride.map((s, i) => ({
        id: s.id,
        label: s.label,
        number: String(i + 1).padStart(2, "0"),
      })),
    [sectionsOverride]
  );

  const subsForSection = useCallback(
    (sectionId: string) =>
      sectionsOverride.find((s) => s.id === sectionId)?.subs ?? [],
    [sectionsOverride]
  );

  const subToParent = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sectionsOverride)
      (s.subs ?? []).forEach((sub) => (map[sub.id] = s.id));
    return map;
  }, [sectionsOverride]);

  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unlockTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    unlockTimer.current = null;
    safetyTimer.current = null;
  }, []);

  /* Smooth scroll:
     - Desktop: uses GSAP (loaded lazily on first use)
     - Mobile/Reduced: native scroll fallback (zero GSAP download)
  */
  const scrollToSection = useCallback(
    async (id: string) => {
      const el =
        document.querySelector<HTMLElement>(`.subsection#${id}`) ||
        document.querySelector<HTMLElement>(`.main-section#${id}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();
      setSnapDisabled(true);
      unlockTimer.current = window.setTimeout(
        () => setSnapDisabled(false),
        MANUAL_MS
      );

      const scroller = getScrollableAncestor(el);
      const shouldUseNative = !isDesktop() || reduce || prefersReducedMotion();

      if (shouldUseNative) {
        nativeScrollToElement(
          scroller,
          el,
          TOP_OFFSET_PX,
          /* smooth */ !reduce && !prefersReducedMotion()
        );

        if (window.location.hash.slice(1) !== id) {
          window.history.replaceState(null, "", `#${id}`);
        }

        safetyTimer.current = window.setTimeout(
          () => setSnapDisabled(false),
          MANUAL_MS + 250
        );
        return;
      }

      const gsap = await getGsap();

      gsap.killTweensOf(scroller);

      const vars: Record<string, unknown> = {
        duration: reduce ? 0 : 0.95,
        ease: "power3.out",
        overwrite: "auto",
        scrollTo: { y: el, offsetY: TOP_OFFSET_PX, autoKill: false },
        onComplete: () => {
          const targetY = clampToMaxScroll(centerYFor(el));
          const currentY =
            scroller === window
              ? window.scrollY
              : (scroller as HTMLElement).scrollTop;

          if (Math.abs(currentY - targetY) > 10) {
            if (scroller === window)
              window.scrollTo({ top: targetY, behavior: "auto" });
            else
              (scroller as HTMLElement).scrollTo({ top: targetY, behavior: "auto" });
          }

          setSnapDisabled(false);
        },
      };

      gsap.to(scroller, vars);

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }

      safetyTimer.current = window.setTimeout(
        () => setSnapDisabled(false),
        MANUAL_MS + 250
      );
    },
    [clearTimers, reduce]
  );

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      void scrollToSection(id);
    },
    [scrollToSection]
  );

  /* Deep link on mount */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let tries = 0;
    const kick = () => {
      const el = document.getElementById(hash);
      if (!el && ++tries < 40) return window.setTimeout(kick, 50);
      if (!el) return;
      void scrollToSection(hash);
    };
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Active detection: IntersectionObserver */
  useEffect(() => {
    if (items.length === 0) return;

    const observed: Array<{ el: HTMLElement; id: string; kind: "main" | "sub" }> =
      [];

    for (const it of items) {
      const el =
        document.querySelector<HTMLElement>(`.main-section#${it.id}`) ||
        document.getElementById(it.id);
      if (el) observed.push({ el, id: it.id, kind: "main" });
    }

    for (const subId of Object.keys(subToParent)) {
      const el =
        document.querySelector<HTMLElement>(`.subsection#${subId}`) ||
        document.getElementById(subId);
      if (el) observed.push({ el, id: subId, kind: "sub" });
    }

    if (observed.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          );

        if (visible.length === 0) return;

        const target = visible[0].target as HTMLElement;
        const match = observed.find((x) => x.el === target);
        if (!match) return;

        if (match.kind === "sub") {
          setActiveSub(match.id);
          setActiveSection(subToParent[match.id]);
        } else {
          setActiveSub(null);
          setActiveSection(match.id);
        }
      },
      {
        root: null,
        rootMargin: IO_ROOT_MARGIN,
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }
    );

    observed.forEach((x) => io.observe(x.el));
    return () => io.disconnect();
  }, [items, subToParent]);

  useEffect(() => {
    return () => {
      clearTimers();
      setSnapDisabled(false);
    };
  }, [clearTimers]);

  if (items.length === 0) return null;

  return (
    <nav
      className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto"
      aria-label={tt(lang, "Capítulos", "Chapters")}
    >
      <motion.div
        variants={dockV}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="relative"
      >
        {/* rail */}
        <div className="absolute left-4.5 top-6 bottom-6 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/12 to-transparent" />

        {/* header */}
        <div className="mb-4 pl-10 text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-55">
          {tt(lang, "Capítulos", "Chapters")}
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const isActive = item.id === activeSection;
            const isHovered = item.id === hoveredId;
            const isIntent = isActive || isHovered;
            const isSwapping = isHovered && !reduce;

            const textClass = isActive
              ? "text-(--olivea-olive) font-black"
              : "text-(--olivea-olive) opacity-75 hover:opacity-100 hover:text-(--olivea-olive)";

            return (
              <div key={item.id} className={cn("flex flex-col", isActive ? "mb-4" : "mb-0")}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleSmoothScroll(e, item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-md outline-none",
                    "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/25",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-white)",
                    textClass
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* active stem */}
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

                  {/* numbers (Philosophy sizing) */}
                  <span
                    className={cn(
                      "w-10 tabular-nums text-[12px] tracking-[0.28em] font-semibold",
                      isActive ? "opacity-80" : "opacity-55"
                    )}
                  >
                    {item.number}
                  </span>

                  {/* label swap (Philosophy sizing + serif) */}
                  <div className="relative h-8 overflow-hidden min-w-55">
                    <motion.div
                      className="block text-[18px] font-semibold whitespace-nowrap"
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

                    <motion.div
                      className="block text-[18px] font-semibold absolute top-0 left-0 whitespace-nowrap"
                      style={{ fontFamily: "var(--font-serif)" }}
                      initial={reduce ? false : { y: SWAP_Y, opacity: 0 }}
                      animate={
                        reduce
                          ? { y: 0, opacity: 1 }
                          : { y: isSwapping ? 0 : SWAP_Y, opacity: isSwapping ? 1 : 0 }
                      }
                      transition={{
                        y: { type: "spring", stiffness: 220, damping: 22 },
                        opacity: { duration: 0.18 },
                      }}
                    >
                      {item.label}
                    </motion.div>

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

                {/* Sub-sections (kept, but typography already calm) */}
                <AnimatePresence initial={false}>
                  {isActive && subsForSection(item.id).length > 0 && (
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
                          {subsForSection(item.id).map((sub) => {
                            const isSubActive = sub.id === activeSub;

                            return (
                              <motion.a
                                key={sub.id}
                                href={`#${sub.id}`}
                                onClick={(e) => handleSmoothScroll(e, sub.id)}
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
                                    isSubActive ? "bg-(--olivea-olive)/40" : "bg-transparent"
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
          })}
        </div>
      </motion.div>
    </nav>
  );
}
