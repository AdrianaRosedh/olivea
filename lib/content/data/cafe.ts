// lib/content/data/cafe.ts
// Café page content

import type { CafeContent } from "../types";

const cafe: CafeContent = {
  meta: {
    title: {
      es: "OLIVEA Café | Café de Especialidad en Valle de Guadalupe",
      en: "OLIVEA Café | Specialty Coffee in Valle de Guadalupe",
    },
    description: {
      es: "Café de especialidad, pan artesanal y un patio en calma. Desayuno del huerto en Olivea Café en Valle de Guadalupe, Baja California.",
      en: "Specialty coffee, house bread and a calm courtyard. Breakfast from the garden at Olivea Café in Valle de Guadalupe, Baja California.",
    },
    ogImage: "/images/seo/cafe-og.jpg",
    keywords: [
      "Olivea Cafe",
      "coffee",
      "Valle de Guadalupe",
      "breakfast",
      "house bread",
      "padel",
    ],
  },
  hero: {
    id: "cafe-hero",
    page: "cafe",
    headline: {
      es: "Olivea Café",
      en: "Olivea Café",
    },
    subheadline: {
      es: "Café de casa, pan y mañanas sin prisa en Valle de Guadalupe.",
      en: "House coffee, bread and unhurried mornings in Valle de Guadalupe.",
    },
    image: {
      src: "/images/cafe/hero.jpg",
      alt: { es: "Olivea Café", en: "Olivea Café" },
    },
  },
  sections: [],
  faq: [],
};

export default cafe;
