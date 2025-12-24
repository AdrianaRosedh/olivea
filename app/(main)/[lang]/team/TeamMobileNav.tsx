// app/(main)/[lang]/team/TeamMobileNav.tsx
"use client";

import { useMemo } from "react";
import MobileSectionNav, {
  type MobileSectionNavItem,
} from "@/components/navigation/MobileSectionNav";
import type { Lang, LeaderProfile } from "./teamData";

export default function TeamMobileNav({
  lang,
  leaders,
}: {
  lang: Lang;
  leaders: LeaderProfile[];
}) {
  const items: MobileSectionNavItem[] = useMemo(() => {
    // Sort once
    const sorted = [...leaders].sort(
      (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
    );

    // De-dupe ids (super important if your leaders list is built from
    // featured + restVisible and something overlaps due to filter changes)
    const seen = new Set<string>();

    const out: MobileSectionNavItem[] = [];
    for (const l of sorted) {
      const id = l.id; // ✅ must match DOM ids exactly (NO prefix)
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({ id, label: l.name });
    }
    return out;
  }, [leaders]);

  if (!items.length) return null;

  return (
    <div className="lg:hidden">
      <MobileSectionNav
        items={items}
        lang={lang}
        pageTitle={{ es: "Equipo", en: "Team" }}
        enableSubRow={false}
      />
    </div>
  );
}
