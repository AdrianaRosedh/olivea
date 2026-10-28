"use client";

import { Award, FolderArchive, Mail, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Identity, ItemKind, Lang } from "./pressTypes";
import { tt } from "./lib/pressText";
import {
  FilterBar,
  FilterButton,
  FilterChip,
  FilterGroup,
  FilterSearch,
  FilterSheet,
  JumpRow,
  SheetFooter,
} from "@/components/ui/filters/FilterKit";

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
  const activeCount = [identity !== "all", kind !== "all", year !== "all"].filter(Boolean).length;
  const close = () => setSheetOpen(false);
  const go = (id: string) => (e: React.MouseEvent) => {
    close();
    onNav(e, id);
  };

  return (
    <>
      {/* Spacer to make room for the fixed bar */}
      <div className={cn("md:hidden", BAR_HEIGHT_SPACER)} />

      <FilterBar hidden={barHidden} className="md:hidden z-210 top-14">
        <FilterSearch
          className="flex-1"
          value={q}
          onChange={setQ}
          placeholder={tt(lang, "Buscar: título, medio, tag…", "Search: title, outlet, tag…")}
          label={tt(lang, "Buscar en prensa", "Search press coverage")}
          clearLabel={tt(lang, "Borrar", "Clear")}
        />
        <FilterButton
          onClick={() => setSheetOpen(!sheetOpen)}
          label={tt(lang, "Filtros", "Filters")}
          activeCount={activeCount}
        />
      </FilterBar>

      <FilterSheet
        open={sheetOpen}
        onClose={close}
        title={tt(lang, "Filtros", "Filters")}
        closeLabel={tt(lang, "Cerrar", "Close")}
        footer={
          <SheetFooter
            onClear={anyFiltersOn ? resetAll : undefined}
            clearLabel={tt(lang, "Limpiar", "Clear")}
            onDone={close}
            doneLabel={tt(lang, "Listo", "Done")}
          />
        }
      >
        <FilterGroup label={tt(lang, "Marca", "Brand")}>
          {(["all", "olivea", "hotel", "restaurant", "cafe"] as Identity[]).map((x) => (
            <FilterChip key={x} active={identity === x} onClick={() => setIdentity(x)}>
              {identLabel(x)}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label={tt(lang, "Tipo", "Type")}>
          {(["all", "award", "mention"] as ItemKind[]).map((k) => (
            <FilterChip key={k} active={kind === k} onClick={() => setKind(k)}>
              {kindLabel(k)}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label={tt(lang, "Año", "Year")}>
          <FilterChip active={year === "all"} onClick={() => setYear("all")}>
            {tt(lang, "Todos", "All")}
          </FilterChip>
          {topYearPicks.map((y) => (
            <FilterChip key={y} active={year === y} onClick={() => setYear(y)}>
              {y}
            </FilterChip>
          ))}
        </FilterGroup>

        <div className="grid grid-cols-2 gap-2">
          <JumpRow icon={<Award className="h-4 w-4" />} label={tt(lang, "Reconocimientos", "Awards")} onClick={go("awards")} />
          <JumpRow icon={<Newspaper className="h-4 w-4" />} label={tt(lang, "Menciones", "Mentions")} onClick={go("mentions")} />
          <JumpRow icon={<FolderArchive className="h-4 w-4" />} label={tt(lang, "Press Kit", "Press Kit")} onClick={go("presskit")} />
          <JumpRow icon={<Mail className="h-4 w-4" />} label={tt(lang, "Contacto", "Contact")} onClick={go("contact")} />
        </div>
      </FilterSheet>
    </>
  );
}
