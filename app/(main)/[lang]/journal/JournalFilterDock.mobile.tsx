// app/(main)/[lang]/journal/JournalFilterDock.mobile.tsx
"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { JournalFilterDockProps } from "./JournalFilterDock";
import {
  Search,
  SlidersHorizontal,
  Layers,
  X,
  ArrowUp,
  BookOpen,
  Tag as TagIcon,
} from "lucide-react";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";


const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function labelAll(lang: JournalFilterDockProps["lang"]) {
  return lang === "es" ? "Todos" : "All";
}

function tt(lang: JournalFilterDockProps["lang"], es: string, en: string) {
  return lang === "es" ? es : en;
}

export default function JournalFilterDockMobile({
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
}: JournalFilterDockProps) {
  const reduce = useReducedMotion();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"filters" | "jump">("filters");

  const t = {
    ph: lang === "es" ? "Título, autor, tag…" : "Title, author, tag…",
    clear: lang === "es" ? "Limpiar" : "Clear",
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
  };

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

  const anyActive =
    q.trim() ||
    pillar !== "all" ||
    tag !== "all" ||
    year !== "all" ||
    time !== "all" ||
    sort !== "newest";

  const pillars = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => s.add(p.pillar));
    return ["all", ...Array.from(s).sort()];
  }, [posts]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => (p.tags ?? []).forEach((x) => s.add(x)));
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

  useEffect(() => {
    if (!sheetOpen) return;
  
    setModalOpen(true);
    lockBodyScroll();
  
    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [sheetOpen]);
  
  /* MOBILE BAR hide/show */
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (sheetOpen) return;

    const prev = lastY.current;
    lastY.current = y;

    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;
    if (delta > 14) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < -2) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
    }
  });

  const scrollTo = useCallback(
    (id: string) => {
      const el =
        document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
        document.getElementById(id);
      if (!el) return;

      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }
      setSheetOpen(false);
    },
    [reduce]
  );

  const TOP_OFFSET_CLASS = "top-14";
  const BAR_HEIGHT_SPACER = "h-16";

  return (
    <>
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      <motion.div
        className={cn(
          "md:hidden fixed left-0 right-0 z-210",
          TOP_OFFSET_CLASS,
          "pointer-events-none"
        )}
        animate={barHidden ? "hidden" : "show"}
        variants={{ show: { y: 0, opacity: 1 }, hidden: { y: -48, opacity: 0 } }}
        transition={{ duration: barHidden ? 0.38 : 0.18, ease: EASE }}
      >
        <div className="px-3 pt-2 pointer-events-auto">
          <div
            className={cn(
              "rounded-2xl",
              "bg-(--olivea-cream)/72 backdrop-blur-md",
              "ring-1 ring-(--olivea-olive)/14",
              "shadow-[0_10px_30px_rgba(18,24,16,0.10)]"
            )}
          >
            <div className="px-2.5 py-2 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2",
                    "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md"
                  )}
                >
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
                  {q ? (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className={cn(
                        "inline-flex items-center justify-center",
                        "h-7 w-7 rounded-full",
                        "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/12 backdrop-blur-md",
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

              {anyActive ? (
                <button
                  type="button"
                  onClick={onClear}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "h-10 w-10 rounded-full",
                    "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
                    "text-(--olivea-olive) hover:bg-white/45 transition"
                  )}
                  aria-label={tt(lang, "Limpiar", "Reset")}
                  title={tt(lang, "Limpiar", "Reset")}
                >
                  <X className="h-4 w-4 opacity-80" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setSheetTab("filters");
                  setSheetOpen(true);
                }}
                className={cn(
                  "inline-flex items-center justify-center",
                  "h-10 w-10 rounded-full",
                  "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
                  "text-(--olivea-olive) hover:bg-white/45 transition"
                )}
                aria-label={tt(lang, "Filtros", "Filters")}
                title={tt(lang, "Filtros", "Filters")}
              >
                <SlidersHorizontal className="h-4 w-4 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSheetTab("jump");
                  setSheetOpen(true);
                }}
                className={cn(
                  "inline-flex items-center justify-center",
                  "h-10 w-10 rounded-full",
                  "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
                  "text-(--olivea-olive) hover:bg-white/45 transition"
                )}
                aria-label={tt(lang, "Secciones", "Sections")}
                title={tt(lang, "Secciones", "Sections")}
              >
                <Layers className="h-4 w-4 opacity-80" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {sheetOpen ? (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-220 bg-black/25 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
                aria-label={tt(lang, "Cerrar", "Close")}
              />

              <motion.div
                className={cn(
                  "fixed z-221 left-0 right-0 bottom-0 pointer-events-auto",
                  "rounded-t-3xl",
                  "bg-(--olivea-cream)/72 backdrop-blur-md",
                  "ring-1 ring-(--olivea-olive)/14",
                  "shadow-[0_-16px_40px_rgba(18,24,16,0.18)]"
                )}
                initial={{ y: 420, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 420, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                role="dialog"
                aria-modal="true"
              >
                <div className="px-4 pt-3 pb-4">
                  <div className="mx-auto h-1 w-10 rounded-full bg-(--olivea-olive)/15" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-85">
                      {sheetTab === "filters"
                        ? tt(lang, "Filtros", "Filters")
                        : tt(lang, "Secciones", "Sections")}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "inline-flex items-center justify-center",
                        "h-9 w-9 rounded-full",
                        "bg-white/40 ring-1 ring-(--olivea-olive)/14",
                        "text-(--olivea-olive) hover:bg-white/55 transition"
                      )}
                      aria-label={tt(lang, "Cerrar", "Close")}
                    >
                      <X className="h-4 w-4 opacity-80" />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSheetTab("filters")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-[12px] ring-1 transition",
                        sheetTab === "filters"
                          ? "bg-(--olivea-olive)/12 ring-(--olivea-olive)/26 text-(--olivea-olive)"
                          : "bg-white/35 ring-(--olivea-olive)/14 text-(--olivea-clay) hover:bg-white/45"
                      )}
                    >
                      {tt(lang, "Filtros", "Filters")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSheetTab("jump")}
                      className={cn(
                        "flex-1 rounded-full px-4 py-2 text-[12px] ring-1 transition",
                        sheetTab === "jump"
                          ? "bg-(--olivea-olive)/12 ring-(--olivea-olive)/26 text-(--olivea-olive)"
                          : "bg-white/35 ring-(--olivea-olive)/14 text-(--olivea-clay) hover:bg-white/45"
                      )}
                    >
                      {tt(lang, "Secciones", "Sections")}
                    </button>
                  </div>

                  {sheetTab === "jump" ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                      <button
                        type="button"
                        onClick={() => scrollTo("top")}
                        className={cn(
                          "col-span-2 rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <ArrowUp className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">
                            {tt(lang, "Arriba", "Top")}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollTo("featured")}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <BookOpen className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">
                            {tt(lang, "Destacado", "Featured")}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollTo("posts")}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <TagIcon className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">
                            {tt(lang, "Artículos", "Posts")}
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pb-[max(12px,env(safe-area-inset-bottom))]">
                      {/* Pillar */}
                      <div className="text-[11px] text-(--olivea-olive) opacity-80">
                        {t.pillar}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
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

                      {/* Year */}
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
                        {t.year}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {years.map((y) => {
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

                      {/* Reading time */}
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
                        {t.time}
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

                      {/* Sort */}
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
                        {t.sort}
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

                      {/* Tag */}
                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
                        {t.tag}
                      </div>
                      <div className="mt-2 max-h-40 overflow-auto pr-1">
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

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={onClear}
                          className={cn(
                            "rounded-2xl px-4 py-3 text-[13px]",
                            "bg-white/35 ring-1 ring-(--olivea-olive)/14",
                            "text-(--olivea-olive) hover:bg-white/45 transition"
                          )}
                        >
                          {t.clear}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSheetOpen(false)}
                          className={cn(
                            "rounded-2xl px-4 py-3 text-[13px]",
                            "bg-(--olivea-olive) text-(--olivea-cream)",
                            "ring-1 ring-black/10 hover:brightness-[1.03] transition"
                          )}
                        >
                          {tt(lang, "Listo", "Done")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </>
  );
}