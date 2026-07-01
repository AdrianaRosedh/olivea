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
  faq: [
    {
      id: "cafe-faq-1",
      page: "cafe",
      question: {
        es: "¿Qué es Olivea Café?",
        en: "What is Olivea Café?",
      },
      answer: {
        es: "Olivea Café es la cafetería de especialidad de Olivea en Valle de Guadalupe: café de casa, pan artesanal y desayuno del huerto, junto al mismo huerto que abastece al restaurante Olivea Farm To Table. Es una de las tres experiencias de Olivea, junto con el restaurante con estrella MICHELIN y Casa Olivea, el hospedaje del huerto.",
        en: "Olivea Café is Olivea's specialty coffee house in Valle de Guadalupe: house coffee, artisan bread, and breakfast from the garden, beside the same working garden that feeds the Olivea Farm To Table restaurant. It's one of Olivea's three experiences, alongside the MICHELIN-starred restaurant and Casa Olivea, the farm stay.",
      },
      sortOrder: 0,
    },
    {
      id: "cafe-faq-2",
      page: "cafe",
      question: {
        es: "¿Olivea Café sirve desayuno?",
        en: "Does Olivea Café serve breakfast?",
      },
      answer: {
        es: "Sí. Cada mañana servimos desayuno del huerto, pan artesanal recién horneado y café de especialidad. Es un café de entrada libre; no necesitas reservación.",
        en: "Yes. Every morning we serve breakfast from the garden, freshly baked house bread, and specialty coffee. It's a walk-in café — no reservation needed.",
      },
      sortOrder: 1,
    },
    {
      id: "cafe-faq-3",
      page: "cafe",
      question: {
        es: "¿Necesito reservación para visitar Olivea Café?",
        en: "Do I need a reservation to visit Olivea Café?",
      },
      answer: {
        es: "No. Olivea Café es de entrada libre y funciona por las mañanas. La reservación solo es necesaria para el menú degustación en Olivea Farm To Table. Puedes consultar los horarios vigentes del café en la página de contacto.",
        en: "No. Olivea Café is walk-in and open in the mornings. A reservation is only needed for the tasting menu at Olivea Farm To Table. You can check the café's current hours on the contact page.",
      },
      sortOrder: 2,
    },
    {
      id: "cafe-faq-4",
      page: "cafe",
      question: {
        es: "¿Cuál es la diferencia entre Olivea Café y Olivea Farm To Table?",
        en: "What is the difference between Olivea Café and Olivea Farm To Table?",
      },
      answer: {
        es: "Olivea Café es la experiencia casual de la mañana: café de especialidad, pan y desayuno de entrada libre. Olivea Farm To Table es el restaurante con estrella MICHELIN, con un menú degustación por las tardes y bajo reservación. Ambos comparten el mismo huerto en la misma propiedad.",
        en: "Olivea Café is the casual morning experience: walk-in specialty coffee, bread, and breakfast. Olivea Farm To Table is the MICHELIN-starred restaurant, serving a tasting menu in the afternoons and by reservation. Both share the same garden on the same property.",
      },
      sortOrder: 3,
    },
    {
      id: "cafe-faq-5",
      page: "cafe",
      question: {
        es: "¿Dónde está Olivea Café?",
        en: "Where is Olivea Café located?",
      },
      answer: {
        es: "Olivea Café está en Valle de Guadalupe (Villa de Juárez), en el municipio de Ensenada, Baja California, México — en la misma propiedad que Olivea Farm To Table y Casa Olivea.",
        en: "Olivea Café is in Valle de Guadalupe (Villa de Juárez), within Ensenada, Baja California, Mexico — on the same property as Olivea Farm To Table and Casa Olivea.",
      },
      sortOrder: 4,
    },
  ],
};

export default cafe;
