// app/(main)/[lang]/press/hooks/usePressFilters.ts
import { useMemo } from "react";
import type { Identity, ItemKind, PressItem } from "../pressTypes";
import { yearOf } from "../lib/pressYears";

export function usePressFilters({
  items,
  kind,
  identity,
  year,
  q,
}: {
  items: PressItem[];
  kind: ItemKind;
  identity: Identity;
  year: number | "all";
  q: string;
}) {
  return useMemo(() => {
    const query = q.trim().toLowerCase();

    return items
      .filter((it) => (kind === "all" ? true : it.kind === kind))
      .filter((it) => (identity === "all" ? true : it.for === identity))
      .filter((it) => (year === "all" ? true : yearOf(it.publishedAt) === year))
      .filter((it) => {
        if (!query) return true;
        const hay = [
          it.title,
          it.issuer,
          it.section ?? "",
          it.blurb ?? "",
          ...(it.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
  }, [items, kind, identity, year, q]);
}
