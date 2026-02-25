// app/(main)/[lang]/team/TeamDockLeft.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/scrollLock";
import { setModalOpen } from "@/components/ui/modalFlag";

export type TeamCategory = "all" | "hotel" | "restaurant" | "cafe";
type Lang = "es" | "en";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.25 },
  },
};

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

export default function TeamDockLeft({
  lang,
  category,
  setCategory,
  count,
}: {
  lang: Lang;
  category: TeamCategory;
  setCategory: (v: TeamCategory) => void;
  count: number;
}) {
  const reduce = useReducedMotion();

  const label = useCallback(
    (c: TeamCategory) => {
      if (c === "all") return tt(lang, "Olivea · La Experiencia", "Olivea · The Experience");
      if (c === "hotel") return "Hotel";
      if (c === "restaurant") return tt(lang, "Restaurante", "Restaurant");
      return tt(lang, "Café", "Cafe");
    },
    [lang]
  );

  const chips = useMemo(() => ["all", "hotel", "restaurant", "cafe"] as TeamCategory[], []);

  /* =========================
     MOBILE: bar hide/show + sheet (UNCHANGED)
     ========================= */

  const [sheetOpen, setSheetOpen] = useState(false);

  const { scrollY } = useScroll();
  const lastY = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  const [barHidden, setBarHidden] = useState(false);

  useEffect(() => {
    lastY.current = scrollY.get();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    lastY.current = y;

    if (sheetOpen) return;

    if (y < 80) {
      if (hiddenRef.current) {
        hiddenRef.current = false;
        setBarHidden(false);
      }
      return;
    }

    const delta = y - prev;
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

  useEffect(() => {
    if (!sheetOpen) return;

    setModalOpen(true);
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      setModalOpen(false);
    };
  }, [sheetOpen]);

  const TOP_OFFSET_CLASS = "top-14";
  const BAR_HEIGHT_SPACER = "h-16";

  const chipBaseMobile = cn(
    "px-3 py-2 rounded-full text-[13px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/14 text-(--olivea-clay) opacity-95",
    "hover:bg-white/24 hover:text-(--olivea-olive) hover:opacity-100"
  );

  const chipActiveMobile = cn(
    "px-3 py-2 rounded-full text-[13px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/26",
    "bg-(--olivea-olive)/12 text-(--olivea-olive) opacity-100"
  );

  const mobileBar = (
    <>
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      <motion.div
        className={cn("md:hidden fixed left-0 right-0 z-210", TOP_OFFSET_CLASS, "pointer-events-none")}
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
            <div className="px-3 py-2 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-olive) opacity-80">
                  {tt(lang, "Equipo", "Team")}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[13px] text-(--olivea-olive) font-medium truncate">
                    {label(category)}
                  </span>
                  <span className="text-[12px] text-(--olivea-clay) opacity-70">{count}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(true)}
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
                      {tt(lang, "Filtros", "Filters")}
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

                  <div className="mt-4 flex flex-wrap gap-2 pb-[max(12px,env(safe-area-inset-bottom))]">
                    {chips.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          setSheetOpen(false);
                        }}
                        className={category === c ? chipActiveMobile : chipBaseMobile}
                      >
                        {label(c)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </>
  );

  /* =========================
     DESKTOP: redesigned "Filter Pill Panel"
     ========================= */

  const COLLAPSE_AT = 1180; // px
  const [collapsed, setCollapsed] = useState(false);
  const userOverride = useRef<boolean | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (userOverride.current !== null) return;
      setCollapsed(window.innerWidth <= COLLAPSE_AT);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleCollapsed = () => {
    userOverride.current = !collapsed;
    setCollapsed((v) => !v);
  };

  // Layout offset for TeamClient
  useEffect(() => {
    const root = document.documentElement;

    // tighter than before; matches the new compact panel footprint
    root.style.setProperty("--team-dock-left", collapsed ? "5.0rem" : "12.0rem");

    return () => {
      // returns string but ignored (must return void)
      root.style.removeProperty("--team-dock-left");
    };
  }, [collapsed]);

  const iconSrc = (c: TeamCategory) => {
    // your current mapping
    if (c === "hotel") return "/brand/alebrije-2.svg";
    if (c === "cafe") return "/brand/alebrije-3.svg";
    return "/brand/alebrije-1-Green.svg";
  };

  const shortName = (c: TeamCategory) => {
    if (c === "all") return "OLIVEA";
    if (c === "hotel") return "HOTEL";
    if (c === "restaurant") return tt(lang, "REST.", "REST.");
    return tt(lang, "CAFÉ", "CAFE");
  };

  const PillButton = ({ c }: { c: TeamCategory }) => {
    const active = category === c;

    return (
      <button
        type="button"
        onClick={() => setCategory(c)}
        aria-label={label(c)}
        aria-current={active ? "true" : undefined}
        title={label(c)}
        className={cn(
          "group relative w-full",
          "rounded-full",
          "ring-1 transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--olivea-olive)/35",
          active
            ? "bg-(--olivea-cream)/80 ring-(--olivea-olive)/26"
            : "bg-white/18 ring-(--olivea-olive)/14 hover:bg-white/26 hover:ring-(--olivea-olive)/22"
        )}
      >
        {/* soft glow on active */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full opacity-0 transition",
            active ? "opacity-100" : "group-hover:opacity-40"
          )}
          style={{
            boxShadow: "0 18px 50px rgba(18,24,16,0.10)",
          }}
        />

        <div className={cn("relative flex items-center", collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5")}>
          {/* icon capsule */}
          <div className={cn("relative grid place-items-center", collapsed ? "h-12 w-12" : "h-11 w-11")}>
            <Image
              src={iconSrc(c)}
              alt=""
              fill
              sizes={collapsed ? "48px" : "44px"}
              className={cn(
                "object-contain transition",
                !collapsed && (c === "hotel" || c === "cafe") ? "scale-[1.12]" : "scale-100",
                active ? "opacity-100" : "opacity-80 group-hover:opacity-95"
              )}
            />
          </div>
          {/* label */}
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-[11px] uppercase tracking-[0.24em] leading-none",
                  active ? "text-(--olivea-olive) opacity-90" : "text-(--olivea-clay) opacity-80"
                )}
              >
                {shortName(c)}
              </div>
            </div>
          ) : null}

          {/* active micro-indicator */}
          {!collapsed ? (
            <motion.div
              layout
              className={cn(
                "h-2 w-2 rounded-full",
                active ? "bg-(--olivea-olive)/55" : "bg-(--olivea-olive)/14 group-hover:bg-(--olivea-olive)/22"
              )}
              transition={{ duration: 0.22, ease: EASE }}
              aria-hidden="true"
            />
          ) : null}
        </div>
      </button>
    );
  };

  const desktopDock = (
    <nav
      className="hidden md:block fixed left-4 lg:left-6 z-40 pointer-events-auto"
      style={{ top: 250 }}
      aria-label="Team filter"
    >
      <motion.div variants={dockV} initial={reduce ? false : "hidden"} animate="show">
        <motion.div
          animate={{ width: collapsed ? 56 : 188 }}
          transition={{ duration: 0.26, ease: EASE }}
          className={cn(
            "rounded-3xl",
            "bg-(--olivea-cream)/55 backdrop-blur-md",
            "ring-1 ring-(--olivea-olive)/14",
            "shadow-[0_10px_28px_rgba(18,24,16,0.10)]"
          )}
          style={{ overflow: "hidden" }}
        >
          {/* header */}
          <div className={cn("flex items-center", collapsed ? "justify-center p-2.5" : "justify-between px-3 py-3")}>
            {!collapsed ? (
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-70">
                  {tt(lang, "Filtro", "Filter")}
                </div>
                <div className="mt-1 text-[10px] text-(--olivea-clay) opacity-70">
                  {count} {tt(lang, "personas", "people")}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={toggleCollapsed}
              className={cn(
                "inline-flex items-center justify-center",
                "h-10 w-10 rounded-2xl",
                "bg-white/22 ring-1 ring-(--olivea-olive)/14",
                "text-(--olivea-olive) hover:bg-white/35 transition"
              )}
              aria-label={collapsed ? tt(lang, "Expandir", "Expand") : tt(lang, "Colapsar", "Collapse")}
              title={collapsed ? tt(lang, "Expandir", "Expand") : tt(lang, "Colapsar", "Collapse")}
            >
              <SlidersHorizontal className="h-4 w-4 opacity-85" />
            </button>
          </div>

          {/* pills */}
          <div className={cn(collapsed ? "px-2 pb-3" : "px-3 pb-3")}>
            <div className="flex flex-col gap-2">
              {chips.map((c) => (
                <PillButton key={c} c={c} />
              ))}
            </div>

            {!collapsed ? (
              <div className="mt-3 text-[10.5px] text-(--olivea-clay) opacity-60 leading-snug">
                {tt(lang, "Incluye a los líderes en cada filtro.", "Includes the leaders in every filter.")}
              </div>
            ) : null}
          </div>
        </motion.div>
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