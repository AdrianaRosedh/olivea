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
      es: "Dirección, teléfonos y datos de contacto de Olivea Farm To Table, Casa Olivea y Olivea Café Wine Bar en Valle de Guadalupe.",
      en: "Address, phone numbers, and contact details for Olivea Farm To Table, Casa Olivea, and Olivea Café Wine Bar in Valle de Guadalupe.",
    },
    ogImage: "/images/seo/seo-og.jpg",
  },
  kicker: {
    es: "Contacto",
    en: "Contact",
  },
  subtitle: {
    es: "Olivea Farm To Table • Casa Olivea • Olivea Café Wine Bar",
    en: "Olivea Farm To Table • Casa Olivea • Olivea Café Wine Bar",
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
    cafeTitle: {
      es: "Olivea Café Wine Bar",
      en: "Olivea Café Wine Bar",
    },
    casaTitle: {
      es: "Casa Olivea",
      en: "Casa Olivea",
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
