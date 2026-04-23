// lib/content/data/contact.ts
// Contact page content

import type { ContactContent } from "../types";

const contact: ContactContent = {
  meta: {
    title: {
      es: "Contacto | OLIVEA",
      en: "Contact | OLIVEA",
    },
    description: {
      es: "Dirección, teléfonos y datos de contacto de Olivea Farm To Table, Casa Olivea y Olivea Café en Valle de Guadalupe.",
      en: "Address, phone numbers, and contact details for Olivea Farm To Table, Casa Olivea, and Olivea Café in Valle de Guadalupe.",
    },
    ogImage: "/images/seo/seo-og.jpg",
  },
  kicker: {
    es: "Contacto",
    en: "Contact",
  },
  subtitle: {
    es: "Olivea Farm To Table • Casa Olivea • Olivea Café",
    en: "Olivea Farm To Table • Casa Olivea • Olivea Café",
  },
  actions: {
    maps: { es: "Mapa", en: "Maps" },
    email: { es: "Email", en: "Email" },
    call: { es: "Llamar", en: "Call" },
  },
  labels: {
    address: { es: "Dirección", en: "Address" },
    email: { es: "Email", en: "Email" },
  },
  sections: {
    farmToTableTitle: {
      es: "Olivea Farm To Table",
      en: "Olivea Farm To Table",
    },
    casaCafeTitle: {
      es: "Casa Olivea & Olivea Café",
      en: "Casa Olivea & Olivea Café",
    },
  },
  footerNote: {
    es: "Para eventos especiales o coordinación de grupo, escríbenos y te ayudamos a planearlo.",
    en: "For special events or group coordination, email us and we'll help you plan it.",
  },
  map: {
    iframeTitle: {
      es: "Mapa de ubicación Olivea",
      en: "Olivea Locator Map",
    },
    badgeLabel: {
      es: "Ubicación",
      en: "Location",
    },
    badgeValue: {
      es: "Valle de Guadalupe",
      en: "Valle de Guadalupe",
    },
    googleMapsCta: {
      es: "Google Maps",
      en: "Google Maps",
    },
  },
};

export default contact;
