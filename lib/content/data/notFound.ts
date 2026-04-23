// lib/content/data/notFound.ts

import type { NotFoundContent } from "../types";

const notFound: NotFoundContent = {
  meta: {
    title: {
      es: "Página no encontrada | OLIVEA",
      en: "Page not found | OLIVEA",
    },
    description: {
      es: "La página que buscas no existe. Vuelve al inicio de OLIVEA.",
      en: "The page you're looking for doesn't exist. Return to OLIVEA home.",
    },
    ogImage: "/images/seo/default-og.jpg",
  },
  message: {
    es: "La página que buscas no existe.",
    en: "The page you're looking for doesn't exist.",
  },
  cta: {
    es: "Volver al Inicio",
    en: "Return Home",
  },
};

export default notFound;
