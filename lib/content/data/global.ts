// lib/content/data/global.ts
// Global settings — site-wide configuration editable from admin

import type { GlobalSettings } from "../types";

const global: GlobalSettings = {
  siteName: "OLIVEA Farm Hospitality",
  tagline: {
    es: "Donde el huerto es la esencia.",
    en: "Where the garden is the essence.",
  },
  defaultLocale: "es",
  contactInfo: {
    address: {
      es: "Carretera Tecate-Ensenada Km 83, Valle de Guadalupe, Ensenada, Baja California, México",
      en: "Carretera Tecate-Ensenada Km 83, Valle de Guadalupe, Ensenada, Baja California, Mexico",
    },
    email: "hola@oliveafarmtotable.com",
    phone: "+52 646 155 3069",
    googleMapsUrl: "https://maps.app.goo.gl/oLiVeA",
    googleMapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3374.123!2d-116.6123!3d32.0789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOlivea%20Farm%20To%20Table!5e0!3m2!1ses!2smx!4v1",
    coordinates: { lat: 32.0789, lng: -116.6123 },
  },
  hours: [
    {
      id: "h1",
      venue: "farmtotable",
      label: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
      schedule: {
        es: "Mié 5–8 · Vie 2:30–8:30 · Dom 2–7",
        en: "Wed 5–8 · Fri 2:30–8:30 · Sun 2–7",
      },
      sortOrder: 0,
    },
    {
      id: "h2",
      venue: "casa",
      label: { es: "Casa Olivea & Olivea Café", en: "Casa Olivea & Olivea Café" },
      schedule: {
        es: "Mié–Lun 7:30–2:30 · Mar 7:30–9:30",
        en: "Wed–Mon 7:30–2:30 · Tue 7:30–9:30",
      },
      sortOrder: 1,
    },
  ],
  socials: [
    { platform: "instagram", url: "https://instagram.com/oliveafarmtotable", label: "@oliveafarmtotable" },
  ],
  defaultOgImage: "/images/seo/seo-og.jpg",
  twitterHandle: "@oliveafarmtotable",
};

export default global;
