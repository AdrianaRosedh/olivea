"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Identity, ItemKind, Lang } from "./pressTypes";
import { tt } from "./lib/pressText";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUp,
  Newspaper,
  Award,
  FolderArchive,
  Mail,
  Layers,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dockV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.25 },
  },
};

export interface PressDockDesktopProps {
  lang: Lang;
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
  collapsed: boolean;
  toggleCollapsed: () => void;
  count: number;
  onNav: (e: React.MouseEvent, id: string) => void;
}

function JumpButton({
  id,
  icon,
  title,
  subtitle,
  tone = "neutral",
  onNav,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tone?: "neutral" | "primary";
  onNav: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => onNav(e as unknown as React.MouseEvent, id)}
      className={cn(
        "w-full text-left rounded-2xl px-3 py-3 ring-1 transition",
        tone === "primary"
          ? "bg-(--olivea-olive) text-(--olivea-cream) ring-black/10 shadow-[0_10px_22px_rgba(40,60,35,0.16)] hover:brightness-[1.03]"
          : "bg-white/12 text-(--olivea-olive) ring-(--olivea-olive)/14 hover:bg-white/18"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("opacity-85", tone === "primary" ? "text-(--olivea-cream)" : "text-(--olivea-olive)")}>
          {icon}
        </span>
        <span className="text-[13px] font-medium">{title}</span>
      </div>
      {subtitle ? (
        <div className={cn("mt-1 text-[12px]", tone === "primary" ? "opacity-80" : "text-(--olivea-clay) opacity-75")}>
          {subtitle}
        </div>
      ) : null}
    </button>
  );
}

