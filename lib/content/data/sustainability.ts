// lib/content/data/sustainability.ts

import type { SustainabilityContent } from "../types";

const sustainability: SustainabilityContent = {
  meta: {
    title: {
      es: "Filosofía de Olivea | Sustentabilidad",
      en: "Olivea's Philosophy | Sustainability",
    },
    description: {
      es: "Rellenables, cuidado del agua, abastecimiento responsable y composta — cómo Olivea reduce residuos y apoya productores locales en Valle de Guadalupe.",
      en: "Refillables, water care, responsible sourcing and compost — how Olivea reduces waste and supports local producers in Valle de Guadalupe.",
    },
    ogImage: "/images/seo/seo-og.jpg",
    keywords: ["sustainability", "refillables", "compost", "local producers", "Valle de Guadalupe"],
  },
  title: {
    es: "Filosofía",
    en: "Philosophy",
  },
  description: {
    es: "Nuestro compromiso con prácticas sustentables y cuidado ambiental.",
    en: "Our commitment to sustainable practices and environmental stewardship.",
  },
  sections: [],  // Loaded from sustainabilitySections collection
};

export default sustainability;
