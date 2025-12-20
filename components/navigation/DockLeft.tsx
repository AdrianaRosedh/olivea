"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

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
}

/* ── Constants ───────────────────────────────────────────────────── */
const TOP_OFFSET_PX = 120;
const MANUAL_MS = 1000;

/** Must be constant for clean up/down swap */
const SWAP_Y = 28;

/** Active detection “center band” */
const IO_ROOT_MARGIN = "-45% 0px -45% 0px";

/* ── Helpers ─────────────────────────────────────────────────────── */
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
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
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
  return node && node !== document.body && node !== document.documentElement ? node : window;
}

/* ── Motion easings ──────────────────────────────────────────────── */
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN: [number, number, number, number] = [0.12, 0, 0.39, 0];

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
export default function DockLeft({ sectionsOverride }: DockLeftProps) {
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
    (sectionId: string) => sectionsOverride.find((s) => s.id === sectionId)?.subs ?? [],
    [sectionsOverride]
  );

  const subToParent = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sectionsOverride) (s.subs ?? []).forEach((sub) => (map[sub.id] = s.id));
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

  /* Smooth scroll (your existing behavior preserved) */
  const scrollToSection = useCallback(
    (id: string) => {
      const el =
        document.querySelector<HTMLElement>(`.subsection#${id}`) ||
        document.querySelector<HTMLElement>(`.main-section#${id}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();
      setSnapDisabled(true);
      unlockTimer.current = window.setTimeout(() => setSnapDisabled(false), MANUAL_MS);

      const scroller = getScrollableAncestor(el);

      gsap.to(scroller, {
        duration: reduce ? 0 : 1.05,
        ease: "power3.out",
        overwrite: "auto",
        scrollTo: { y: el, offsetY: TOP_OFFSET_PX, autoKill: false },
        onComplete: () => {
          const targetY = clampToMaxScroll(centerYFor(el));
          const currentY =
            scroller === window ? window.scrollY : (scroller as Element).scrollTop;

          if (Math.abs(currentY - targetY) > 10) {
            if (scroller === window) window.scrollTo({ top: targetY, behavior: "auto" });
            else (scroller as Element).scrollTo({ top: targetY, behavior: "auto" });
          }
          setSnapDisabled(false);
        },
      });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }

      safetyTimer.current = window.setTimeout(() => setSnapDisabled(false), MANUAL_MS + 250);
    },
    [clearTimers, reduce]
  );

  const handleSmoothScroll = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollToSection(id);
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
      scrollToSection(hash);
    };
    kick();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Active detection: IntersectionObserver */
  useEffect(() => {
    if (items.length === 0) return;

    const observed: Array<{ el: HTMLElement; id: string; kind: "main" | "sub" }> = [];

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
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

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
      { root: null, rootMargin: IO_ROOT_MARGIN, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
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
      aria-label="Secciones"
    >
      <div className="relative">
        {/* Rail that breathes (feng shui): fades top/bottom */}
        <div className="absolute left-4.5top-6 bottom-6 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/10 to-transparent" />

        <div className="flex flex-col gap-6">
          {items.map((item) => {
            const isActive = item.id === activeSection;
            const isHovered = item.id === hoveredId;

            // This is the key: hover gets the full swap; active stays grounded.
            const isSwapping = isHovered;
            const isIntent = isHovered || isActive;

            // more depth/flow: active “inked”, inactive “whisper”
            const textClass = isActive
              ? "text-(--olivea-olive)"
              : "text-(--olivea-clay) opacity-70 hover:opacity-100 hover:text-(--olivea-olive)";

            // micro “organic” drift outside swap (safe)
            const driftX = reduce ? 0 : isIntent ? 3 : 0;

            // spacing: give the active section a little breathing room
            const wrapperClass = isActive ? "mb-4" : "mb-0";

            return (
              <div key={item.id} className={cn("flex flex-col transition-[margin] duration-200", wrapperClass)}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleSmoothScroll(e, item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  className={cn(
                    "group relative flex items-center gap-4 cursor-pointer",
                    "rounded-md outline-none",
                    "focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/25",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-(--olivea-white)",
                    textClass
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active stem marker */}
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

                  {/* Chapter numbers: calm + editorial */}
                  <span
                    className={cn(
                      "w-10 tabular-nums text-sm tracking-[0.22em] font-semibold",
                      isActive ? "opacity-85" : "opacity-55"
                    )}
                  >
                    {item.number}
                  </span>

                  {/* Drift wraps the label swap so swap stays perfectly aligned */}
                  <motion.div
                    initial={false}
                    animate={reduce ? { x: 0 } : { x: driftX }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                    className="relative h-8 overflow-hidden min-w-55"
                  >
                    {/* outgoing label (base) */}
                    <motion.div
                      className={cn(
                        "block text-2xl font-semibold whitespace-nowrap",
                        isActive ? "opacity-100" : "opacity-95"
                      )}
                      initial={false}
                      animate={
                        reduce
                          ? { y: 0, opacity: 1 }
                          : {
                              y: isSwapping ? -SWAP_Y : 0,
                              opacity: isSwapping ? 0 : 1,
                            }
                      }
                      transition={{
                        y: { type: "spring", stiffness: 220, damping: 22 },
                        opacity: { duration: 0.18 },
                      }}
                    >
                      {item.label}
                    </motion.div>

                    {/* incoming label (hover reveal) */}
                    <motion.div
                      className={cn(
                        "block text-2xl font-semibold absolute top-0 left-0 whitespace-nowrap",
                        // slightly “inked” on hover; active stays grounded
                        isSwapping ? "opacity-100" : "opacity-0"
                      )}
                      initial={reduce ? false : { y: SWAP_Y, opacity: 0 }}
                      animate={
                        reduce
                          ? { y: 0, opacity: 1 }
                          : {
                              y: isSwapping ? 0 : SWAP_Y,
                              opacity: isSwapping ? 1 : 0,
                            }
                      }
                      transition={{
                        y: { type: "spring", stiffness: 220, damping: 22 },
                        opacity: { duration: 0.18 },
                      }}
                    >
                      {item.label}
                    </motion.div>

                    {/* Subtle “root line” underline on hover/active */}
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
                  </motion.div>
                </a>

                {/* Sub-sections */}
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
                                    : "text-(--olivea-clay) opacity-80 hover:opacity-100 hover:text-(--olivea-olive)"
                                )}
                                aria-current={isSubActive ? "page" : undefined}
                              >
                                {/* Seed capsule marker */}
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
      </div>
    </nav>
  );
}
