import { useEffect, useMemo, useState } from "react";
import type { PressItem } from "../pressTypes";
import { uniqYearsNewestFirst, yearOf } from "../lib/pressYears";
import {
  isPinnedAward,
  sortNewestFirst,
  sortPinnedAwardThenNewest,
} from "../lib/pressSort";

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

export function usePressSections(filteredBase: PressItem[]) {
  // 1) newest-first (stable)
  const filteredNewest = useMemo(
    () => [...filteredBase].sort(sortNewestFirst),
    [filteredBase]
  );

  // 2) featured = newest overall
  const featured = useMemo(
    () => (filteredNewest.length ? filteredNewest[0] : null),
    [filteredNewest]
  );

  // 3) rest excludes featured (for “Most recent” separation)
  const rest = useMemo(() => {
    if (!featured) return filteredNewest;
    return filteredNewest.filter((x) => x.id !== featured.id);
  }, [filteredNewest, featured]);

  const mentionsOnly = useMemo(
    () => rest.filter((x) => x.kind === "mention").sort(sortNewestFirst),
    [rest]
  );

  const awardsOnly = useMemo(
    () => rest.filter((x) => x.kind === "award").sort(sortPinnedAwardThenNewest),
    [rest]
  );

  // ✅ One stable awards universe: awardsOnly + (featured if it’s an award)
  // Fixes: “2026 disappears after clicking 2025” AND ensures 2025 includes MB100 if loaded.
  const awardsAll = useMemo(() => {
    const pool: PressItem[] = [
      ...awardsOnly,
      ...(featured && featured.kind === "award" ? [featured] : []),
    ];
    return dedupeById(pool).sort(sortPinnedAwardThenNewest);
  }, [awardsOnly, featured]);

  // ✅ pinned always visible, always first
  const pinnedAwards = useMemo(
    () => awardsAll.filter(isPinnedAward),
    [awardsAll]
  );

  const awardsYears = useMemo(() => uniqYearsNewestFirst(awardsAll), [awardsAll]);
  const mentionsYears = useMemo(
    () => uniqYearsNewestFirst(mentionsOnly),
    [mentionsOnly]
  );

  const [awardsYearTab, setAwardsYearTab] = useState<number>(new Date().getFullYear());
  const [mentionsYearTab, setMentionsYearTab] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (!awardsYears.length) return;
    if (!awardsYears.includes(awardsYearTab)) setAwardsYearTab(awardsYears[0]);
  }, [awardsYears, awardsYearTab]);

  useEffect(() => {
    if (!mentionsYears.length) return;
    if (!mentionsYears.includes(mentionsYearTab)) setMentionsYearTab(mentionsYears[0]);
  }, [mentionsYears, mentionsYearTab]);

  // ✅ awards shown = pinned (always) + nonPinned filtered by year tab
  const awardsShown = useMemo(() => {
    const nonPinned = awardsAll.filter((it) => !isPinnedAward(it));
    const yearFiltered = nonPinned.filter(
      (it) => yearOf(it.publishedAt) === awardsYearTab
    );

    return dedupeById([...pinnedAwards, ...yearFiltered]).sort(sortPinnedAwardThenNewest);
  }, [awardsAll, pinnedAwards, awardsYearTab]);

  const mentionsShown = useMemo(() => {
    if (!mentionsYears.length) return mentionsOnly;
    return mentionsOnly.filter((it) => yearOf(it.publishedAt) === mentionsYearTab);
  }, [mentionsOnly, mentionsYears.length, mentionsYearTab]);

  return {
    featured,
    awardsYears,
    mentionsYears,
    awardsYearTab,
    setAwardsYearTab,
    mentionsYearTab,
    setMentionsYearTab,
    awardsShown,
    mentionsShown,

    // ✅ optional debug
    __debug: {
      awardsAll,
      awardsOnly,
      pinnedAwards,
    },
  };
}
