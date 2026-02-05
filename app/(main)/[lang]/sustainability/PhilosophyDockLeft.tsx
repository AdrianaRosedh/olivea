"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lang, PhilosophySection } from "./philosophyTypes";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

const TOP_OFFSET_PX = 120;
const MANUAL_MS = 900;
const SWAP_Y = 26;
const IO_ROOT_MARGIN = "-45% 0px -45% 0px";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT, delay: 0.25 } },
};

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
  const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(Math.max(0, y), maxY);
}

function setSnapDisabled(disabled: boolean) {
  document.documentElement.classList.toggle("snap-disable", disabled);
}

export default function PhilosophyDockLeft({
  lang,
  sections,
}: {
  lang: Lang;
  sections: PhilosophySection[];
}) {
  const reduce = useReducedMotion();

  const items = useMemo(
    () =>
      sections.map((s, i) => ({
        id: s.id, // union type, but we'll store active as string for DOM safety
        label: s.title,
        number: String(i + 1).padStart(2, "0"),
      })),
    [sections]
  );

  // ✅ keep state as string (IO returns string ids)
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unlockTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    unlockTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      clearTimers();
      setSnapDisabled(true);
      unlockTimer.current = window.setTimeout(() => setSnapDisabled(false), MANUAL_MS);

      gsap.killTweensOf(window);
      gsap.to(window, {
        duration: reduce ? 0 : 0.95,
        ease: "power3.out",
        overwrite: "auto",
        scrollTo: { y: el, offsetY: TOP_OFFSET_PX, autoKill: false },
        onComplete: () => {
          const targetY = clampToMaxScroll(centerYFor(el));
          if (Math.abs(window.scrollY - targetY) > 10) {
            window.scrollTo({ top: targetY, behavior: "auto" });
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

  const onClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollToSection(id);
    },
    [scrollToSection]
  );

  // Deep link on mount
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

  // Active detection
  useEffect(() => {
    if (items.length === 0) return;

    const observed: Array<{ el: HTMLElement; id: string }> = [];
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observed.push({ el, id: it.id });
    }
    if (observed.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (!visible.length) return;

        const target = visible[0].target as HTMLElement;
        const match = observed.find((x) => x.el === target);
        if (!match) return;

        setActive(match.id);
      },
      { root: null, rootMargin: IO_ROOT_MARGIN, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    observed.forEach((x) => io.observe(x.el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    return () => {
      clearTimers();
      setSnapDisabled(false);
    };
  }, [clearTimers]);

  if (!items.length) return null;

  return (
    <nav
      className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto"
      aria-label={tt(lang, "Capítulos", "Chapters")}
    >
      <motion.div variants={dockV} initial={reduce ? false : "hidden"} animate="show" className="relative">
        <div className="absolute left-4.5 top-6 bottom-6 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/12 to-transparent" />

        <div className="mb-4 pl-10 text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-55">
          {tt(lang, "Capítulos", "Chapters")}
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const isActive = item.id === active;
            const isHovered = item.id === hoveredId;
            const isSwapping = isHovered && !reduce;

            const textClass = isActive
              ? "text-(--olivea-olive) font-black"
              : "text-(--olivea-olive) opacity-75 hover:opacity-100 hover:text-(--olivea-olive)";

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => onClick(e, item.id)}
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
                    initial={false}
                    animate={reduce ? { y: 0, opacity: 1 } : { y: isSwapping ? -SWAP_Y : 0, opacity: isSwapping ? 0 : 1 }}
                    transition={{
                      y: { type: "spring", stiffness: 220, damping: 22 },
                      opacity: { duration: 0.18 },
                    }}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.label}
                  </motion.div>

                  <motion.div
                    className="block text-[18px] font-semibold absolute top-0 left-0 whitespace-nowrap"
                    initial={reduce ? false : { y: SWAP_Y, opacity: 0 }}
                    animate={reduce ? { y: 0, opacity: 1 } : { y: isSwapping ? 0 : SWAP_Y, opacity: isSwapping ? 1 : 0 }}
                    transition={{
                      y: { type: "spring", stiffness: 220, damping: 22 },
                      opacity: { duration: 0.18 },
                    }}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.label}
                  </motion.div>

                  <motion.span
                    aria-hidden="true"
                    className="absolute left-0 right-6 -bottom-2 h-px bg-(--olivea-olive)/14 origin-left"
                    initial={false}
                    animate={{
                      scaleX: isActive || isHovered ? 1 : 0,
                      opacity: isActive || isHovered ? 1 : 0,
                    }}
                    transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}