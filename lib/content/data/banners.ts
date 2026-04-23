// lib/content/data/banners.ts
// Banner content — mirrors content/banners/active.json

import type { BannerItem } from "../types";

const items: BannerItem[] = [
  {
    id: "pmg-sustainability-2026-v1",
    enabled: true,
    type: "notice",
    translations: {
      es: {
        text: "Olivea recibió el Premio México Gastronómico de Sustentabilidad 2026.",
        ctaLabel: "Ver reconocimiento",
        ctaHref: "/es/press#awards",
      },
      en: {
        text: "Olivea received the México Gastronómico Sustainability Award 2026.",
        ctaLabel: "View award",
        ctaHref: "/en/press#awards",
      },
    },
    startsAt: "2026-02-05T00:00:00-08:00",
    endsAt: "2026-03-20T00:00:00-08:00",
    dismissible: true,
    includePaths: ["/es/*", "/en/*"],
    excludePaths: ["/es", "/en"],
  },
];

export default items;
export { items };
