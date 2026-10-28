"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Identity, ItemKind, Lang } from "./pressTypes";
import { tt } from "./lib/pressText";
import {
  SlidersHorizontal,
  X,
  ArrowUp,
  Newspaper,
  Award,
  FolderArchive,
  Mail,
  Layers,
} from "lucide-react";
import Reveal from "@/components/scroll/Reveal";
import {
  DOCK_TOP,
  DockHeader,
  FilterChip,
  FilterGroup,
  FilterSearch,
  dockIconButton,
  dockShell,
  filterLabel,
  filterLink,
  sidePanel,
} from "@/components/ui/filters/FilterKit";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** The fixed footer bar below it. */
const FOOTER_H = 72;

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

/** One line per section; what it holds is in the tooltip. */
function JumpButton({
  id,
  icon,
  title,
  hint,
  tone = "neutral",
  onNav,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  hint?: string;
  tone?: "neutral" | "primary";
  onNav: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => onNav(e as unknown as React.MouseEvent, id)}
      title={hint}
      className={cn(
        "w-full h-10 px-3 flex items-center gap-2 text-left rounded-xl ring-1 transition",
        tone === "primary"
          ? "bg-(--olivea-olive) text-(--olivea-cream) ring-black/10 shadow-[0_8px_18px_rgba(40,60,35,0.16)] hover:brightness-[1.03]"
          : "bg-white/12 text-(--olivea-olive) ring-(--olivea-olive)/14 hover:bg-white/18"
      )}
    >
      <span className="shrink-0" aria-hidden="true">{icon}</span>
      <span className="truncate text-[13px] font-medium">{title}</span>
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
  const [moreOpen, setMoreOpen] = useState(false);

  // The dock never scrolls. The full panel shows when it fits between the
  // logo and the footer (and the promo bar, when one shows); otherwise the
  // icon rail stands in for it, and search and filters open beside it.
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelHeight = useRef(0);
  const [fits, setFits] = useState(true);
  const rail = collapsed || !fits;

  useEffect(() => {
    const root = document.documentElement;
    const check = () => {
      if (panelRef.current) panelHeight.current = panelRef.current.offsetHeight;
      if (!panelHeight.current) return;
      const banner = parseFloat(getComputedStyle(root).getPropertyValue("--olivea-banner-clear")) || 0;
      // 12px of air below it, and a little hysteresis so it does not flicker
      // between the two at the boundary.
      const top = navRef.current?.getBoundingClientRect().top ?? 0;
      const room = window.innerHeight - top - FOOTER_H - banner - 12;
      setFits((was) => (was ? panelHeight.current <= room : panelHeight.current <= room - 16));
    };
    check();
    window.addEventListener("resize", check);
    // The promo bar publishes its height on <html> as it comes and goes.
    const mo = new MutationObserver(check);
    mo.observe(root, { attributes: true, attributeFilter: ["style"] });
    return () => {
      window.removeEventListener("resize", check);
      mo.disconnect();
    };
  }, [collapsed, count, lang]);

  // The filter panel beside the dock closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [moreOpen]);




  const iconBtn = (active?: boolean) =>
    cn(
      "h-11 w-11 rounded-2xl grid place-items-center",
      "ring-1 transition",
      active
        ? "bg-white/75 ring-(--olivea-olive)/45 text-(--olivea-olive) font-medium"
        : "bg-white/10 ring-(--olivea-olive)/14 text-(--olivea-olive) hover:bg-white/16 hover:ring-(--olivea-olive)/22"
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

  const searchField = (
    <FilterSearch
      value={q}
      onChange={setQ}
      placeholder={tt(lang, "Buscar: título, medio, tag…", "Search: title, outlet, tag…")}
      label={tt(lang, "Buscar en prensa", "Search press coverage")}
      clearLabel={tt(lang, "Borrar", "Clear")}
    />
  );

  const identityChips = (
    <div className="flex flex-wrap gap-2">
      {(["all", "olivea", "hotel", "restaurant", "cafe"] as Identity[]).map((x) => (
        <FilterChip key={x} size="sm" active={identity === x} onClick={() => setIdentity(x)}>
          {identLabel(x)}
        </FilterChip>
      ))}
    </div>
  );

  const DesktopExpanded = (
    <motion.div
      ref={panelRef}
      className={cn(dockShell, "w-73")}
      initial={false}
      animate={{ width: "18.25rem" }}
      transition={{ duration: 0.26, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      {/* header + search */}
      <div className="px-3.5 pt-3.5 pb-3">
        <DockHeader label={tt(lang, "Prensa", "Press")} meta={`${count} ${tt(lang, "items", "items")}`}>
            {anyFiltersOn ? (
              <button
                type="button"
                onClick={resetAll}
                className={dockIconButton}
                aria-label={tt(lang, "Limpiar", "Reset")}
                title={tt(lang, "Limpiar", "Reset")}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={toggleCollapsed}
              className={dockIconButton}
              aria-label={tt(lang, "Colapsar", "Collapse")}
              title={tt(lang, "Colapsar", "Collapse")}
            >
              <Layers className="h-4 w-4" />
            </button>
        </DockHeader>

        <div className="mt-2.5">{searchField}</div>
      </div>

      {/* jump */}
      <div className="px-3.5 pb-3">
        <div className={filterLabel}>{tt(lang, "Secciones", "Sections")}</div>
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          <JumpButton
            id="awards"
            icon={<Award className="h-4 w-4" />}
            title={tt(lang, "Reconocimientos", "Awards")}
            hint={tt(lang, "Premios & guías", "Awards & guides")}
            onNav={onNav}
          />
          <JumpButton
            id="mentions"
            icon={<Newspaper className="h-4 w-4" />}
            title={tt(lang, "Menciones", "Press mentions")}
            hint={tt(lang, "Artículos & notas", "Articles & notes")}
            onNav={onNav}
          />
          <JumpButton
            id="presskit"
            icon={<FolderArchive className="h-4 w-4" />}
            title={tt(lang, "Press Kit y Media", "Press Kit & Media")}
            hint={tt(lang, "Descargas oficiales", "Official downloads")}
            tone="primary"
            onNav={onNav}
          />
          <div className="grid grid-cols-2 gap-1.5">
            <JumpButton
              id="contact"
              icon={<Mail className="h-4 w-4" />}
              title={tt(lang, "Contacto", "Contact")}
              hint={tt(lang, "PR & medios", "Media & PR")}
              onNav={onNav}
            />
            <JumpButton
              id="top"
              icon={<ArrowUp className="h-4 w-4" />}
              title={tt(lang, "Arriba", "Top")}
              hint={tt(lang, "Inicio", "Top")}
              onNav={onNav}
            />
          </div>
        </div>
      </div>

      {/* filters: who it is about here; type and year open beside the dock */}
      <div className="px-3.5 pb-3.5">
        <div className="flex items-center justify-between">
          <div className={filterLabel}>{tt(lang, "Filtrar", "Filter")}</div>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={filterLink}
          >
            {tt(lang, "Más", "More")}
          </button>
        </div>
        <div className="mt-2">{identityChips}</div>
      </div>
    </motion.div>
  );

  const DesktopCollapsed = (
    <motion.div
      className={cn(dockShell, "w-16")}
      initial={false}
      animate={{ width: "4rem" }}
      transition={{ duration: 0.26, ease: EASE }}
      style={{ overflow: "hidden" }}
    >
      <div className="px-2 py-3 flex flex-col items-center gap-2">
        {/* Expanding is only offered when the full panel has room. */}
        {fits ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            className={iconBtn(true)}
            aria-label={tt(lang, "Expandir", "Expand")}
            title={tt(lang, "Expandir", "Expand")}
          >
            <Layers className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={iconBtn(moreOpen || anyFiltersOn)}
          aria-label={tt(lang, "Buscar y filtrar", "Search and filter")}
          title={tt(lang, "Buscar y filtrar", "Search and filter")}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "awards")}
          className={iconBtn()}
          aria-label={tt(lang, "Reconocimientos", "Awards")}
          title={tt(lang, "Reconocimientos", "Awards")}
        >
          <Award className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "mentions")}
          className={iconBtn()}
          aria-label={tt(lang, "Prensa", "Press")}
          title={tt(lang, "Prensa", "Press")}
        >
          <Newspaper className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "presskit")}
          className={cn(iconBtn(), "bg-(--olivea-olive)/10")}
          aria-label={tt(lang, "Press Kit", "Press Kit")}
          title={tt(lang, "Press Kit", "Press Kit")}
        >
          <FolderArchive className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "contact")}
          className={iconBtn()}
          aria-label={tt(lang, "Contacto", "Contact")}
          title={tt(lang, "Contacto", "Contact")}
        >
          <Mail className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={(e) => onNav(e as unknown as React.MouseEvent, "top")}
          className={iconBtn()}
          aria-label={tt(lang, "Arriba", "Top")}
          title={tt(lang, "Arriba", "Top")}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );

  // Beside the dock: type and year, plus search and who it is about when the
  // rail stands in for the full panel.
  const MorePanel = (
    <motion.div
      key="press-more"
      role="group"
      aria-label={tt(lang, "Filtros de prensa", "Press filters")}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={cn(sidePanel, "absolute top-1 left-full ml-2 w-64 p-3.5 space-y-3")}
    >
      {rail ? (
        <>
          {searchField}
          {identityChips}
        </>
      ) : null}

      <FilterGroup label={tt(lang, "Tipo", "Type")}>
        {(["all", "award", "mention"] as ItemKind[]).map((k) => (
          <FilterChip key={k} size="sm" active={kind === k} onClick={() => setKind(k)}>
            {kindLabel(k)}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup label={tt(lang, "Año", "Year")}>
        <FilterChip size="sm" active={year === "all"} onClick={() => setYear("all")}>
          {tt(lang, "Todos", "All")}
        </FilterChip>
        {topYearPicks.map((y) => (
          <FilterChip key={y} size="sm" active={year === y} onClick={() => setYear(y)}>
            {y}
          </FilterChip>
        ))}
      </FilterGroup>

      {anyFiltersOn ? (
        <button
          type="button"
          onClick={resetAll}
          className={filterLink}
        >
          {tt(lang, "Limpiar filtros", "Clear filters")}
        </button>
      ) : null}
    </motion.div>
  );

  return (
    <nav
      ref={navRef}
      className="hidden md:block fixed left-3 lg:left-5 z-40 p-1 pointer-events-auto"
      // Its 4px padding keeps the card's outline clear; the card itself lines
      // up with the other docks.
      style={{ top: `calc(${DOCK_TOP} - 4px)` }}
      aria-label="Press dock"
    >
      <Reveal distance={10} delay={0.25}>
        {rail ? DesktopCollapsed : DesktopExpanded}
      </Reveal>
      <AnimatePresence>{moreOpen ? MorePanel : null}</AnimatePresence>
    </nav>
  );
}
