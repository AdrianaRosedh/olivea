// lib/content/data/banners.ts
// Banner content — mirrors content/banners/active.json
//
// This is only the FALLBACK seed. The live banner is the Supabase `banners`
// table (managed at /admin/banners, read by app/api/banner/route.ts with 60s
// revalidate); this file is served only when Supabase is unavailable. Kept in
// sync with the live row so an outage degrades to the same banner, not a stale
// one.

import type { BannerItem } from "../types";

const items: BannerItem[] = [
  {
    id: "mexbest-readers-choice-2026-v1",
    enabled: true,
    type: "notice",
    translations: {
      es: {
        text: "Olivea Farm to Table y Casa Olivea están nominados en el Reader's Choice de los Premios MexBest 2026.",
        ctaLabel: "Votar",
        ctaHref: "/es/vota",
      },
      en: {
        text: "Olivea Farm to Table and Casa Olivea are nominated in the MexBest 2026 Reader's Choice awards.",
        ctaLabel: "Vote",
        ctaHref: "/en/vota",
      },
    },
    startsAt: "2026-09-03T00:00:00-07:00",
    endsAt: "2026-12-31T23:59:59-08:00",
    dismissible: true,
    includePaths: ["/es/*", "/en/*"],
    excludePaths: ["/es", "/en", "/es/vota", "/en/vota"],
  },
];

export default items;
export { items };
