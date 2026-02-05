// app/(main)/[lang]/press/lib/pressSort.ts
import type { PressItem } from "../pressTypes";

export function timeKey(iso: string): number {
  const d = new Date(`${iso}T00:00:00Z`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

export function sortNewestFirst(a: PressItem, b: PressItem): number {
  const bt = timeKey(b.publishedAt);
  const at = timeKey(a.publishedAt);
  if (bt !== at) return bt - at;

  // deterministic tie-breakers (match original)
  if (a.kind !== b.kind) return a.kind === "award" ? -1 : 1;
  const issuerCmp = (a.issuer || "").localeCompare(b.issuer || "");
  if (issuerCmp !== 0) return issuerCmp;
  return (a.title || "").localeCompare(b.title || "");
}

export function isPinnedAward(it: PressItem): boolean {
  return it.kind === "award" && it.starred === true;
}

export function sortPinnedAwardThenNewest(a: PressItem, b: PressItem): number {
  const aPinned = isPinnedAward(a);
  const bPinned = isPinnedAward(b);
  if (aPinned && !bPinned) return -1;
  if (!aPinned && bPinned) return 1;
  return sortNewestFirst(a, b);
}
