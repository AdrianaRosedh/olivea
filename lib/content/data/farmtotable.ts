// lib/content/data/farmtotable.ts
// Farm To Table page content

import type { FarmToTableContent } from "../types";

const farmtotable: FarmToTableContent = {
  meta: {
    title: {
      es: "OLIVEA Farm To Table | Restaurante con Estrella MICHELIN en Valle de Guadalupe",
      en: "OLIVEA Farm To Table | MICHELIN-Starred Restaurant in Valle de Guadalupe",
    },
    description: {
      es: "Menú degustación con estrella MICHELIN y estrella verde MICHELIN, nacido del huerto en Valle de Guadalupe, Baja California. Donde el huerto es la esencia.",
      en: "One MICHELIN Star & MICHELIN Green Star tasting-menu restaurant with farm stay and café on the same property in Valle de Guadalupe, Baja California. Farm hospitality where the garden is the essence.",
    },
    ogImage: "/images/seo/farm-og.jpg",
  },
  hero: {
    id: "ftt-hero",
    page: "farmtotable",
    headline: {
      es: "Olivea Farm To Table",
      en: "Olivea Farm To Table",
    },
    subheadline: {
      es: "Menú degustación con estrella MICHELIN, nacido del huerto.",
      en: "MICHELIN-starred tasting menu, born from the garden.",
    },
    image: {
      src: "/images/farm/hero.jpg",
      alt: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    },
  },
  sections: [],  // MDX-based
  faq: [],       // Loaded from MDX faq files
};

export default farmtotable;
