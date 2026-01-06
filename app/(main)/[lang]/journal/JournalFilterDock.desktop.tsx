// app/(main)/[lang]/journal/JournalFilterDock.desktop.tsx
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { JournalFilterDockProps } from "./JournalFilterDock";
import { Search, X } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.35 },
  },
};

function labelAll(lang: JournalFilterDockProps["lang"]) {
  return lang === "es" ? "Todos" : "All";
}

function tt(lang: JournalFilterDockProps["lang"], es: string, en: string) {
  return lang === "es" ? es : en;
}

export default function JournalFilterDockDesktop({
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
}: JournalFilterDockProps) {
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);

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

  const readTimes = useMemo(() => ["all", "quick", "medium", "deep"] as const, []);

  const anyActive =
    q.trim() ||
    pillar !== "all" ||
    tag !== "all" ||
    year !== "all" ||
    time !== "all" ||
    sort !== "newest";

  const t = {
    filter: lang === "es" ? "Filtrar" : "Filter",
    search: lang === "es" ? "Buscar" : "Search",
    ph: lang === "es" ? "Título, tag, tema…" : "Title, tag, topic…",
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

  const subtleLink = cn(
    "text-[12px] text-(--olivea-olive) opacity-80 hover:opacity-100",
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

  const topPillarPicks = useMemo(() => pillars.slice(0, 6), [pillars]);
  const restPillars = useMemo(() => pillars.slice(6), [pillars]);

  const topYearPicks = useMemo(() => years.slice(0, 6), [years]);
  const restYears = useMemo(() => years.slice(6), [years]);

  const topTagPicks = useMemo(() => tags.slice(0, 10), [tags]);
  const restTags = useMemo(() => tags.slice(10), [tags]);

  return (
    <nav
      className="hidden lg:block fixed left-6 z-40 pointer-events-auto"
      style={{ top: 255 }}
      aria-label="Journal filters"
    >
      <motion.div
        variants={dockV}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="w-72"
      >
        <div className="relative pl-5">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/18 to-transparent" />

          <div className="flex items-baseline justify-between">
            <div className={sectionLabel}>{t.filter}</div>
            <div className="text-[12px] text-(--olivea-olive) opacity-80">
              {count} {t.count}
            </div>
          </div>

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

          {/* Filters header + More */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>{tt(lang, "Filtros", "Filters")}</div>
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

            <AnimatePresence>
              {moreOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="mt-4 rounded-2xl bg-white/14 ring-1 ring-(--olivea-olive)/14 backdrop-blur-[2px] p-3"
                >
                  {restPillars.length ? (
                    <>
                      <div className="text-[11px] text-(--olivea-olive) opacity-80">
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
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
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
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
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

                  {anyActive ? (
                    <button
                      type="button"
                      onClick={onClear}
                      className={cn(
                        "mt-4 w-full px-4 py-2.5 text-[13px] transition",
                        capsule,
                        "text-(--olivea-olive) hover:bg-white/24"
                      )}
                    >
                      {t.clear}
                    </button>
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
                  "text-(--olivea-olive) hover:bg-white/24"
                )}
              >
                {t.clear}
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}