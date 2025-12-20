"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lang } from "../dictionaries";

type Post = {
  pillar: string;
  tags?: string[];
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE, delay: 0.5 },
  },
};

function labelAll(lang: Lang) {
  return lang === "es" ? "Todos" : "All";
}

export default function JournalFilterDock({
  lang,
  posts,
  q,
  setQ,
  pillar,
  setPillar,
  tag,
  setTag,
  onClear,
  count,
}: {
  lang: Lang;
  posts: Post[];
  q: string;
  setQ: (v: string) => void;
  pillar: string;
  setPillar: (v: string) => void;
  tag: string;
  setTag: (v: string) => void;
  onClear: () => void;
  count: number;
}) {
  const reduce = useReducedMotion();

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

  const t = {
    filter: lang === "es" ? "Filtrar" : "Filter",
    search: lang === "es" ? "Buscar" : "Search",
    ph: lang === "es" ? "Título, tag, tema…" : "Title, tag, topic…",
    pillar: lang === "es" ? "Pilar" : "Pillar",
    tag: "Tag",
    clear: lang === "es" ? "Limpiar" : "Clear",
    count: lang === "es" ? "artículos" : "articles",
  };

  const capsule = cn(
    "rounded-full",
    "bg-white/34",
    "ring-1 ring-(--olivea-olive)/20",
    "backdrop-blur-[2px]"
  );

  const chipBase = cn(
    "px-3.5 py-2 rounded-full text-[14px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/16",
    "bg-white/26 text-(--olivea-clay) opacity-95",
    "hover:bg-white/34 hover:text-(--olivea-olive) hover:opacity-100"
  );

  const chipActive = cn(
    "px-3.5 py-2 rounded-full text-[14px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/28",
    "bg-(--olivea-olive)/16 text-(--olivea-olive) opacity-100"
  );

  const sectionLabel = cn(
    "text-[13px] uppercase tracking-[0.30em]",
    "text-(--olivea-olive) opacity-90"
  );

  return (
    <nav
      className="hidden md:block fixed left-6 z-40 pointer-events-auto"
      style={{ top: 255 }}
      aria-label="Journal filters"
    >
      <motion.div
        variants={dockV}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="w-[320px]"
      >
        <div className="relative pl-5">
          {/* slightly stronger rail to “dock” it in place */}
          <div className="absolute left-2 top-1 bottom-1 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/18 to-transparent" />

          {/* Header row */}
          <div className="flex items-baseline justify-between">
            <div className={sectionLabel}>{t.filter}</div>
            <div className="text-[13px] text-(--olivea-olive) opacity-80">
              {count} {t.count}
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>{t.search}</div>
              {q.trim().length > 0 ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-[12px] text-(--olivea-olive) opacity-80 hover:opacity-100 underline underline-offset-4"
                >
                  {lang === "es" ? "Borrar" : "Clear"}
                </button>
              ) : null}
            </div>

            <div className={cn("mt-3 px-5 py-3", capsule)}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.ph}
                className={cn(
                  "w-full bg-transparent outline-none",
                  "text-[16px] text-(--olivea-olive)",
                  "placeholder:text-(--olivea-clay)/65"
                )}
              />
            </div>
          </div>

          {/* Pillar */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>{t.pillar}</div>
              <button
                type="button"
                onClick={() => setPillar("all")}
                className="text-[12px] text-(--olivea-olive) opacity-80 hover:opacity-100 underline underline-offset-4"
              >
                {labelAll(lang)}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {pillars.map((p) => {
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

          {/* Tags */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>{t.tag}</div>
              <button
                type="button"
                onClick={() => setTag("all")}
                className="text-[12px] text-(--olivea-olive) opacity-80 hover:opacity-100 underline underline-offset-4"
              >
                {labelAll(lang)}
              </button>
            </div>

            <div className="mt-3 max-h-42.5 overflow-auto pr-1">
              <div className="flex flex-wrap gap-2">
                {tags.map((x) => {
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
          </div>

          {/* Clear action */}
          <button
            onClick={onClear}
            className={cn(
              "mt-6 w-full px-5 py-3 text-[15px] tracking-[0.02em] transition",
              capsule,
              "text-(--olivea-olive) hover:bg-white/40"
            )}
          >
            {t.clear}
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
