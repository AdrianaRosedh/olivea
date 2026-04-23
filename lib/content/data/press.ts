// lib/content/data/press.ts

import type { PressContent } from "../types";

const press: PressContent = {
  meta: {
    title: {
      es: "Prensa | OLIVEA",
      en: "Press | OLIVEA",
    },
    description: {
      es: "Chefs, viticultores, hoteleros y artesanos dando forma a la identidad de la región — prensa, colaboraciones y eventos compartidos.",
      en: "Chefs, winemakers, hoteliers and artisans shaping the region's identity — press, collaborations and shared events.",
    },
    ogImage: "/images/seo/seo-og.jpg",
    keywords: ["Press", "Valle de Guadalupe", "awards", "gastronomy"],
  },
  title: {
    es: "Prensa",
    en: "Press",
  },
  tagline: {
    es: "Una plataforma colectiva que une las voces líderes en gastronomía, vino y hospitalidad en Valle de Guadalupe y Ensenada.",
    en: "A collective platform uniting the leading voices in gastronomy, wine, and hospitality across Valle de Guadalupe and Ensenada.",
  },
  description: [
    {
      es: "Nacida de un deseo compartido de elevar la identidad de la región, Mesa del Valle reúne chefs, viticultores, hoteleros y artesanos para contar una historia unificada de excelencia, sustentabilidad y orgullo cultural.",
      en: "Born from a shared desire to elevate the region's identity, Mesa del Valle brings together chefs, winemakers, hoteliers, and artisans to tell a unified story of excellence, sustainability, and cultural pride.",
    },
    {
      es: "A través de colaboraciones estratégicas, alcance de prensa internacional y eventos compartidos, buscamos posicionar Valle de Guadalupe como la capital gastronómica y cultural de Latinoamérica.",
      en: "Through strategic collaborations, international press outreach, and shared events, we aim to position Valle de Guadalupe as the gastronomic and cultural capital of Latin America.",
    },
    {
      es: "La mesa está puesta. El futuro es compartido.",
      en: "The table is set. The future is shared.",
    },
  ],
  articles: [],  // MDX-based articles in press/content/
};

export default press;
