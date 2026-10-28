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
  // Fallback for global_settings.organization — edit in Brand & Identity.
  organization: {
    "alternateName": "Familia Olivea",
    "founderId": "ange",
    "leaderIds": ["adrianarose", "danielnates"],
    "description": "Farm hospitality in Valle de Guadalupe, Baja California — MICHELIN-starred restaurant, farm stay, and café born from a working garden.",
    "telephone": "+52 646 383 6402",
    "areaServed": "Valle de Guadalupe, Ensenada, Baja California, Mexico",
    "knowsAbout": [
      "Farm hospitality",
      "Farm-to-table dining",
      "Agritourism",
      "Valle de Guadalupe wine region",
      "Baja California gastronomy",
      "Fermentation and koji",
      "In-house mushroom cultivation",
      "Bread and pastry"
    ],
    "sameAs": [
      "https://www.instagram.com/oliveafarmtotable",
      "https://www.instagram.com/oliveacafewine",
      "https://www.instagram.com/casaolivea",
      "https://www.facebook.com/oliveafarmtotable",
      "https://www.facebook.com/oliveacafe",
      "https://www.facebook.com/casaolivea",
      "https://www.youtube.com/grupoolivea",
      "https://www.tiktok.com/@familiaolivea"
    ]
  },
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
        es: "Mié–Jue 4–7 pm · Vie–Sáb 1:30–7:30 pm · Dom 1–6 pm",
        en: "Wed–Thu 4–7 pm · Fri–Sat 1:30–7:30 pm · Sun 1–6 pm",
      },
      slots: [
        { days: ["Wednesday", "Thursday"], opens: "16:00", closes: "19:00" },
        { days: ["Friday", "Saturday"], opens: "13:30", closes: "19:30" },
        { days: ["Sunday"], opens: "13:00", closes: "18:00" },
      ],
      sortOrder: 0,
    },
    {
      id: "h2",
      venue: "cafe",
      label: { es: "Olivea Café Wine Bar", en: "Olivea Café Wine Bar" },
      schedule: {
        es: "Diario 7:15 am – 4:00 pm",
        en: "Daily 7:15 am – 4:00 pm",
      },
      slots: [
        { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "07:15", closes: "16:00" },
      ],
      sortOrder: 1,
    },
    {
      id: "h3",
      venue: "casa",
      label: { es: "Casa Olivea", en: "Casa Olivea" },
      schedule: {
        es: "Recepción 7am–10pm · reserva en línea",
        en: "Reception 7am–10pm · book online",
      },
      slots: [
        { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "07:00", closes: "22:00" },
      ],
      checkinTime: "15:00",
      checkoutTime: "11:00",
      sortOrder: 2,
    },
    {
      id: "h4",
      venue: "chat",
      label: { es: "Chat", en: "Chat" },
      schedule: {
        es: "Todos los días 8:00–21:30",
        en: "Daily 8:00 am – 9:30 pm",
      },
      slots: [
        { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "08:00", closes: "21:30" },
      ],
      sortOrder: 3,
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
