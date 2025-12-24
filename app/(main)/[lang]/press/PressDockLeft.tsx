// app/(main)/[lang]/press/PressDockLeft.tsx
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
import type { Identity, ItemKind, Lang, PressItem } from "./pressTypes";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);

import {
  Search,
  SlidersHorizontal,
  Layers,
  X,
  ArrowUp,
  Newspaper,
  Award,
  FolderArchive,
  Mail,
} from "lucide-react";

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

  // ✅ mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<"filters" | "jump">("filters");

  // ✅ Desktop gate (prevents desktop behaviors from running on mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  const isDesktopRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)"); // Tailwind md
    const sync = () => {
      setIsDesktop(mq.matches);
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

  // ✅ mobile bar hide/show (Safari-like)
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

    // don't hide/show while sheet is open
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

    // Hide requires stronger scroll-down; show triggers quickly on scroll-up.
    const HIDE_DELTA = 14;
    const SHOW_DELTA = -2;

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
  // ✅ DESKTOP ONLY (prevents bleed + keeps mobile interaction simple)
  const scrollToSection = useCallback(
    (id: string) => {
      if (!isDesktopRef.current) return;

      const el =
        document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
        document.getElementById(id);

      if (!el) return;

      clearTimers();
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

      // ✅ mobile: native smooth scroll (no GSAP)
      if (!isDesktopRef.current) {
        const el =
          document.querySelector<HTMLElement>(`#${CSS.escape(id)}`) ||
          document.getElementById(id);
        if (el) {
          el.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        }
        setSheetOpen(false);
        return;
      }

      // ✅ desktop: GSAP
      scrollToSection(id);
      setSheetOpen(false);
    },
    [reduce, scrollToSection]
  );

  // deep link on mount — ✅ DESKTOP ONLY
  useEffect(() => {
    if (!isDesktop) return;

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
  }, [isDesktop]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // ✅ lock body scroll when mobile sheet open
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  /* =========================
     MOBILE UI (md:hidden) — MATCH TeamDockLeft colors EXACTLY
     ========================= */

  const TOP_OFFSET_CLASS = "top-14"; // adjust if your main navbar height differs
  const BAR_HEIGHT_SPACER = "h-16"; // reserves space so content doesn't sit under bar

  const mobileBar = (
    <>
      {/* spacer */}
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
          duration: barHidden ? 0.38 : 0.18, // slower hide, faster show
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

              {/* Reset (only when active) */}
              {(q || identity !== "all" || kind !== "all" || year !== "all") ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setIdentity("all");
                    setKind("all");
                    setYear("all");
                  }}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "h-10 w-10 rounded-full",
                    "bg-(--olivea-cream)/60 ring-1 ring-(--olivea-olive)/14 backdrop-blur-md",
                    "text-(--olivea-olive) hover:bg-white/45 transition"
                  )}
                  aria-label={tt(lang, "Limpiar filtros", "Reset filters")}
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
                aria-label={tt(lang, "Filtros", "Filters")}
                title={tt(lang, "Filtros", "Filters")}
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
                aria-label={tt(lang, "Secciones", "Sections")}
                title={tt(lang, "Secciones", "Sections")}
              >
                <Layers className="h-4 w-4 opacity-80" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile bottom sheet */}
        <AnimatePresence>
          {sheetOpen ? (
            <>
              {/* overlay */}
              <motion.button
                type="button"
                className="fixed inset-0 z-220 bg-black/25 pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
                aria-label={tt(lang, "Cerrar", "Close")}
              />

              {/* sheet */}
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
                        onClick={(e) => onNav(e as unknown as React.MouseEvent, "awards")}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <Award className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">
                            {tt(lang, "Reconocimientos", "Awards")}
                          </span>
                        </div>
                        <div className="mt-1 text-[12px] text-(--olivea-clay) opacity-75">
                          {tt(lang, "Ver premios", "View awards")}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onNav(e as unknown as React.MouseEvent, "mentions")}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <Newspaper className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">
                            {tt(lang, "Prensa", "Press")}
                          </span>
                        </div>
                        <div className="mt-1 text-[12px] text-(--olivea-clay) opacity-75">
                          {tt(lang, "Menciones", "Mentions")}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onNav(e as unknown as React.MouseEvent, "presskit")}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <FolderArchive className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">Press Kit</span>
                        </div>
                        <div className="mt-1 text-[12px] text-(--olivea-clay) opacity-75">
                          {tt(lang, "Recursos", "Assets")}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onNav(e as unknown as React.MouseEvent, "contact")}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-left",
                          "bg-white/35 ring-1 ring-(--olivea-olive)/14 hover:bg-white/45 transition"
                        )}
                      >
                        <div className="flex items-center gap-2 text-(--olivea-olive)">
                          <Mail className="h-4 w-4 opacity-80" />
                          <span className="text-[13px] font-medium">
                            {tt(lang, "Contacto", "Contact")}
                          </span>
                        </div>
                        <div className="mt-1 text-[12px] text-(--olivea-clay) opacity-75">
                          {tt(lang, "Medios & PR", "Media & PR")}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onNav(e as unknown as React.MouseEvent, "top")}
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
                    </div>
                  ) : (
                    <div className="mt-4 pb-[max(12px,env(safe-area-inset-bottom))]">
                      <div className="text-[11px] text-(--olivea-olive) opacity-80">
                        {tt(lang, "Identidad", "Identity")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(["all", "olivea", "hotel", "restaurant", "cafe"] as Identity[]).map(
                          (x) => (
                            <button
                              key={x}
                              type="button"
                              onClick={() => setIdentity(x)}
                              className={identity === x ? chipActive : chipBase}
                            >
                              {identLabel(x)}
                            </button>
                          )
                        )}
                      </div>

                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
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

                      <div className="mt-4 text-[11px] text-(--olivea-olive) opacity-80">
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
                        {years.slice(0, 8).map((y) => (
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

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setQ("");
                            setIdentity("all");
                            setKind("all");
                            setYear("all");
                          }}
                          className={cn(
                            "rounded-2xl px-4 py-3 text-[13px]",
                            "bg-white/35 ring-1 ring-(--olivea-olive)/14",
                            "text-(--olivea-olive) hover:bg-white/45 transition"
                          )}
                        >
                          {tt(lang, "Limpiar", "Reset")}
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
     DESKTOP UI (unchanged)
     ========================= */
  const desktopDock = (
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
          <div className="absolute left-2 top-1 bottom-1 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/18 to-transparent" />

          <div className="flex items-baseline justify-between">
            <div className={sectionLabel}>{tt(lang, "Prensa", "Press")}</div>
            <div className="text-[12px] text-(--olivea-olive) opacity-80">
              {count} {tt(lang, "items", "items")}
            </div>
          </div>

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

          <div className="mt-6">
            <div className={sectionLabel}>{tt(lang, "Secciones", "Sections")}</div>
            <div className="mt-2 flex flex-col gap-2">
              <a href="#awards" className={subtleLink} onClick={(e) => onNav(e, "awards")}>
                {tt(lang, "Reconocimientos", "Awards")}
              </a>
              <a href="#mentions" className={subtleLink} onClick={(e) => onNav(e, "mentions")}>
                {tt(lang, "Menciones en prensa", "Press mentions")}
              </a>
              <a href="#presskit" className={subtleLink} onClick={(e) => onNav(e, "presskit")}>
                Press Kit
              </a>
              <a href="#contact" className={subtleLink} onClick={(e) => onNav(e, "contact")}>
                {tt(lang, "Contacto", "Contact")}
              </a>
              <a href="#top" className={subtleLink} onClick={(e) => onNav(e, "top")}>
                {tt(lang, "Arriba", "Top")}
              </a>
            </div>
          </div>

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

  return (
    <>
      {mobileBar}
      {desktopDock}
    </>
  );
}
