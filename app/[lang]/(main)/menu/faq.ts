// app/[lang]/(main)/menu/faq.ts
//
// What people ask about the menu, answered in the site's own words.
//
// The menu page lists which menus exist and links to them, but never answers
// the questions that decide whether someone books: is it à la carte, is there
// a vegetarian option, are there pairings. Those answers already exist on the
// Farm To Table and Café pages — they just were not reachable from the page a
// search for "Olivea menu" actually lands on.
//
// Every answer below is copied from the venue FAQ in the CMS. Deliberately
// absent: price. Nothing on the site states the cost of the tasting menu, and
// inventing a number for a real restaurant is not a small error.

import type { FaqItem } from "@/components/seo/FaqJsonLd";
import type { Lang } from "@/lib/i18n";

const EN: FaqItem[] = [
  {
    q: "Is the Olivea Farm To Table menu à la carte or a tasting menu?",
    a: "The menu is served as a single tasting journey. This structure allows the kitchen to cook with precision and continuity across the season.",
  },
  {
    q: "Is there a vegetarian option?",
    a: "A vegetarian version may be available upon request, depending on the season. Share allergies and dietary restrictions with advance notice at the time of booking and the kitchen adapts thoughtfully while preserving the intent of the menu.",
  },
  {
    q: "Do you offer wine pairings?",
    a: "Yes. We offer a wine journey through Valle de Guadalupe and a non-alcoholic pairing designed through flavor science.",
  },
  {
    q: "What is the difference between the Olivea Farm To Table menu and the Olivea Café Wine Bar menu?",
    a: "Olivea Café Wine Bar is the casual morning experience: walk-in specialty coffee, bread, and breakfast. Olivea Farm To Table is the MICHELIN-starred restaurant, serving a tasting menu in the afternoons and by reservation. Both share the same garden on the same property.",
  },
  {
    q: "How often does the menu change?",
    a: "The tasting menu is seasonal — shaped by the garden and nearby producers, and guided by what the season gives.",
  },
];

const ES: FaqItem[] = [
  {
    q: "¿El menú de Olivea Farm To Table es a la carta o degustación?",
    a: "El menú se sirve como un solo recorrido degustación. Esta estructura permite cocinar con continuidad y precisión a lo largo de la temporada.",
  },
  {
    q: "¿Hay opción vegetariana?",
    a: "En algunos casos existe una versión vegetariana, según la temporada. Comparte alergias y restricciones alimentarias con aviso previo al momento de reservar y la cocina adapta con cuidado, preservando la intención del menú.",
  },
  {
    q: "¿Ofrecen maridaje de vinos?",
    a: "Sí. Ofrecemos un recorrido de vinos por el Valle y un maridaje sin alcohol diseñado con ciencia del sabor.",
  },
  {
    q: "¿Cuál es la diferencia entre el menú de Olivea Farm To Table y el de Olivea Café Wine Bar?",
    a: "Olivea Café Wine Bar es la experiencia casual de la mañana: café de especialidad, pan y desayuno de entrada libre. Olivea Farm To Table es el restaurante con estrella MICHELIN, con un menú degustación por las tardes y bajo reservación. Ambos comparten el mismo huerto en la misma propiedad.",
  },
  {
    q: "¿Cada cuánto cambia el menú?",
    a: "El menú degustación es de temporada — moldeado por el huerto y por productores cercanos, y guiado por lo que da la temporada.",
  },
];

export function menuFaq(lang: Lang): FaqItem[] {
  return lang === "en" ? EN : ES;
}
