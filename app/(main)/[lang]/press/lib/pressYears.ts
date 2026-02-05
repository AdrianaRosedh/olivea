// app/(main)/[lang]/press/lib/pressYears.ts
import type { PressItem } from "../pressTypes";

export function yearOf(iso: string): number {
  const y = Number(String(iso ?? "").slice(0, 4));
  return Number.isFinite(y) ? y : 0;
}

export function uniqYearsNewestFirst(items: PressItem[]): number[] {
  const ys = new Set<number>();
  for (const it of items) ys.add(yearOf(it.publishedAt));
  return Array.from(ys).filter(Boolean).sort((a, b) => b - a);
}
