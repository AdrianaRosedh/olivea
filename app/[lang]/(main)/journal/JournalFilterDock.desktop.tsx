"use client";

import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { tt } from "@/lib/i18n";
import { publicDateYear } from "@/lib/date/public-date";
import type { JournalFilterDockProps } from "./JournalFilterDock";
import {
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  DOCK_TOP,
  DockHeader,
  FilterSearch,
  chipClass,
  dockIconButton,
  dockShell,
  filterLabel,
  filterLink,
  sidePanel,
} from "@/components/ui/filters/FilterKit";

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

/** Room left under `top` before the footer and, when it shows, the promo bar. */
function roomBelow(top: number): number {
  const banner =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--olivea-banner-clear")) || 0;
  return window.innerHeight - top - 72 - banner - 12;
}

/**
 * How far to lift a panel that opens beside the dock so it ends above the
 * footer instead of running under it (never above 90px from the top).
 */
function useLiftToFit(ref: React.RefObject<HTMLElement | null>, open: boolean): number {
  const [lift, setLift] = useState(0);
  useLayoutEffect(() => {
    if (!open || !ref.current) return;
    const el = ref.current;
    const anchor = (el.offsetParent as HTMLElement | null)?.getBoundingClientRect().top ?? 0;
    const over = el.offsetHeight - roomBelow(anchor);
    setLift(over > 0 ? -Math.min(over, Math.max(0, anchor - 90)) : 0);
  }, [open, ref]);
  return lift;
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

  const reduce = usePrefersReducedMotion();

  // “More” = extra chips sections
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreShift = useLiftToFit(moreRef, moreOpen);

  // The dock never scrolls. It measures its full height against the room
  // under it; when it does not fit, the filters fold under the pill and open
  // beside it instead.
  const dockRef = useRef<HTMLDivElement>(null);
  const dockHeight = useRef(0);
  const [fits, setFits] = useState(true);
  const [floatOpen, setFloatOpen] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);
  const floatShift = useLiftToFit(floatRef, floatOpen);

  // Full dock collapse (xl+)
  const [collapsed, setCollapsed] = useState(false);

  // Compact popover (lg)
  const [compactOpen, setCompactOpen] = useState(false);
  const compactRef = useRef<HTMLDivElement>(null);
  const compactShift = useLiftToFit(compactRef, compactOpen);

  // Starts where the Press and Team docks do, just under the logo.
  const topOffset = DOCK_TOP;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => setCompactOpen(false);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const folded = collapsed || !fits;

  useEffect(() => {
    const check = () => {
      if (!collapsed && fits && dockRef.current) dockHeight.current = dockRef.current.offsetHeight;
      if (!dockHeight.current) return;
      // The dock's real top: it sits under the logo, which grows with the screen.
      const top = dockRef.current?.getBoundingClientRect().top ?? 0;
      const room = roomBelow(top);
      // A little hysteresis, so it does not flicker at the boundary.
      setFits((was) => (was ? dockHeight.current <= room : dockHeight.current <= room - 16));
    };
    check();
    window.addEventListener("resize", check);
    // The promo bar publishes its height on <html> as it comes and goes.
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
    return () => {
      window.removeEventListener("resize", check);
      mo.disconnect();
    };
  }, [collapsed, fits, posts]);

  // Panels beside the dock close on Escape or a click elsewhere.
  useEffect(() => {
    if (!moreOpen && !floatOpen) return;
    const close = () => {
      setMoreOpen(false);
      setFloatOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest('nav[aria-label="Journal filters"], nav[aria-label="Journal filters compact"]')) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [moreOpen, floatOpen]);

  const pillars = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => s.add(p.pillar));
    return ["all", ...Array.from(s).sort()];
  }, [posts]);

  // Most used first, so the few shown in the dock are the ones that narrow
  // the most; the rest open beside it.
  const tags = useMemo(() => {
    const n = new Map<string, number>();
    posts.forEach((p) => (p.tags ?? []).forEach((t) => n.set(t, (n.get(t) ?? 0) + 1)));
    return ["all", ...Array.from(n.keys()).sort((a, b) => (n.get(b)! - n.get(a)!) || a.localeCompare(b))];
  }, [posts]);

  const years = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => {
      const y = publicDateYear(p.publishedAt);
      if (!Number.isNaN(y)) s.add(String(y));
    });
    return ["all", ...Array.from(s).sort((a, b) => Number(b) - Number(a))];
  }, [posts]);

  // Only the lengths some article actually has: a choice that can only
  // empty the list is not a filter.
  const readTimes = useMemo(() => {
    const bucket = (m: number) => (m <= 3 ? "quick" : m <= 6 ? "medium" : "deep");
    const have = new Set(posts.map((p) => bucket(p.readingMinutes)));
    return (["all", "quick", "medium", "deep"] as const).filter((k) => k === "all" || have.has(k));
  }, [posts]);

  // A group with a single real value ("Todos" + one pillar, one year) can't
  // narrow anything, so it isn't shown until the journal has a second one.
  const showPillar = pillars.length > 2;
  const showYear = years.length > 2;
  const showTime = readTimes.length > 2;

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
    // Accessible name for the search field. The placeholder cannot serve as
    // one: it disappears the moment someone types.
    searchLabel: lang === "es" ? "Buscar artículos" : "Search articles",
    ph:
      lang === "es"
        ? "Buscar: título, autor, tag…"
        : "Search: title, author, tag…",
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

  // The shared filter kit's look (Press and Team use the same).
  const sectionLabel = filterLabel;
  const subtleLink = filterLink;
  const chipBase = chipClass(false, "sm");
  const chipActive = chipClass(true, "sm");
  const capsule = "rounded-full bg-white/22 ring-1 ring-(--olivea-olive)/16 backdrop-blur-[2px]";

  const topPillarPicks = useMemo(() => pillars.slice(0, 6), [pillars]);
  const restPillars = useMemo(() => pillars.slice(6), [pillars]);

  const topYearPicks = useMemo(() => years.slice(0, 6), [years]);
  const restYears = useMemo(() => years.slice(6), [years]);

  const topTagPicks = useMemo(() => tags.slice(0, 7), [tags]);
  const restTags = useMemo(() => tags.slice(7), [tags]);

  /**
   * One panel used by both the full dock and the compact popover. It renders
   * no pill header of its own (that doubled the header once).
   *
   * Called as a function, not mounted as <FiltersPanel />: declared inside
   * this component, it was a new component type on every render, so React
   * remounted it on each keystroke and the search field lost focus after the
   * first letter.
   */
  const renderFilters = ({ showCollapsePanel }: { showCollapsePanel: boolean }) => (
    <div className="px-0">
      {/* Search (its placeholder says what it is; the field has its own label) */}
      <FilterSearch
        className="mt-3"
        value={q}
        onChange={setQ}
        placeholder={t.ph}
        label={t.searchLabel}
        clearLabel={tt(lang, "Borrar", "Clear")}
      />

      {/* Collapsible filters section (only collapsible on xl full dock) */}
      <AnimatePresence initial={false}>
        {showCollapsePanel && folded ? null : (
          <motion.div
            key="filters"
            variants={panelV}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="mt-4"
          >
            {/* Pillars */}
            {showPillar ? (
            <div className="mt-4 first:mt-0">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.pillar}</div>
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

            ) : null}

            {/* Year */}
            {showYear ? (
            <div className="mt-4 first:mt-0">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.year}</div>
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

            ) : null}

            {/* Reading time */}
            {showTime ? (
            <div className="mt-4 first:mt-0">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.time}</div>
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

            ) : null}

            {/* Sort */}
            <div className="mt-4 first:mt-0">
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
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className={sectionLabel}>{t.tag}</div>
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

            {restPillars.length || restYears.length || restTags.length ? (
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                className={cn("mt-3", subtleLink)}
              >
                {t.more}
              </button>
            ) : null}

            <AnimatePresence initial={false}>
              {moreOpen ? (
                <motion.div
                  ref={moreRef}
                  role="group"
                  aria-label={tt(lang, "Más filtros", "More filters")}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  // Beside the dock, over the page, so a near-solid surface.
                  // Wide enough that a long tag list wraps instead of growing.
                  className={cn(sidePanel, "absolute left-full top-0 z-10 ml-3 w-96 max-w-[calc(100vw-24rem)] p-4")}
                  style={{ top: moreShift }}
                >
                  {restPillars.length ? (
                    <>
                      <div className="text-[11px] text-(--olivea-olive)">
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
                      <div className="mt-4 text-[11px] text-(--olivea-olive)">
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
                      <div className="mt-4 text-[11px] text-(--olivea-olive)">
                        {tt(lang, "Más tags", "More tags")}
                      </div>
                      <div className="mt-2">
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

      {showCollapsePanel && folded && anyActive ? (
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
            aria-expanded={compactOpen}
            className={cn(dockShell, "grid h-12 w-12 place-items-center text-(--olivea-olive) transition hover:bg-white/30")}
            aria-label={t.filters}
            title={t.filters}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {compactOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: EASE }}
                ref={compactRef}
                className={cn(sidePanel, "absolute left-15 top-0 w-80 max-w-[calc(100vw-120px)]")}
                style={{ top: compactShift }}
              >
                <div className="px-4 pt-4">
                  <DockHeader label={tt(lang, "Cuaderno", "Journal")} meta={`${count} ${t.count}`}>
                    <button
                      type="button"
                      onClick={() => setCompactOpen(false)}
                      className={dockIconButton}
                      aria-label={tt(lang, "Cerrar", "Close")}
                      title={tt(lang, "Cerrar", "Close")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DockHeader>
                </div>

                <div className="p-4 pt-1">
                  {renderFilters({ showCollapsePanel: false })}
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
          className="w-73"
        >
          <div className="relative">
            <div ref={dockRef} className={cn(dockShell, "px-3.5 pb-3.5 pt-3.5")}>
              <DockHeader label={tt(lang, "Cuaderno", "Journal")} meta={`${count} ${t.count}`}>
                <button
                  type="button"
                  // Short screens: the filters open beside the dock instead.
                  onClick={() => (fits ? setCollapsed((v) => !v) : setFloatOpen((v) => !v))}
                  aria-expanded={fits ? !collapsed : floatOpen}
                  className={dockIconButton}
                  aria-label={folded && !floatOpen ? tt(lang, "Expandir", "Expand") : tt(lang, "Colapsar", "Collapse")}
                  title={folded && !floatOpen ? tt(lang, "Expandir", "Expand") : tt(lang, "Colapsar", "Collapse")}
                >
                  {folded && !floatOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </DockHeader>

              {renderFilters({ showCollapsePanel: true })}
            </div>

            <AnimatePresence>
              {!fits && floatOpen ? (
                <motion.div
                  ref={floatRef}
                  role="group"
                  aria-label={t.filters}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className={cn(sidePanel, "absolute left-full top-0 z-10 ml-3 w-80 px-4 pb-4")}
                  style={{ top: floatShift }}
                >
                  {renderFilters({ showCollapsePanel: false })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </nav>
    </>
  );
}