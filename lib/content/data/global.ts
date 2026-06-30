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
      es: "Carretera Ensenada-Tecate Km 92.5, Villa de Juárez, Ensenada, Baja California, 22766, México",
      en: "Carretera Ensenada-Tecate Km 92.5, Villa de Juárez, Ensenada, Baja California, 22766, Mexico",
    },
    email: "hola@casaolivea.com",
    phone: "+52 646 388 2369",
    googleMapsUrl: "https://maps.app.goo.gl/c2RsfNfQom2Jg73P7",
    googleMapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3374.123!2d-116.6420781!3d31.9909261!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOlivea%20Farm%20To%20Table!5e0!3m2!1ses!2smx!4v1",
    coordinates: { lat: 31.9909261, lng: -116.6420781 },
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
      venue: "cafe",
      label: { es: "Olivea Café", en: "Olivea Café" },
      schedule: {
        es: "Mié–Lun 7:30–2:30 · Mar 7:30–9:30",
        en: "Wed–Mon 7:30–2:30 · Tue 7:30–9:30",
      },
      sortOrder: 1,
    },
    {
      id: "h3",
      venue: "casa",
      label: { es: "Casa Olivea", en: "Casa Olivea" },
      schedule: {
        es: "Abierto a diario · reserva en línea",
        en: "Open daily · book online",
      },
      sortOrder: 2,
    },
  ],
  socials: [
    { platform: "youtube",   url: "https://www.youtube.com/@GrupoOlivea",                       label: "YouTube" },
    { platform: "instagram", url: "https://instagram.com/oliveafarmtotable/",                   label: "Instagram" },
    { platform: "tiktok",    url: "https://www.tiktok.com/@familiaolivea",                      label: "TikTok" },
    { platform: "linkedin",  url: "https://www.linkedin.com/company/inmobiliaria-casa-olivea/", label: "LinkedIn" },
    { platform: "spotify",   url: "https://open.spotify.com/playlist/7gSBISusOLByXgVnoYkpf8",   label: "Spotify" },
    { platform: "pinterest", url: "https://mx.pinterest.com/familiaolivea/",                    label: "Pinterest" },
  ],
  defaultOgImage: "/images/seo/seo-og.jpg",
  twitterHandle: "@oliveafarmtotable",
};

export default global;
