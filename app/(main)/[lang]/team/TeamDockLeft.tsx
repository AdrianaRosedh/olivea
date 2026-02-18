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
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { lockBodyScroll } from "@/components/ui/scrollLock";

export type TeamCategory = "all" | "hotel" | "restaurant" | "cafe";
type Lang = "es" | "en";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    // ✅ match PressDockLeft delay
    transition: { duration: 0.7, ease: EASE, delay: 0.35 },
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
      if (c === "all")
        return tt(lang, "Olivea La Experiencia", "Olivea The Experience");
      if (c === "hotel") return "Hotel";
      if (c === "restaurant") return tt(lang, "Restaurante", "Restaurant");
      return tt(lang, "Café", "Cafe");
    },
    [lang]
  );

  const chips = useMemo(
    () => ["all", "hotel", "restaurant", "cafe"] as TeamCategory[],
    []
  );

  // Desktop vertical buttons (larger)
  const vItemBase = cn(
    "w-full text-left",
    "rounded-2xl px-4 py-3",
    "text-[13px] font-medium",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/14 text-(--olivea-clay) opacity-95",
    "hover:bg-white/22 hover:text-(--olivea-olive) hover:opacity-100",
    "transition"
  );

  const vItemActive = cn(
    "w-full text-left",
    "rounded-2xl px-4 py-3",
    "text-[13px] font-medium",
    "ring-1 ring-(--olivea-olive)/26",
    "bg-(--olivea-olive)/12 text-(--olivea-olive) opacity-100",
    "transition"
  );

  /* =========================
     MOBILE: bar hide/show + sheet
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

  // ✅ FIX: lock body scroll while sheet open
  // (was incorrectly checking `open` instead of `sheetOpen`)
  useEffect(() => {
    if (!sheetOpen) return;
    const unlock = lockBodyScroll();
    return unlock;
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
            <div className="px-3 py-2 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-olive) opacity-80">
                  {tt(lang, "Equipo", "Team")}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[13px] text-(--olivea-olive) font-medium truncate">
                    {label(category)}
                  </span>
                  <span className="text-[12px] text-(--olivea-clay) opacity-70">
                    {count}
                  </span>
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
     DESKTOP dock
     ========================= */

  const desktopDock = (
    <nav
      className="hidden md:block fixed left-6 z-40 pointer-events-auto"
      style={{ top: 255 }}
      aria-label="Team dock"
    >
      <motion.div
        variants={dockV}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="w-72 xl:w-80"
      >
        <div className="relative pl-5">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-linear-to-b from-transparent via-(--olivea-olive)/18 to-transparent" />

          <div className="flex items-baseline justify-between">
            <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-90">
              {tt(lang, "Filtro", "Filter")}
            </div>
            <div className="text-[12px] text-(--olivea-olive) opacity-80">
              {count} {tt(lang, "personas", "people")}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={category === c ? vItemActive : vItemBase}
              >
                {label(c)}
              </button>
            ))}
          </div>

          <div className="mt-4 text-[12px] text-(--olivea-clay) opacity-70">
            {tt(
              lang,
              "Incluye los lideres en cada filtro.",
              "Includes the leaders in every filter."
            )}
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
