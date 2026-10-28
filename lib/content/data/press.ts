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
  // Fallback for press_content.michelin_band — edit in /admin → Press.
  michelin_band: {
    "guideLabel": {
      "es": "Guía MICHELIN",
      "en": "MICHELIN Guide"
    },
    "heading": {
      "es": "Una Estrella MICHELIN · Estrella Verde MICHELIN",
      "en": "One MICHELIN Star · MICHELIN Green Star"
    },
    "restaurant": {
      "es": "Olivea Farm To Table · 2025 y 2026",
      "en": "Olivea Farm To Table · 2025 and 2026"
    },
    "hotel": {
      "es": "Casa Olivea · en la Guía MICHELIN (hoteles)",
      "en": "Casa Olivea · in the MICHELIN Guide (hotels)"
    },
    "linkLabel": {
      "es": "Ver en la Guía MICHELIN",
      "en": "View in the MICHELIN Guide"
    }
  },
  articles: [],  // MDX-based articles in press/content/
};

export default press;
