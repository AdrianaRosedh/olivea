"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Identity, ItemKind, Lang } from "./pressTypes";
import { tt } from "./lib/pressText";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const TOP_OFFSET_CLASS = "top-14";
const BAR_HEIGHT_SPACER = "h-16";

export interface PressDockMobileProps {
  lang: Lang;
  barHidden: boolean;
  sheetOpen: boolean;
  setSheetOpen: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
  identity: Identity;
  setIdentity: (v: Identity) => void;
  kind: ItemKind;
  setKind: (v: ItemKind) => void;
  year: number | "all";
  setYear: (v: number | "all") => void;
  years: number[];
  countsByIdentity: Record<Identity, number>;
  anyFiltersOn: boolean;
  resetAll: () => void;
  onNav: (e: React.MouseEvent, id: string) => void;
}

export function PressDockMobile({
  lang,
  barHidden,
  sheetOpen,
  setSheetOpen,
  q,
  setQ,
  identity,
  setIdentity,
  kind,
  setKind,
  year,
  setYear,
  years,
  countsByIdentity,
  anyFiltersOn,
  resetAll,
  onNav,
}: PressDockMobileProps) {
  const chipBase = cn(
    "px-2.5 py-1 rounded-full text-[11px] leading-none transition",
    "ring-1 ring-(--olivea-olive)/14",
    "bg-white/12 text-(--olivea-clay) opacity-95",
    "hover:bg-white/18 hover:text-(--olivea-olive) hover:opacity-100"
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
    if (x === "hotel") return `${tt(lang, "Hotel", "Hotel")} (${countsByIdentity.hotel})`;
    if (x === "restaurant") return `${tt(lang, "Rest.", "Rest.")} (${countsByIdentity.restaurant})`;
    return `${tt(lang, "Café", "Café")} (${countsByIdentity.cafe})`;
  };

  const topYearPicks = years.slice(0, 4);

  return (
    <>
      {/* Spacer to make room for the fixed bar */}
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      {/* Mobile bar - hides/shows on scroll */}
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
        <div className="px-4 py-3 flex items-center gap-2 pointer-events-auto">
          {/* Search */}
          <div className="flex-1 rounded-xl bg-white/14 ring-1 ring-(--olivea-olive)/14 px-3 py-2 flex items-center gap-2">
            <Search className="h-4 w-4 opacity-70 text-(--olivea-olive) shrink-0" />
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
                className="h-6 w-6 rounded-full grid place-items-center bg-white/18 text-(--olivea-olive)"
                aria-label={tt(lang, "Borrar", "Clear")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => setSheetOpen(!sheetOpen)}
            className={cn(
              "h-11 w-11 rounded-xl grid place-items-center transition shrink-0",
              "ring-1",
              sheetOpen
                ? "bg-(--olivea-olive)/12 ring-(--olivea-olive)/26 text-(--olivea-olive)"
                : "bg-white/10 ring-(--olivea-olive)/14 text-(--olivea-olive)/80"
            )}
            aria-label={tt(lang, "Filtros", "Filters")}
          >
            <SlidersHorizontal className="h-4 w-4 opacity-85" />
          </button>
        </div>
      </motion.div>

      {/* Mobile filter sheet */}
      {sheetOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed inset-0 z-200 bg-black/40 pointer-events-auto"
          onClick={() => setSheetOpen(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-(--olivea-cream)/98 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-(--olivea-olive)/10">
                <h2 className="text-[13px] font-medium text-(--olivea-olive)">
                  {tt(lang, "Filtrar", "Filter")}
                </h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="h-8 w-8 rounded-lg grid place-items-center text-(--olivea-olive) hover:bg-white/10"
                  aria-label={tt(lang, "Cerrar", "Close")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Filters: Identity */}
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-75 mb-2">
                  {tt(lang, "Marca", "Brand")}
                </div>
                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Filters: Type */}
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-75 mb-2">
                  {tt(lang, "Tipo", "Type")}
                </div>
                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Filters: Year */}
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-(--olivea-olive) opacity-75 mb-2">
                  {tt(lang, "Año", "Year")}
                </div>
                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Quick nav */}
              <div className="pt-2 border-t border-(--olivea-olive)/10 space-y-2">
                <button
                  type="button"
                  onClick={(e) => onNav(e, "awards")}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-(--olivea-olive) hover:bg-white/10 transition"
                >
                  {tt(lang, "→ Reconocimientos", "→ Awards")}
                </button>
                <button
                  type="button"
                  onClick={(e) => onNav(e, "mentions")}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-(--olivea-olive) hover:bg-white/10 transition"
                >
                  {tt(lang, "→ Prensa", "→ Press")}
                </button>
              </div>

              {/* Reset */}
              {anyFiltersOn ? (
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full px-3 py-2 rounded-lg text-[13px] text-(--olivea-olive) bg-white/12 ring-1 ring-(--olivea-olive)/14 hover:bg-white/18 transition"
                >
                  {tt(lang, "Limpiar", "Reset")}
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}
