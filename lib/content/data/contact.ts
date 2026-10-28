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
    phone: { es: "Teléfono", en: "Phone" },
    hours: { es: "Horario", en: "Hours" },
    events: { es: "Eventos especiales", en: "Special events" },
    faqHeading: { es: "Preguntas frecuentes", en: "Common questions" },
  },
  // Fallback for contact_content.faq — edit in /admin → Contact.
  faq: [
    {
      "id": "faq_8e2d4baee87e",
      "q": {
        "en": "What are Olivea's opening hours?",
        "es": "¿Cuáles son los horarios de Olivea?"
      },
      "a": {
        "en": "Each experience keeps its own hours. {hours} Olivea Farm To Table is by reservation only.",
        "es": "Cada experiencia tiene su propio horario. {hours} Olivea Farm To Table es solo con reservación."
      }
    },
    {
      "id": "faq_3e84b226913b",
      "q": {
        "en": "Where is Olivea located?",
        "es": "¿Dónde está Olivea?"
      },
      "a": {
        "en": "Olivea is in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California, Mexico: {address}. Olivea Farm To Table, Casa Olivea, and Olivea Café Wine Bar share one property and one garden.",
        "es": "Olivea está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California, México: {address}. Olivea Farm To Table, Casa Olivea y Olivea Café Wine Bar comparten la misma propiedad y el mismo huerto."
      }
    },
    {
      "id": "faq_75c2faf65d3b",
      "q": {
        "en": "Is Olivea in Valle de Guadalupe or Ensenada?",
        "es": "¿Olivea está en Valle de Guadalupe o en Ensenada?"
      },
      "a": {
        "en": "Both: Olivea is in Valle de Guadalupe (Villa de Juárez), which sits within Ensenada, Baja California.",
        "es": "Ambos: Olivea está en Valle de Guadalupe (Villa de Juárez), que forma parte del municipio de Ensenada, Baja California."
      }
    },
    {
      "id": "faq_fd829a5be27c",
      "q": {
        "en": "How do I contact Olivea?",
        "es": "¿Cómo contacto a Olivea?"
      },
      "a": {
        "en": "Write to {email} or call {phone}. Olivea Farm To Table has its own direct line: {restaurantPhone}.",
        "es": "Escríbenos a {email} o llama al {phone}. Olivea Farm To Table tiene línea directa: {restaurantPhone}."
      }
    }
  ],
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