export function PressDockDesktop({
  lang,
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
  collapsed,
  toggleCollapsed,
  count,
  onNav,
}: PressDockDesktopProps) {
  const reduce = useReducedMotion();
  const [moreOpen, setMoreOpen] = useState(false);

  const panelShell = cn(
    "rounded-3xl",
    "bg-(--olivea-cream)/62 backdrop-blur-md",
    "ring-1 ring-(--olivea-olive)/14",
    "shadow-[0_10px_28px_rgba(18,24,16,0.10)]"
  );

  const sectionLabel = cn(
    "text-[10px] uppercase tracking-[0.28em]",
    "text-(--olivea-olive) opacity-75"
  );

  const inputShell = cn(
    "rounded-2xl",
    "bg-white/14 ring-1 ring-(--olivea-olive)/14",
    "backdrop-blur-[2px]"
  );

  const iconBtn = (active?: boolean) =>
    cn(
      "h-11 w-11 rounded-2xl grid place-items-center",
      "ring-1 transition",
      active
        ? "bg-(--olivea-olive)/12 ring-(--olivea-olive)/26 text-(--olivea-olive)"
        : "bg-white/10 ring-(--olivea-olive)/14 text-(--olivea-olive)/80 hover:bg-white/16 hover:ring-(--olivea-olive)/22"
    );

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

  const DesktopExpanded = (
    <motion.div
      className={cn(panelShell, "w-73")}
      initial={false}
      animate={{ width: "18.25rem" }}
      transition={{ duration: 0.26, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      {/* header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div className="min-w-0">
          <div className={sectionLabel}>{tt(lang, "Prensa", "Press")}</div>
          <div className="mt-1 text-[12px] text-(--olivea-olive) opacity-80">
            {count} {tt(lang, "items", "items")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {anyFiltersOn ? (
            <button
              type="button"
              onClick={resetAll}
              className={cn(
                "h-10 w-10 rounded-2xl grid place-items-center",
                "bg-white/16 ring-1 ring-(--olivea-olive)/14",
                "text-(--olivea-olive) hover:bg-white/22 transition"
              )}
              aria-label={tt(lang, "Limpiar", "Reset")}
              title={tt(lang, "Limpiar", "Reset")}
            >
              <X className="h-4 w-4 opacity-85" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "h-10 w-10 rounded-2xl grid place-items-center",
              "bg-white/16 ring-1 ring-(--olivea-olive)/14",
              "text-(--olivea-olive) hover:bg-white/22 transition"
            )}
            aria-label={tt(lang, "Colapsar", "Collapse")}
            title={tt(lang, "Colapsar", "Collapse")}
          >
            <Layers className="h-4 w-4 opacity-85" />
          </button>
        </div>
      </div>

      {/* search */}
      <div className="px-4 pb-4">
        <div className={sectionLabel}>{tt(lang, "Buscar", "Search")}</div>
        <div className={cn("mt-2 px-3 py-2.5 flex items-center gap-2", inputShell)}>
          <Search className="h-4 w-4 opacity-70 text-(--olivea-olive) shrink-0" />
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
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center",
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

      {/* jump */}
      <div className="px-4 pb-4">
        <div className={sectionLabel}>{tt(lang, "Secciones", "Sections")}</div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <JumpButton
            id="awards"
            icon={<Award className="h-4 w-4" />}
            title={tt(lang, "Reconocimientos", "Awards")}
            subtitle={tt(lang, "Premios & guías", "Awards & guides")}
            onNav={onNav}
          />
          <JumpButton
            id="mentions"
            icon={<Newspaper className="h-4 w-4" />}
            title={tt(lang, "Menciones", "Press mentions")}
            subtitle={tt(lang, "Artículos & notas", "Articles & notes")}
            onNav={onNav}
          />
          <JumpButton
            id="presskit"
            icon={<FolderArchive className="h-4 w-4" />}
            title={tt(lang, "Press Kit y Media", "Press Kit & Media")}
            subtitle={tt(lang, "Descargas oficiales", "Official downloads")}
            tone="primary"
            onNav={onNav}
          />
          <div className="grid grid-cols-2 gap-2">
            <JumpButton
              id="contact"
              icon={<Mail className="h-4 w-4" />}
              title={tt(lang, "Contacto", "Contact")}
              subtitle={tt(lang, "PR & medios", "Media & PR")}
              onNav={onNav}
            />
            <JumpButton
              id="top"
              icon={<ArrowUp className="h-4 w-4" />}
              title={tt(lang, "Arriba", "Top")}
              subtitle={tt(lang, "Inicio", "Top")}
              onNav={onNav}
            />
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className={sectionLabel}>{tt(lang, "Filtrar", "Filter")}</div>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="text-[12px] text-(--olivea-olive) opacity-75 hover:opacity-100 underline underline-offset-4"
          >
            {moreOpen ? tt(lang, "Menos", "Less") : tt(lang, "Más", "More")}
          </button>
        </div>

        {/* Identity */}
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
              className={cn("mt-3 rounded-2xl bg-white/10 ring-1 ring-(--olivea-olive)/14 p-3")}
            >
              {/* Type */}
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

              {/* Year */}
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
    </motion.div>
  );

  const DesktopCollapsed = (
    <motion.div
      className={cn(panelShell, "w-16")}
      initial={false}
      animate={{ width: "4rem" }}
      transition={{ duration: 0.26, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      <div className="px-2 py-3 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          className={iconBtn(true)}
          aria-label={tt(lang, "Expandir", "Expand")}
          title={tt(lang, "Expandir", "Expand")}
        >
          <Layers className="h-4 w-4 opacity-90" />
        </button>

        <button
          type="button"
          onClick={() => {
            toggleCollapsed();
            setMoreOpen(true);
          }}
          className={iconBtn(moreOpen)}
          aria-label={tt(lang, "Filtros", "Filters")}
          title={tt(lang, "Filtros", "Filters")}
        >
          <SlidersHorizontal className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "awards")}
          className={iconBtn()}
          aria-label={tt(lang, "Reconocimientos", "Awards")}
          title={tt(lang, "Reconocimientos", "Awards")}
        >
          <Award className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "mentions")}
          className={iconBtn()}
          aria-label={tt(lang, "Prensa", "Press")}
          title={tt(lang, "Prensa", "Press")}
        >
          <Newspaper className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "presskit")}
          className={cn(iconBtn(), "bg-(--olivea-olive)/10")}
          aria-label={tt(lang, "Press Kit", "Press Kit")}
          title={tt(lang, "Press Kit", "Press Kit")}
        >
          <FolderArchive className="h-4 w-4 opacity-90" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "contact")}
          className={iconBtn()}
          aria-label={tt(lang, "Contacto", "Contact")}
          title={tt(lang, "Contacto", "Contact")}
        >
          <Mail className="h-4 w-4 opacity-85" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "top")}
          className={iconBtn()}
          aria-label={tt(lang, "Arriba", "Top")}
          title={tt(lang, "Arriba", "Top")}
        >
          <ArrowUp className="h-4 w-4 opacity-85" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <nav
      className="hidden md:block fixed left-4 lg:left-6 z-40 pointer-events-auto"
      style={{ top: 255 }}
      aria-label="Press dock"
    >
      <motion.div variants={dockV} initial={reduce ? false : "hidden"} animate="show">
        {collapsed ? DesktopCollapsed : DesktopExpanded}
      </motion.div>
    </nav>
  );
}
