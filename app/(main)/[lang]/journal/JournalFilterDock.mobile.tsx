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

/**
 * AdaptiveNavbar render gate:
 * - AdaptiveNavbar returns null unless "isMobileLike" is true :contentReference[oaicite:1]{index=1}
 * - It renders a fixed top bar with class "fixed top-0 ... z-1000" :contentReference[oaicite:2]{index=2}
 */
function findAdaptiveNavbarEl(): HTMLElement | null {
  if (typeof document === "undefined") return null;

  // Most stable: the root fixed bar
  const el = document.querySelector<HTMLElement>(
    'div.fixed.top-0.left-0.right-0.z-1000'
  );
  if (el) return el;

  // Fallback: any element with z-1000 and fixed near top
  const all = Array.from(document.querySelectorAll<HTMLElement>("div.z-1000"));
  const candidate = all.find((n) => {
    const cs = window.getComputedStyle(n);
    return cs.position === "fixed" && (n.style.top === "0px" || cs.top === "0px");
  });
  return candidate ?? null;
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

  // ✅ show when AdaptiveNavbar is active (mobile-like), even if viewport >= 768
  const [adaptiveActive, setAdaptiveActive] = useState(false);

  // ✅ measure AdaptiveNavbar height so our bar sits below it
  const [navH, setNavH] = useState<number>(64);

  // Accordion open section (cuts scrolling)
  const [openSection, setOpenSection] = useState<
    "pillar" | "year" | "time" | "sort" | "tag" | null
  >("pillar");

  const [showAllTags, setShowAllTags] = useState(false);

  const t = {
    ph: lang === "es" ? "Título, autor, tag…" : "Title, author, tag…",
    clear: lang === "es" ? "Limpiar" : "Clear",
    done: lang === "es" ? "Listo" : "Done",
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
    filters: lang === "es" ? "Filtros" : "Filters",
    sections: lang === "es" ? "Secciones" : "Sections",
    top: lang === "es" ? "Arriba" : "Top",
    featured: lang === "es" ? "Destacado" : "Featured",
    posts: lang === "es" ? "Artículos" : "Posts",
    showMore: lang === "es" ? "Mostrar más" : "Show more",
    showLess: lang === "es" ? "Mostrar menos" : "Show less",
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

  const activeCount =
    (q.trim() ? 1 : 0) +
    (pillar !== "all" ? 1 : 0) +
    (tag !== "all" ? 1 : 0) +
    (year !== "all" ? 1 : 0) +
    (time !== "all" ? 1 : 0) +
    (sort !== "newest" ? 1 : 0);

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

  const topTags = useMemo(() => tags.slice(0, 12), [tags]);
  const extraTags = useMemo(() => tags.slice(12), [tags]);

  // ✅ Detect AdaptiveNavbar presence + measure height (so bar appears exactly when nav is adaptive)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;

    const measure = () => {
      const el = findAdaptiveNavbarEl();
      const isActive = !!el;
      setAdaptiveActive(isActive);

      if (el) {
        const r = el.getBoundingClientRect();
        // include its safe-area padding + a small gap
        const h = Math.max(56, Math.round(r.height));
        setNavH(h);
      }
    };

    const tick = () => {
      raf = 0;
      measure();
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };

    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });

    // Observe DOM changes (AdaptiveNavbar can mount/unmount on breakpoint/container)
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      mo.disconnect();
    };
  }, []);

  // Modal scroll lock
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

  // Avoid hiding while typing
  const inputFocusedRef = useRef(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!adaptiveActive) return;
    if (sheetOpen) return;
    if (inputFocusedRef.current) return;

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

  const Accordion = ({
    id,
    title,
    children,
  }: {
    id: "pillar" | "year" | "time" | "sort" | "tag";
    title: string;
    children: React.ReactNode;
  }) => {
    const open = openSection === id;
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpenSection(open ? null : id)}
          className={cn(
            "w-full flex items-center justify-between",
            "px-4 py-3 rounded-2xl",
            "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
          )}
        >
          <span className="text-[12px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-85">
            {title}
          </span>
          <span
            className={cn(
              "text-(--olivea-olive)/70 transition",
              open ? "rotate-180" : ""
            )}
            aria-hidden
          >
            ▾
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-3 px-1">{children}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  };

  // Bar sits under AdaptiveNavbar:
  // - AdaptiveNavbar root has safe-area padding + h-16 content :contentReference[oaicite:3]{index=3}
  const BAR_TOP = navH + 8; // px

  // spacer prevents content jump when bar is fixed
  const BAR_SPACER_PX = 72;

  if (!adaptiveActive) return null;

  return (
    <>
      <div className={cn("lg:hidden")} style={{ height: BAR_SPACER_PX }} />

      <motion.div
        className={cn("lg:hidden fixed left-0 right-0 z-1100 pointer-events-none")}
        style={{ top: BAR_TOP }}
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
              {/* Search */}
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
                    onFocus={() => (inputFocusedRef.current = true)}
                    onBlur={() => (inputFocusedRef.current = false)}
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

              {/* Active filters pill (quick affordance) */}
              <button
                type="button"
                onClick={() => {
                  setSheetTab("filters");
                  setSheetOpen(true);
                }}
                className={cn(
                  "hidden xs:inline-flex items-center gap-2",
                  "h-10 px-3 rounded-full",
                  "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
                  "text-(--olivea-olive) hover:bg-white/45 transition"
                )}
                aria-label={tt(lang, "Abrir filtros", "Open filters")}
                title={tt(lang, "Abrir filtros", "Open filters")}
              >
                <SlidersHorizontal className="h-4 w-4 opacity-80" />
                <span className="text-[12px] uppercase tracking-[0.22em] opacity-85">
                  {t.filters}
                </span>
                {activeCount > 0 ? (
                  <span className="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-(--olivea-olive)/12 ring-1 ring-(--olivea-olive)/20 text-[12px]">
                    {activeCount}
                  </span>
                ) : null}
              </button>

              {/* Clear */}
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

              {/* Filters */}
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
                aria-label={t.filters}
                title={t.filters}
              >
                <SlidersHorizontal className="h-4 w-4 opacity-80" />
              </button>

              {/* Jump */}
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
                aria-label={t.sections}
                title={t.sections}
              >
                <Layers className="h-4 w-4 opacity-80" />
              </button>
            </div>
          </div>
        </div>

        {/* Sheet */}
        <AnimatePresence>
          {sheetOpen ? (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-1200 bg-black/25 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
                aria-label={tt(lang, "Cerrar", "Close")}
              />

              <motion.div
                className={cn(
                  "fixed z-1201 left-0 right-0 bottom-0 pointer-events-auto",
                  "rounded-t-3xl",
                  "bg-(--olivea-cream)/78 backdrop-blur-md",
                  "ring-1 ring-(--olivea-olive)/14",
                  "shadow-[0_-16px_40px_rgba(18,24,16,0.18)]"
                )}
                initial={{ y: 420, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 420, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                role="dialog"
                aria-modal="true"
                drag="y"
                dragConstraints={{ top: 0, bottom: 520 }}
                dragElastic={0.08}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 140 || info.velocity.y > 900) setSheetOpen(false);
                }}
              >
                <div className="px-4 pt-3 pb-3">
                  <div className="mx-auto h-1 w-12 rounded-full bg-(--olivea-olive)/18" />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-85">
                      {sheetTab === "filters" ? t.filters : t.sections}
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
                      {t.filters}
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
                      {t.sections}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-[max(12px,env(safe-area-inset-bottom))]">
                  {sheetTab === "jump" ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
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
                          <span className="text-[13px] font-medium">{t.top}</span>
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
                          <span className="text-[13px] font-medium">{t.featured}</span>
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
                          <span className="text-[13px] font-medium">{t.posts}</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-3">
                        <Accordion id="pillar" title={t.pillar}>
                          <div className="flex flex-wrap gap-2">
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
                        </Accordion>

                        <Accordion id="year" title={t.year}>
                          <div className="flex flex-wrap gap-2">
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
                        </Accordion>

                        <Accordion id="time" title={t.time}>
                          <div className="flex flex-wrap gap-2">
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
                        </Accordion>

                        <Accordion id="sort" title={t.sort}>
                          <div className="flex flex-wrap gap-2">
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
                        </Accordion>

                        <Accordion id="tag" title={t.tag}>
                          <div className="flex flex-wrap gap-2">
                            {(showAllTags ? tags : topTags).map((x) => {
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

                          {extraTags.length ? (
                            <button
                              type="button"
                              onClick={() => setShowAllTags((v) => !v)}
                              className="mt-3 text-[12px] text-(--olivea-olive) opacity-80 underline underline-offset-4"
                            >
                              {showAllTags ? t.showLess : t.showMore}
                            </button>
                          ) : null}
                        </Accordion>
                      </div>

                      {/* Sticky footer */}
                      <div className="sticky bottom-0 left-0 right-0 mt-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-(--olivea-cream)/55 backdrop-blur-md">
                        <div className="grid grid-cols-2 gap-3">
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
                            {t.done}
                          </button>
                        </div>
                      </div>
                    </>
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