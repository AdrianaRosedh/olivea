"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { JournalFilterDockProps } from "./JournalFilterDock";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: 0.12 },
  },
};

const panelV: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.18, ease: EASE },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.22, ease: EASE },
  },
};

function labelAll(lang: JournalFilterDockProps["lang"]) {
  return lang === "es" ? "Todos" : "All";
}
function tt(lang: JournalFilterDockProps["lang"], es: string, en: string) {
  return lang === "es" ? es : en;
}

function getNavbarEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;

  const header = document.querySelector("header");
  if (header instanceof HTMLElement) return header;

  const candidates = [
    "[data-navbar]",
    "[data-desktop-navbar]",
    "nav[aria-label*='Primary']",
    "nav",
  ];
  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el instanceof HTMLElement) return el;
  }
  return null;
}

export default function JournalFilterDockDesktop(props: JournalFilterDockProps) {
  const {
    lang,
    posts,
    q,
    setQ,
    pillar,
    setPillar,
    tag,
    setTag,
    year,
    setYear,
    time,
    setTime,
    sort,
    setSort,
    onClear,
    count,
  } = props;

  const reduce = useReducedMotion();

  // “More” = extra chips sections
  const [moreOpen, setMoreOpen] = useState(false);

  // Full dock collapse (xl+)
  const [collapsed, setCollapsed] = useState(false);

  // Compact popover (lg)
  const [compactOpen, setCompactOpen] = useState(false);

  // Smart top offset (lower)
  const [topOffset, setTopOffset] = useState(280);

  const computeTop = useCallback(() => {
    if (typeof window === "undefined") return;

    const nav = getNavbarEl();
    const navH = nav?.getBoundingClientRect().height ?? 0;

    // Lower baseline than before (so it never fights the left logo)
    const baseGap = window.scrollY > 8 ? 78 : 108;
    const next = Math.round(Math.min(420, Math.max(240, navH + baseGap)));
    setTopOffset(next);
  }, []);

  const computeAutoCollapse = useCallback(() => {
    if (typeof window === "undefined") return;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Only auto-collapse on short desktops
    const should = vh < 760 || (vw < 1320 && vh < 860);
    setCollapsed(should);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    computeTop();
    computeAutoCollapse();

    const onResize = () => {
      computeTop();
      computeAutoCollapse();
      setCompactOpen(false);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", computeTop, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", computeTop);
    };
  }, [computeTop, computeAutoCollapse]);

  const pillars = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => s.add(p.pillar));
    return ["all", ...Array.from(s).sort()];
  }, [posts]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => (p.tags ?? []).forEach((t) => s.add(t)));
    return ["all", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [posts]);

  const years = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => {
      const y = new Date(p.publishedAt).getFullYear();
      if (!Number.isNaN(y)) s.add(String(y));
    });
    return ["all", ...Array.from(s).sort((a, b) => Number(b) - Number(a))];
  }, [posts]);

  const readTimes = useMemo(
    () => ["all", "quick", "medium", "deep"] as const,
    []
  );

  const anyActive =
    q.trim() ||
    pillar !== "all" ||
    tag !== "all" ||
    year !== "all" ||
    time !== "all" ||
    sort !== "newest";

  const t = {
    filters: lang === "es" ? "Filtros" : "Filters",
    search: lang === "es" ? "Buscar" : "Search",
    ph:
      lang === "es"
        ? "Título, autor, tag, tema…"
        : "Title, author, tag, topic…",
    pillar: lang === "es" ? "Pilar" : "Pillar",
    tag: "Tag",
    year: lang === "es" ? "Año" : "Year",
    time: lang === "es" ? "Lectura" : "Reading",
    sort: lang === "es" ? "Orden" : "Sort",
    newest: lang === "es" ? "Reciente" : "Newest",
    oldest: lang === "es" ? "Antiguo" : "Oldest",
    quick: lang === "es" ? "Rápida" : "Quick",
    medium: lang === "es" ? "Media" : "Medium",
    deep: lang === "es" ? "Profunda" : "Deep",
    clear: lang === "es" ? "Limpiar" : "Clear",
    more: lang === "es" ? "Más" : "More",
    less: lang === "es" ? "Menos" : "Less",
    count: lang === "es" ? "artículos" : "articles",
  };

  const sectionLabel = cn(
    "text-[12px] uppercase tracking-[0.30em]",
    "text-(--olivea-olive) opacity-90"
  );

  const capsule = cn(
    "rounded-full",
    "bg-white/22",
    "ring-1 ring-(--olivea-olive)/16",
    "backdrop-blur-[2px]"
  );

  const subtleLink = cn(
    "text-[12px] text-(--olivea-olive) opacity-85 hover:opacity-100",
    "underline underline-offset-4 decoration-(--olivea-olive)/25 hover:decoration-(--olivea-olive)/45"
  );

  const chipBase = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/16 text-(--olivea-clay) opacity-95",
    "hover:bg-white/26 hover:text-(--olivea-olive) hover:opacity-100"
  );

  const chipActive = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/28",
    "bg-(--olivea-olive)/12 text-(--olivea-olive) opacity-100"
  );

  const topPillarPicks = useMemo(() => pillars.slice(0, 6), [pillars]);
  const restPillars = useMemo(() => pillars.slice(6), [pillars]);

  const topYearPicks = useMemo(() => years.slice(0, 6), [years]);
  const restYears = useMemo(() => years.slice(6), [years]);

  const topTagPicks = useMemo(() => tags.slice(0, 10), [tags]);
  const restTags = useMemo(() => tags.slice(10), [tags]);

  /**
   * ✅ One panel renderer used by BOTH full dock and compact popover.
   * IMPORTANT: This panel DOES NOT render the “pill header”.
   * That prevents the “double header” you’re seeing.
   */
  const FiltersPanel = ({ showCollapsePanel }: { showCollapsePanel: boolean }) => (
    <div className="px-0">
      {/* Search */}
      <div className="mt-3">
        <div className={sectionLabel}>{t.search}</div>
        <div className={cn("mt-2 px-4 py-2.5", capsule)}>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 opacity-70 shrink-0 text-(--olivea-olive)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.ph}
              className={cn(
                "w-full bg-transparent outline-none",
                "text-[13px] text-(--olivea-olive)",
                "placeholder:text-(--olivea-clay)/65"
              )}
            />
            {q.trim() ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className={cn(
                  "h-7 w-7 rounded-full",
                  "inline-flex items-center justify-center",
                  "bg-white/18 ring-1 ring-(--olivea-olive)/14",
                  "text-(--olivea-olive) opacity-80 hover:opacity-100 transition"
                )}
                aria-label={tt(lang, "Borrar", "Clear")}
                title={tt(lang, "Borrar", "Clear")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Collapsible filters section (only collapsible on xl full dock) */}
      <AnimatePresence initial={false}>
        {showCollapsePanel && collapsed ? null : (
          <motion.div
            key="filters"
            variants={panelV}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="mt-6"
          >
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>{t.filters}</div>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={subtleLink}
              >
                {moreOpen ? t.less : t.more}
              </button>
            </div>

            {/* Pillars */}
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.pillar}</div>
                <button type="button" onClick={() => setPillar("all")} className={subtleLink}>
                  {labelAll(lang)}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {topPillarPicks.map((p) => {
                  const active = pillar === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPillar(p)}
                      className={active ? chipActive : chipBase}
                    >
                      {p === "all" ? labelAll(lang) : p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.year}</div>
                <button type="button" onClick={() => setYear("all")} className={subtleLink}>
                  {labelAll(lang)}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {topYearPicks.map((y) => {
                  const active = year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={active ? chipActive : chipBase}
                    >
                      {y === "all" ? labelAll(lang) : y}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reading time */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.time}</div>
                <button type="button" onClick={() => setTime("all")} className={subtleLink}>
                  {labelAll(lang)}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {readTimes.map((k) => {
                  const active = time === k;
                  const label =
                    k === "all"
                      ? labelAll(lang)
                      : k === "quick"
                        ? t.quick
                        : k === "medium"
                          ? t.medium
                          : t.deep;

                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setTime(k)}
                      className={active ? chipActive : chipBase}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.sort}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["newest", "oldest"] as const).map((s) => {
                  const active = sort === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSort(s)}
                      className={active ? chipActive : chipBase}
                    >
                      {s === "newest" ? t.newest : t.oldest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.tag}</div>
                <button type="button" onClick={() => setTag("all")} className={subtleLink}>
                  {labelAll(lang)}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {topTagPicks.map((x) => {
                  const active = tag === x;
                  return (
                    <button
                      key={x}
                      type="button"
                      onClick={() => setTag(x)}
                      className={active ? chipActive : chipBase}
                    >
                      {x === "all" ? labelAll(lang) : x}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {moreOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="mt-4 rounded-2xl bg-white/18 ring-1 ring-(--olivea-olive)/14 backdrop-blur-[2px] p-3"
                >
                  {restPillars.length ? (
                    <>
                      <div className="text-[11px] text-(--olivea-olive) opacity-85">
                        {tt(lang, "Más pilares", "More pillars")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {restPillars.map((p) => {
                          const active = pillar === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPillar(p)}
                              className={active ? chipActive : chipBase}
                            >
                              {p === "all" ? labelAll(lang) : p}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {restYears.length ? (
                    <>
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-85">
                        {tt(lang, "Más años", "More years")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {restYears.map((y) => {
                          const active = year === y;
                          return (
                            <button
                              key={y}
                              type="button"
                              onClick={() => setYear(y)}
                              className={active ? chipActive : chipBase}
                            >
                              {y === "all" ? labelAll(lang) : y}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {restTags.length ? (
                    <>
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-85">
                        {tt(lang, "Más tags", "More tags")}
                      </div>
                      <div className="mt-2 max-h-40 overflow-auto pr-1">
                        <div className="flex flex-wrap gap-2">
                          {restTags.map((x) => {
                            const active = tag === x;
                            return (
                              <button
                                key={x}
                                type="button"
                                onClick={() => setTag(x)}
                                className={active ? chipActive : chipBase}
                              >
                                {x === "all" ? labelAll(lang) : x}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {anyActive ? (
              <button
                type="button"
                onClick={onClear}
                className={cn(
                  "mt-4 w-full px-4 py-2.5 text-[13px] transition",
                  capsule,
                  "text-(--olivea-olive) hover:bg-white/26"
                )}
              >
                {t.clear}
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {showCollapsePanel && collapsed && anyActive ? (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "mt-4 w-full px-4 py-2.5 text-[13px] transition",
            capsule,
            "text-(--olivea-olive) hover:bg-white/26"
          )}
        >
          {t.clear}
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      {/* Compact mini dock (lg only) */}
      <nav
        className={cn("hidden lg:block xl:hidden fixed z-40 pointer-events-auto", "left-3")}
        style={{ top: topOffset }}
        aria-label="Journal filters compact"
      >
        <motion.div
          variants={dockV}
          initial={reduce ? false : "hidden"}
          animate="show"
          className="relative"
        >
          <button
            type="button"
            onClick={() => setCompactOpen((v) => !v)}
            className={cn(
              "inline-flex items-center justify-center",
              "h-11 w-11 rounded-full",
              "bg-white/26 ring-1 ring-(--olivea-olive)/18 backdrop-blur-[2px]",
              "text-(--olivea-olive) hover:bg-white/34 transition"
            )}
            aria-label={t.filters}
            title={t.filters}
          >
            <SlidersHorizontal className="h-5 w-5 opacity-90" />
          </button>

          <AnimatePresence>
            {compactOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: EASE }}
                className={cn(
                  "absolute left-14 top-0",
                  "w-90 max-w-[calc(100vw-120px)]",
                  "rounded-3xl",
                  // ✅ more opaque, less blur = readable over photos
                  "bg-white/72 ring-1 ring-(--olivea-olive)/18 backdrop-blur-[10px]",
                  "shadow-[0_22px_55px_rgba(40,60,35,0.20)]"
                )}
              >
                <div className="flex items-center justify-between px-4 pt-4">
                  <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-90">
                    {t.filters}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompactOpen(false)}
                    className={cn(
                      "h-9 w-9 rounded-full",
                      "inline-flex items-center justify-center",
                      "bg-white/70 ring-1 ring-(--olivea-olive)/16",
                      "text-(--olivea-olive) opacity-90 hover:opacity-100 transition"
                    )}
                    aria-label={tt(lang, "Cerrar", "Close")}
                    title={tt(lang, "Cerrar", "Close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-[calc(100vh-260px)] overflow-auto p-4 pt-2">
                  <FiltersPanel showCollapsePanel={false} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </nav>

      {/* Full dock (xl+) */}
      <nav
        className={cn("hidden xl:block fixed z-40 pointer-events-auto", "left-4 2xl:left-6")}
        style={{ top: topOffset }}
        aria-label="Journal filters"
      >
        <motion.div
          variants={dockV}
          initial={reduce ? false : "hidden"}
          animate="show"
          className={cn("w-64 xl:w-72 2xl:w-80")}
        >
          <div className="relative pl-5">
            <div className="absolute left-2 top-1 bottom-1 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/18 to-transparent" />

            {/* ✅ No scroll container when collapsed to avoid random scrollbar */}
            <div
              className={cn(
                collapsed ? "overflow-visible" : "max-h-[calc(100vh-240px)] overflow-auto",
                "pr-2"
              )}
            >
              {/* Single pill header (ONLY ONCE) */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCollapsed((v) => !v)}
                  className={cn(
                    "w-full inline-flex items-center justify-between gap-3",
                    "px-3 py-2 rounded-full",
                    "bg-white/22 ring-1 ring-(--olivea-olive)/16 backdrop-blur-[2px]",
                    "text-(--olivea-olive) hover:bg-white/30 transition"
                  )}
                  aria-label={collapsed ? (lang === "es" ? "Expandir" : "Expand") : (lang === "es" ? "Colapsar" : "Collapse")}
                  title={collapsed ? (lang === "es" ? "Expandir" : "Expand") : (lang === "es" ? "Colapsar" : "Collapse")}
                >
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 opacity-85" />
                    <span className="text-[12px] uppercase tracking-[0.30em]">
                      {t.filters}
                    </span>
                    <span className="text-[12px] opacity-75">
                      {count} {t.count}
                    </span>
                  </span>

                  {collapsed ? (
                    <ChevronRight className="h-4 w-4 opacity-85" />
                  ) : (
                    <ChevronDown className="h-4 w-4 opacity-85" />
                  )}
                </button>
              </div>

              {/* Panel below */}
              <FiltersPanel showCollapsePanel />
            </div>
          </div>
        </motion.div>
      </nav>
    </>
  );
}