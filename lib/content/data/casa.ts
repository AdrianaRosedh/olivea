// lib/content/data/casa.ts
// Casa Olivea page content

import type { CasaContent } from "../types";

const casa: CasaContent = {
  meta: {
    title: {
      es: "Casa OLIVEA | Hospedaje del Huerto en Valle de Guadalupe",
      en: "Casa OLIVEA | Farm Stay in Valle de Guadalupe",
    },
    description: {
      es: "Hospedaje integrado al huerto y al restaurante Olivea Farm To Table en Valle de Guadalupe, Baja California. Hospédate dentro del huerto. Donde el huerto es la esencia.",
      en: "A farm stay integrated with the garden and Olivea Farm To Table in Valle de Guadalupe, Baja California. Stay inside the farm. Where the garden is the essence.",
    },
    ogImage: "/images/seo/casa-og.jpg",
    keywords: [
      "Casa Olivea",
      "farm stay",
      "Valle de Guadalupe",
      "Ensenada",
      "farm hotel",
    ],
  },
  hero: {
    id: "casa-hero",
    page: "casa",
    headline: {
      es: "Donde el huerto es la esencia",
      en: "Where The Garden Is The Essence",
    },
    image: {
      src: "/images/casa/hero.jpg",
      alt: { es: "Casa Olivea", en: "Casa Olivea" },
    },
  },
  sections: [],  // MDX sections are loaded separately via content files
  faq: [
    {
      id: "casa-faq-1",
      page: "casa",
      question: {
        es: "¿Por qué hospedarse en Casa Olivea en Valle de Guadalupe?",
        en: "Why stay at Casa Olivea in Valle de Guadalupe?",
      },
      answer: {
        es: "Casa Olivea es un hospedaje integrado al huerto y conectado a Olivea Farm To Table, ideal para vivir la hospitalidad del huerto: hospedaje, gastronomía y naturaleza en el mismo lugar.",
        en: "Casa Olivea is a farm stay integrated with the garden and connected to Olivea Farm To Table — ideal for experiencing farm hospitality: stay, dine, and wake up inside the garden.",
      },
      sortOrder: 0,
    },
    {
      id: "casa-faq-2",
      page: "casa",
      question: {
        es: "¿Casa Olivea está en Valle de Guadalupe o Ensenada?",
        en: "Is Casa Olivea in Valle de Guadalupe or Ensenada?",
      },
      answer: {
        es: "Casa Olivea está en Valle de Guadalupe (Villa de Juárez), dentro del municipio de Ensenada, Baja California.",
        en: "Casa Olivea is located in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California.",
      },
      sortOrder: 1,
    },
    {
      id: "casa-faq-3",
      page: "casa",
      question: {
        es: "¿Puedo cenar en Olivea Farm To Table si me hospedo en Casa Olivea?",
        en: "Can I dine at Olivea Farm To Table if I stay at Casa Olivea?",
      },
      answer: {
        es: "Sí. Recomendamos reservar con anticipación. La experiencia está diseñada para disfrutar hospedaje y cena en la misma propiedad.",
        en: "Yes. We recommend booking in advance. The experience is designed for guests to enjoy dining and staying in one place.",
      },
      sortOrder: 2,
    },
    {
      id: "casa-faq-4",
      page: "casa",
      question: {
        es: "¿Qué más hay en la propiedad de Olivea?",
        en: "What else is on the Olivea property?",
      },
      answer: {
        es: "Además de Casa Olivea, la propiedad incluye Olivea Farm To Table, un restaurante con estrella MICHELIN, y Olivea Café, con café de especialidad y desayunos. Las tres experiencias comparten el huerto.",
        en: "Besides Casa Olivea, the property includes Olivea Farm To Table, a MICHELIN-starred restaurant, and Olivea Café, serving specialty coffee and breakfast. All three share the same working garden.",
      },
      sortOrder: 3,
    },
  ],
};

export default casa;
