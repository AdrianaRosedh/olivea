// app/(main)/[lang]/press/PressDockLeft.tsx
"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { Identity, ItemKind, Lang, PressItem } from "./pressTypes";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.35 },
  },
};

// matches your main navbar overlay-ish spacing
const TOP_OFFSET_PX = 120;
const MANUAL_MS = 950;

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

export default function PressDockLeft({
  lang,
  items,
  kind,
  setKind,
  identity,
  setIdentity,
  year,
  setYear,
  q,
  setQ,
  count,
}: {
  lang: Lang;
  items: PressItem[];

  kind: ItemKind;
  setKind: (v: ItemKind) => void;

  identity: Identity;
  setIdentity: (v: Identity) => void;

  year: number | "all";
  setYear: (v: number | "all") => void;

  q: string;
  setQ: (v: string) => void;

  count: number;
}) {
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);

  const unlockTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    unlockTimer.current = null;
    safetyTimer.current = null;
  }, []);

  const years = useMemo(() => {
    const s = new Set<number>();
    items.forEach((a) => {
      const y = Number(a.publishedAt.slice(0, 4));
      if (Number.isFinite(y)) s.add(y);
    });
    return Array.from(s).sort((a, b) => b - a);
  }, [items]);

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

  const sectionLabel = cn(
    "text-[12px] uppercase tracking-[0.30em]",
    "text-(--olivea-olive) opacity-90"
  );

  const subtleLink = cn(
    "text-[13px] text-(--olivea-olive) opacity-80 hover:opacity-100",
    "underline underline-offset-4 decoration-(--olivea-olive)/25 hover:decoration-(--olivea-olive)/45"
  );

  const capsule = cn(
    "rounded-full",
    "bg-white/18",
    "ring-1 ring-(--olivea-olive)/16",
    "backdrop-blur-[2px]"
  );

  const chipBase = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/14 text-(--olivea-clay) opacity-95",
    "hover:bg-white/24 hover:text-(--olivea-olive) hover:opacity-100"
  );

  const chipActive = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/26",
    "bg-(--olivea-olive)/12 text-(--olivea-olive) opacity-100"
  );

  const kindLabel = (k: ItemKind) => {
    if (k === "all") return tt(lang, "Todo", "All");
    if (k === "award") return tt(lang, "Reconoc.", "Awards");
    return tt(lang, "Prensa", "Press");
  };

  const identLabel = (x: Identity) => {
    if (x === "all") return tt(lang, "Todos", "All");
    if (x === "olivea") return `Olivea (${countsByIdentity.olivea})`;
    if (x === "hotel")
      return `${tt(lang, "Hotel", "Hotel")} (${countsByIdentity.hotel})`;
    if (x === "restaurant")
      return `${tt(lang, "Rest.", "Rest.")} (${countsByIdentity.restaurant})`;
    return `${tt(lang, "Café", "Café")} (${countsByIdentity.cafe})`;
  };

  const topYearPicks = years.slice(0, 4);

  // ---- Smooth scroll to section (GSAP) ----
  const scrollToSection = useCallback(
    (id: string) => {
      const el =
        document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();

      // Kill any in-flight scroll tween to avoid “rubber band”
      gsap.killTweensOf(window);

      gsap.to(window, {
        duration: reduce ? 0 : 0.95,
        ease: "power3.out",
        overwrite: true,
        scrollTo: {
          y: el,
          offsetY: TOP_OFFSET_PX,
          autoKill: true,
        },
        onComplete: () => {
          // no second adjustment = no bounce
        },
      });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }

      safetyTimer.current = window.setTimeout(() => {}, MANUAL_MS + 250);
    },
    [clearTimers, reduce]
  );
  
  const onNav = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      scrollToSection(id);
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
      scrollToSection(hash);
    };
    kick();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <nav
      className="hidden md:block fixed left-6 z-40 pointer-events-auto"
      style={{ top: 255 }}
      aria-label="Press dock"
    >
      <motion.div
        variants={dockV}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="w-70 xl:w-75"
      >
        <div className="relative pl-5">
          {/* Journal-like rail */}
          <div className="absolute left-2 top-1 bottom-1 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/18 to-transparent" />

          {/* Header */}
          <div className="flex items-baseline justify-between">
            <div className={sectionLabel}>{tt(lang, "Prensa", "Press")}</div>
            <div className="text-[12px] text-(--olivea-olive) opacity-80">
              {count} {tt(lang, "items", "items")}
            </div>
          </div>

          {/* Finder */}
          <div className="mt-4">
            <div className={sectionLabel}>{tt(lang, "Buscar", "Search")}</div>
            <div className={cn("mt-2 px-4 py-2.5", capsule)}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tt(lang, "Título, medio, tag…", "Title, outlet, tag…")}
                className={cn(
                  "w-full bg-transparent outline-none",
                  "text-[13px] text-(--olivea-olive)",
                  "placeholder:text-(--olivea-clay)/65"
                )}
              />
            </div>
          </div>

          {/* Scroll helper (smooth) */}
          <div className="mt-6">
            <div className={sectionLabel}>{tt(lang, "Secciones", "Sections")}</div>
            <div className="mt-2 flex flex-col gap-2">
              <a href="#awards" className={subtleLink} onClick={(e) => onNav(e, "awards")}>
                {tt(lang, "Reconocimientos", "Awards")}
              </a>
              <a
                href="#mentions"
                className={subtleLink}
                onClick={(e) => onNav(e, "mentions")}
              >
                {tt(lang, "Menciones en prensa", "Press mentions")}
              </a>
              <a
                href="#presskit"
                className={subtleLink}
                onClick={(e) => onNav(e, "presskit")}
              >
                Press Kit
              </a>
              <a
                href="#contact"
                className={subtleLink}
                onClick={(e) => onNav(e, "contact")}
              >
                {tt(lang, "Contacto", "Contact")}
              </a>
              <a href="#top" className={subtleLink} onClick={(e) => onNav(e, "top")}>
                {tt(lang, "Arriba", "Top")}
              </a>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>{tt(lang, "Filtrar", "Filter")}</div>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="text-[12px] text-(--olivea-olive) opacity-80 hover:opacity-100 underline underline-offset-4"
              >
                {moreOpen ? tt(lang, "Menos", "Less") : tt(lang, "Más", "More")}
              </button>
            </div>

            {/* Identity always visible */}
            <div className="mt-2 flex flex-wrap gap-2">
              {(["all", "olivea", "hotel", "restaurant", "cafe"] as Identity[]).map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setIdentity(x)}
                  className={identity === x ? chipActive : chipBase}
                >
                  {identLabel(x)}
                </button>
              ))}
            </div>

            {/* Advanced (Type + Year) */}
            <AnimatePresence>
              {moreOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="mt-3 rounded-2xl bg-white/14 ring-1 ring-(--olivea-olive)/14 backdrop-blur-[2px] p-3"
                >
                  <div className="text-[11px] text-(--olivea-olive) opacity-80">
                    {tt(lang, "Tipo", "Type")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["all", "award", "mention"] as ItemKind[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={kind === k ? chipActive : chipBase}
                      >
                        {kindLabel(k)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 text-[11px] text-(--olivea-olive) opacity-80">
                    {tt(lang, "Año", "Year")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setYear("all")}
                      className={year === "all" ? chipActive : chipBase}
                    >
                      {tt(lang, "Todos", "All")}
                    </button>
                    {topYearPicks.map((y) => (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setYear(y)}
                        className={year === y ? chipActive : chipBase}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}