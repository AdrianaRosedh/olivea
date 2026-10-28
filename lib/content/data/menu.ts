// lib/content/data/menu.ts
// Fallback for public.menu_content (the /menu page's title, description and
// FAQ), used only if Supabase is unreachable. Edit this content in /admin.

import type { MenuContent } from "../types";

const menu: MenuContent = {
  meta: {
    "title": {
      "en": "Menu | OLIVEA",
      "es": "Menú | OLIVEA"
    },
    "description": {
      "en": "Seasonal menu for Olivea Farm To Table and Olivea Café Wine Bar — garden-rooted cuisine in Valle de Guadalupe.",
      "es": "Menú de temporada de Olivea Farm To Table y Olivea Café Wine Bar — cocina arraigada al huerto en Valle de Guadalupe."
    }
  },
  faq: [
    {
      "id": "faq_3463d995ee35",
      "q": {
        "en": "Is the Olivea Farm To Table menu à la carte or a tasting menu?",
        "es": "¿El menú de Olivea Farm To Table es a la carta o degustación?"
      },
      "a": {
        "en": "It is a holistic menu, served as a single journey: the flavors, the music and the dance between them. This structure allows the kitchen to cook with precision and continuity across the season.",
        "es": "Es un menú holístico, servido como un solo recorrido: los sabores, la música y la danza entre ellos. Esta estructura permite cocinar con continuidad y precisión a lo largo de la temporada."
      }
    },
    {
      "id": "faq_bddcdd3710ff",
      "q": {
        "en": "Is there a vegetarian option?",
        "es": "¿Hay opción vegetariana?"
      },
      "a": {
        "en": "A vegetarian version may be available upon request, depending on the season. Share allergies and dietary restrictions with advance notice at the time of booking and the kitchen adapts thoughtfully while preserving the intent of the menu.",
        "es": "En algunos casos existe una versión vegetariana, según la temporada. Comparte alergias y restricciones alimentarias con aviso previo al momento de reservar y la cocina adapta con cuidado, preservando la intención del menú."
      }
    },
    {
      "id": "faq_00dd98f86aa1",
      "q": {
        "en": "Do you offer wine pairings?",
        "es": "¿Ofrecen maridaje de vinos?"
      },
      "a": {
        "en": "Yes, two: the Premium Pairing, with wines from Valle de Guadalupe and selected international labels, and the Garden Pairing, alcohol-free, created by our team with garden ingredients and flavor science.",
        "es": "Sí, dos: el Maridaje Premium, con vinos del Valle de Guadalupe y etiquetas internacionales seleccionadas, y el Maridaje del Huerto, sin alcohol, creado por nuestro equipo con ingredientes del huerto y ciencia del sabor."
      }
    },
    {
      "id": "faq_759b37f872a3",
      "q": {
        "en": "What is the difference between the Olivea Farm To Table menu and the Olivea Café Wine Bar menu?",
        "es": "¿Cuál es la diferencia entre el menú de Olivea Farm To Table y el de Olivea Café Wine Bar?"
      },
      "a": {
        "en": "Olivea Café Wine Bar is the casual morning experience: walk-in specialty coffee, bread, and breakfast. Olivea Farm To Table is the MICHELIN-starred restaurant, serving a holistic menu in the afternoons and by reservation. Both share the same garden on the same property.",
        "es": "Olivea Café Wine Bar es la experiencia casual de la mañana: café de especialidad, pan y desayuno de entrada libre. Olivea Farm To Table es el restaurante con estrella MICHELIN, con un menú holístico por las tardes y bajo reservación. Ambos comparten el mismo huerto en la misma propiedad."
      }
    },
    {
      "id": "faq_4d33880c7201",
      "q": {
        "en": "How often does the menu change?",
        "es": "¿Cada cuánto cambia el menú?"
      },
      "a": {
        "en": "The holistic menu is seasonal — shaped by the garden and nearby producers, and guided by what the season gives.",
        "es": "El menú holístico es de temporada — moldeado por el huerto y por productores cercanos, y guiado por lo que da la temporada."
      }
    }
  ],
};

export default menu;
