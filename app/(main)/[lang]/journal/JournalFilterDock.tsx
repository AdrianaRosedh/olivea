// app/(main)/[lang]/journal/JournalFilterDock.tsx
"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lang } from "../dictionaries";
import {
  Search,
  SlidersHorizontal,
  Layers,
  X,
  ArrowUp,
  BookOpen,
  Tag as TagIcon,
} from "lucide-react";

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
    transition: { duration: 0.7, ease: EASE, delay: 0.35 },
  },
};

function labelAll(lang: Lang) {
  return lang === "es" ? "Todos" : "All";
}

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
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

  // Mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"filters" | "jump">("filters");

  // Desktop: compact "More" (like press)
  const [moreOpen, setMoreOpen] = useState(false);

  // ✅ Desktop gate (prevents mobile scroll logic from running on desktop)
    const isDesktopRef = useRef(false);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const mq = window.matchMedia("(min-width: 768px)"); // Tailwind md
      const sync = () => {
        isDesktopRef.current = mq.matches;
      };
      sync();
    
      if (mq.addEventListener) mq.addEventListener("change", sync);
      else mq.addListener(sync);
    
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", sync);
        else mq.removeListener(sync);
      };
    }, []);
  

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
    more: lang === "es" ? "Más" : "More",
    less: lang === "es" ? "Menos" : "Less",
  };

  const sectionLabel = cn(
    "text-[12px] uppercase tracking-[0.30em]",
    "text-(--olivea-olive) opacity-90"
  );

  const subtleLink = cn(
    "text-[12px] text-(--olivea-olive) opacity-80 hover:opacity-100",
    "underline underline-offset-4 decoration-(--olivea-olive)/25 hover:decoration-(--olivea-olive)/45"
  );

  // Match PressDockLeft’s compact capsule/chips
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

  const anyActive = q.trim() || pillar !== "all" || tag !== "all";

  // lock body scroll when sheet open
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  /* =========================
     MOBILE: fixed bar hide/show (Safari-like)
     ========================= */
  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    // ✅ MOBILE ONLY
    if (isDesktopRef.current) return;

    const prev = lastY.current;
    lastY.current = y;

    if (sheetOpen) return;

    // near top: always show
    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;

    const HIDE_DELTA = 14; // down
    const SHOW_DELTA = -2; // up

    if (delta > HIDE_DELTA) {
      if (!hiddenRef.current) {
        hiddenRef.current = true;
        setBarHidden(true);
      }
      return;
    }

    if (delta < SHOW_DELTA) {
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

      el.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });

      if (window.location.hash.slice(1) !== id) {
        window.history.replaceState(null, "", `#${id}`);
      }
      setSheetOpen(false);
    },
    [reduce]
  );

  /* =========================
     MOBILE BAR (fixed overlay + spacer)
     ✅ MATCH TeamDockLeft colors exactly
     ========================= */

  const TOP_OFFSET_CLASS = "top-14"; // ~56px
  const BAR_HEIGHT_SPACER = "h-16";

  const mobileBar = (
    <>
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      <motion.div
        className={cn(
          "md:hidden fixed left-0 right-0 z-210",
          TOP_OFFSET_CLASS,
          "pointer-events-none"
        )}
        animate={barHidden ? "hidden" : "show"}
        variants={{
          show: { y: 0, opacity: 1 },
          hidden: { y: -48, opacity: 0 },
        }}
        transition={{
          duration: barHidden ? 0.38 : 0.18,
          ease: EASE,
        }}
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
                    placeholder={tt(lang, "Buscar…", "Search…")}
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

  /* =========================
     DESKTOP DOCK (compact like PressDockLeft)
     ========================= */
  const topPillarPicks = useMemo(() => pillars.slice(0, 6), [pillars]);
  const restPillars = useMemo(() => pillars.slice(6), [pillars]);

  const topTagPicks = useMemo(() => tags.slice(0, 10), [tags]);
  const restTags = useMemo(() => tags.slice(10), [tags]);

  const desktopDock = (
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

          {/* Search (compact) */}
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

          {/* Filter header + More toggle */}
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

            {/* Pillars (top picks always) */}
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

            {/* Tags (top picks always) */}
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

            {/* More section: remaining pillars + remaining tags */}
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

            {/* Clear (compact) */}
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

  return (
    <>
      {mobileBar}
      {desktopDock}
    </>
  );
}
