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
  lang?: Lang;
}

/* ── Constants ───────────────────────────────────────────────────── */
const TOP_OFFSET_PX = 120;
const MANUAL_MS = 900;
const SWAP_Y = 26;
const IO_ROOT_MARGIN = "-45% 0px -45% 0px";

type Mode = "hidden" | "compact" | "expanded";

/* ── GSAP dynamic loader (cached) ────────────────────────────────── */
type GsapCore = {
  to: (target: unknown, vars: Record<string, unknown>) => unknown;
  registerPlugin: (...plugins: unknown[]) => void;
  killTweensOf: (target: unknown) => void;
};

type DefaultExport<T> = { default: T };

let _gsapPromise: Promise<GsapCore> | null = null;

function pickGsap(mod: typeof import("gsap")): GsapCore {
  if ("gsap" in mod && typeof mod.gsap === "object" && mod.gsap) {
    return mod.gsap as unknown as GsapCore;
  }
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

/* ── Helpers ─────────────────────────────────────────────────────── */
function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

function prefersReducedMotionOnce(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isCoarsePointerOnce(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * ✅ Mode rules:
 * - tablet portrait: hidden (mobile-like UI handles nav)
 * - tablet: compact
 * - small desktop (1025–1180): compact (fixes your screenshot)
 * - larger desktop: expanded
 */
function computeMode(): Mode {
  if (typeof window === "undefined") return "hidden";

  const portraitTablet = window.matchMedia(
    "(max-width: 900px) and (orientation: portrait)"
  ).matches;
  if (portraitTablet) return "hidden";

  const tabletBand = window.matchMedia(
    "(min-width: 768px) and (max-width: 1024px)"
  ).matches;
  if (tabletBand) return "compact";

  // ✅ small desktop should use compact rail (your request)
  const smallDesktop = window.matchMedia(
    "(min-width: 1025px) and (max-width: 1180px)"
  ).matches;
  if (smallDesktop) return "compact";

  const desktop = window.matchMedia("(min-width: 1025px)").matches;
  if (desktop) return "expanded";

  return window.matchMedia("(min-width: 768px)").matches ? "compact" : "hidden";
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
  (sEl as HTMLElement).scrollTo({
    top: target,
    behavior: smooth ? "smooth" : "auto",
  });
}

/* ── Motion easings / variants ───────────────────────────────────── */
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
  collapsed: { opacity: 0, y: -8, transition: { duration: 0.14, ease: EASE_IN } },
};

/* ── Visual positioning: keep dock near content on ultrawide ────── */
function getDockLeftX(mode: Mode) {
  const dockW =
    mode === "compact" ? "var(--dock-left-compact)" : "var(--dock-left-expanded)";

  return `max(
    calc(var(--gutter) + env(safe-area-inset-left)),
    calc((100vw - var(--content-max)) / 2 - var(--dock-gap) - ${dockW})
  )`;
}

/* ── Skeleton shown immediately while sections load ─────────────── */
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
            {Array.from({ length: 5 }).map((_, i) => (
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
            {Array.from({ length: 6 }).map((_, i) => (
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

/* ── Component ───────────────────────────────────────────────────── */
export default function DockLeft({ sectionsOverride, lang = "es" }: DockLeftProps) {
  const reduce = useReducedMotion();

  // hooks unconditionally
  const [mode, setMode] = useState<Mode>("hidden");
  const prmRef = useRef(false);
  const coarseRef = useRef(false);

  useEffect(() => {
    const update = () => {
      setMode(computeMode());
      prmRef.current = prefersReducedMotionOnce();
      coarseRef.current = isCoarsePointerOnce();
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

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
      (s.subs ?? []).forEach((sub) => (map[sub.id] = s.id));
    }
    return map;
  }, [sectionsOverride]);

  const [activeSection, setActiveSection] = useState(items[0]?.id || "");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;
    if (!activeSection || !items.some((x) => x.id === activeSection)) {
      setActiveSection(items[0].id);
      setActiveSub(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const unlockTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    unlockTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const scrollToSection = useCallback(
    async (id: string) => {
      const el =
        document.querySelector<HTMLElement>(`.subsection#${id}`) ||
        document.querySelector<HTMLElement>(`.main-section#${id}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();
      setSnapDisabled(true);
      unlockTimer.current = window.setTimeout(() => setSnapDisabled(false), MANUAL_MS);

      const scroller = getScrollableAncestor(el);
      const shouldUseNative = mode !== "expanded" || reduce || prmRef.current;

      if (shouldUseNative) {
        nativeScrollToElement(scroller, el, TOP_OFFSET_PX, !reduce && !prmRef.current);

        if (window.location.hash.slice(1) !== id) {
          window.history.replaceState(null, "", `#${id}`);
        }

        safetyTimer.current = window.setTimeout(() => setSnapDisabled(false), MANUAL_MS + 250);
        return;
      }

      const gsap = await getGsap();
      gsap.killTweensOf(scroller);

      gsap.to(scroller, {
        duration: reduce ? 0 : 0.95,
        ease: "power3.out",
        overwrite: "auto",
        scrollTo: { y: el, offsetY: TOP_OFFSET_PX, autoKill: false },
        onComplete: () => {
          const targetY = clampToMaxScroll(centerYFor(el));
          const currentY =
            scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;

          if (Math.abs(currentY - targetY) > 10) {
            if (scroller === window) window.scrollTo({ top: targetY, behavior: "auto" });
            else (scroller as HTMLElement).scrollTo({ top: targetY, behavior: "auto" });
          }

          setSnapDisabled(false);
        },
      });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }

      safetyTimer.current = window.setTimeout(() => setSnapDisabled(false), MANUAL_MS + 250);
    },
    [clearTimers, mode, reduce]
  );

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      void scrollToSection(id);
    },
    [scrollToSection]
  );

  // deep link on mount
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

  // active detection
  useEffect(() => {
    if (items.length === 0) return;

    const elMeta = new Map<Element, { id: string; kind: "main" | "sub" }>();

    for (const it of items) {
      const el =
        document.querySelector<HTMLElement>(`.main-section#${it.id}`) ||
        document.getElementById(it.id);
      if (el) elMeta.set(el, { id: it.id, kind: "main" });
    }

    for (const subId of Object.keys(subToParent)) {
      const el =
        document.querySelector<HTMLElement>(`.subsection#${subId}`) ||
        document.getElementById(subId);
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

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(flush);
    };

    const io = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        let bestRatio = 0;

        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const r = e.intersectionRatio ?? 0;
          if (!best || r > bestRatio) {
            best = e;
            bestRatio = r;
          }
        }

        if (!best) return;
        const meta = elMeta.get(best.target);
        if (!meta) return;

        pending = meta;
        schedule();
      },
      { root: null, rootMargin: IO_ROOT_MARGIN, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    for (const el of elMeta.keys()) io.observe(el);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [items, subToParent]);

  useEffect(() => {
    return () => {
      clearTimers();
      setSnapDisabled(false);
    };
  }, [clearTimers]);

  // render decisions AFTER hooks
  if (mode === "hidden") return null;

  if (items.length === 0) {
    return <DockSkeleton lang={lang} mode={mode} />;
  }

  /* ───────────────────────────────────────────────────────────── */
  /* COMPACT (tablet + small desktop) — Olivea aligned + label pill */
  /* ───────────────────────────────────────────────────────────── */
  if (mode === "compact") {
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
                    onClick={(e) => handleSmoothScroll(e, item.id)}
                    onFocus={() => setHoveredId(item.id)}
                    onBlur={() => setHoveredId(null)}
                    className={cn(
                      "relative flex items-center justify-center rounded-xl outline-none transition",
                      "min-h-(--tap)",
                      "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/25",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-cream)",
                      isActive ? "bg-(--olivea-olive)/10" : "hover:bg-(--olivea-olive)/6"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <span
                      className={cn(
                        "tabular-nums text-[12px] tracking-[0.22em] font-semibold",
                        isActive ? "text-(--olivea-olive) opacity-90" : "text-(--olivea-olive) opacity-70"
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

                  {/* ✅ Active label pill (Olivea-aligned) */}
                  <AnimatePresence initial={false}>
                    {(isActive || hoveredId === item.id) && (
                      <motion.div
                        initial={{ opacity: 0, x: -6, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: EASE_OUT }}
                        className="
                          pointer-events-none
                          absolute left-full ml-3 top-1/2 -translate-y-1/2
                          px-4 py-2 rounded-full
                          border border-(--olivea-olive)/12
                          bg-(--olivea-cream)/85 backdrop-blur-md
                          shadow-[0_14px_40px_-24px_rgba(0,0,0,0.45)]
                          text-[12px] font-semibold tracking-[0.08em] uppercase
                          text-(--olivea-olive) whitespace-nowrap
                        "
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

  /* ───────────────────────────────────────────────────────────── */
  /* EXPANDED (desktop)                                           */
  /* ───────────────────────────────────────────────────────────── */
  const left = getDockLeftX("expanded");
  const hoverEnabled = !reduce && !coarseRef.current;

  return (
    <nav
      className="hidden md:flex fixed z-40 pointer-events-auto"
      style={{ left, top: "50%", transform: "translateY(-50%)" }}
      aria-label={tt(lang, "Capítulos", "Chapters")}
    >
      <motion.div variants={dockV} initial="hidden" animate="show" className="relative">
        <div className="absolute left-4.5 top-6 bottom-6 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/12 to-transparent" />

        <div className="mb-4 pl-10 text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-55">
          {tt(lang, "Capítulos", "Chapters")}
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const isActive = item.id === activeSection;
            const isHovered = item.id === hoveredId;
            const isIntent = isActive || isHovered;
            const isSwapping = hoverEnabled && isHovered;

            const textClass = isActive
              ? "text-(--olivea-olive) font-black"
              : "text-(--olivea-olive) opacity-75 hover:opacity-100 hover:text-(--olivea-olive)";

            return (
              <div key={item.id} className={cn("flex flex-col", isActive ? "mb-4" : "mb-0")}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleSmoothScroll(e, item.id)}
                  onMouseEnter={hoverEnabled ? () => setHoveredId(item.id) : undefined}
                  onMouseLeave={hoverEnabled ? () => setHoveredId(null) : undefined}
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

                  <span
                    className={cn(
                      "w-10 tabular-nums text-[12px] tracking-[0.28em] font-semibold",
                      isActive ? "opacity-80" : "opacity-55"
                    )}
                  >
                    {item.number}
                  </span>

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
                      animate={{ scaleX: isIntent ? 1 : 0, opacity: isIntent ? 1 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
                    />
                  </div>
                </a>

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