// lib/content/data/sustainability.ts

import type { SustainabilityContent } from "../types";

const sustainability: SustainabilityContent = {
  meta: {
    title: {
      es: "Filosofía | OLIVEA",
      en: "Philosophy | OLIVEA",
    },
    description: {
      es: "Por qué Olivea se llama Olivea — del latín oliva, el olivo — y la filosofía detrás: origen, identidad, eficiencia, innovación, gastronomía y comunidad en Valle de Guadalupe, del huerto a la mesa.",
      en: "Why Olivea is called Olivea — from the Latin oliva, the olive — and the philosophy behind it: origins, identity, efficiency, innovation, gastronomy, and community in Valle de Guadalupe, from garden to table.",
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
