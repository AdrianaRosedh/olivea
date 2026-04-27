// lib/content/data/home.ts
// Home page content — hero, CTAs, and metadata

import type { HomeContent } from "../types";

const home: HomeContent = {
  meta: {
    title: {
      es: "OLIVEA | Hospitalidad del Huerto en Valle de Guadalupe, Baja California",
      en: "OLIVEA | Farm Hospitality in Valle de Guadalupe, Baja California",
    },
    description: {
      es: "Hospitalidad del huerto en Valle de Guadalupe: restaurante de degustación con estrella MICHELIN, hospedaje y café nacidos del huerto en Baja California.",
      en: "Farm hospitality in Valle de Guadalupe: MICHELIN-starred tasting restaurant, farm stay, and café born from a working garden in Baja California.",
    },
    ogImage: "/images/seo/cover.jpg",
    keywords: [
      "Olivea",
      "farm hospitality",
      "Valle de Guadalupe",
      "MICHELIN restaurant",
      "farm stay",
      "tasting menu",
    ],
  },
  hero: {
    title: {
      es: "OLIVEA",
      en: "OLIVEA",
    },
    subtitle: {
      es: "Donde el huerto es la esencia.",
      en: "Where the garden is the essence.",
    },
    ctaRestaurant: {
      es: "Visitar el Restaurante",
      en: "Visit the Restaurant",
    },
    ctaCasa: {
      es: "Hospedarse en Casa Olivea",
      en: "Stay at Casa Olivea",
    },
    image: {
      src: "/images/seo/cover.jpg",
      alt: {
        es: "OLIVEA — hospitalidad del huerto",
        en: "OLIVEA — farm hospitality",
      },
    },
  },
  video: {
    id: "hero-v2-2026",
    label: {
      es: "Video principal del huerto — Enero 2026",
      en: "Main garden hero video — January 2026",
    },
    mobile: {
      webm: "/videos/homepage-mobile.webm",
      mp4: "/videos/homepage-mobile.mp4",
      poster: "/images/hero-mobile.avif",
    },
    desktop: {
      webm: "/videos/homepage-HD.webm",
      mp4: "/videos/homepage-HD.mp4",
      poster: "/images/hero.avif",
    },
    version: "2026-01-15-v2",
    active: true,
  },
};

export default home;
