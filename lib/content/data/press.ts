// lib/content/data/press.ts

import type { PressContent } from "../types";

const press: PressContent = {
  meta: {
    title: {
      es: "Prensa | OLIVEA",
      en: "Press | OLIVEA",
    },
    description: {
      es: "Reconocimientos, menciones en medios y recursos oficiales de prensa de Olivea — hospitalidad del huerto, restaurante con estrella MICHELIN y hospedaje en Valle de Guadalupe.",
      en: "Awards, media coverage, and official press resources for Olivea — farm hospitality, MICHELIN-starred restaurant, and farm stay in Valle de Guadalupe.",
    },
    ogImage: "/images/seo/seo-og.jpg",
    keywords: ["Press", "Valle de Guadalupe", "awards", "gastronomy"],
  },
  title: {
    es: "Prensa",
    en: "Press",
  },
  tagline: {
    es: "Reconocimientos, menciones en medios y recursos de prensa de Olivea — hospitalidad del huerto, restaurante con estrella MICHELIN y hospedaje en Valle de Guadalupe.",
    en: "Awards, media coverage, and press resources for Olivea — farm hospitality, MICHELIN-starred restaurant, and farm stay in Valle de Guadalupe.",
  },
  description: [],
  articles: [],  // MDX-based articles in press/content/
};

export default press;
