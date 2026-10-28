// app/(main)/[lang]/team/TeamDockLeft.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt, type Lang } from "@/lib/i18n";
import Reveal from "@/components/scroll/Reveal";
import {
  DOCK_TOP,
  DockHeader,
  dockIconButton,
  dockShell,
  FilterBar,
  FilterButton,
  FilterChip,
  FilterGroup,
  FilterSheet,
  filterLabel,
} from "@/components/ui/filters/FilterKit";

export type TeamCategory = "all" | "hotel" | "restaurant" | "cafe";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
  const closeSheet = useCallback(() => setSheetOpen(false), []);

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

  const mobileBar = (
    <>
      <div className="md:hidden h-16" />

      <FilterBar hidden={barHidden} className="md:hidden z-210 top-14">
        <div className="min-w-0 flex-1 px-1">
          <div className={filterLabel}>{tt(lang, "Equipo", "Team")}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-(--olivea-olive)">{label(category)}</span>
            <span className="text-[12px] text-(--olivea-olive)">{count}</span>
          </div>
        </div>
        <FilterButton
          onClick={() => setSheetOpen(true)}
          label={tt(lang, "Filtros", "Filters")}
          activeCount={category === "all" ? 0 : 1}
        />
      </FilterBar>

      <FilterSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={tt(lang, "Filtros", "Filters")}
        closeLabel={tt(lang, "Cerrar", "Close")}
      >
        <FilterGroup label={tt(lang, "Casa", "House")}>
          {chips.map((c) => (
            <FilterChip
              key={c}
              active={category === c}
              onClick={() => {
                setCategory(c);
                closeSheet();
              }}
            >
              {label(c)}
            </FilterChip>
          ))}
        </FilterGroup>
      </FilterSheet>
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
                  "text-[11px] uppercase tracking-[0.24em] leading-none text-(--olivea-olive)",
                  active && "font-semibold"
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
      style={{ top: DOCK_TOP }}
      aria-label="Team filter"
    >
      <Reveal distance={10} delay={0.25}>
        <motion.div
          animate={{ width: collapsed ? 56 : 196 }}
          transition={{ duration: 0.26, ease: EASE }}
          className={dockShell}
          style={{ overflow: "hidden" }}
        >
          {/* header */}
          {collapsed ? (
            <div className="flex justify-center p-2.5">
              <button
                type="button"
                onClick={toggleCollapsed}
                className={dockIconButton}
                aria-label={tt(lang, "Expandir", "Expand")}
                title={tt(lang, "Expandir", "Expand")}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="px-3 py-3">
              <DockHeader stacked label={tt(lang, "Equipo", "Team")} meta={`${count} ${tt(lang, "personas", "people")}`}>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className={dockIconButton}
                  aria-label={tt(lang, "Colapsar", "Collapse")}
                  title={tt(lang, "Colapsar", "Collapse")}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </DockHeader>
            </div>
          )}

          {/* pills */}
          <div className={cn(collapsed ? "px-2 pb-3" : "px-3 pb-3")}>
            <div className="flex flex-col gap-2">
              {chips.map((c) => (
                <PillButton key={c} c={c} />
              ))}
            </div>

            {!collapsed ? (
              <div className="mt-3 text-[11px] text-(--olivea-olive) leading-snug">
                {tt(lang, "Incluye a los líderes en cada filtro.", "Includes the leaders in every filter.")}
              </div>
            ) : null}
          </div>
        </motion.div>
      </Reveal>
    </nav>
  );

  return (
    <>
      {mobileBar}
      {desktopDock}
    </>
  );
}