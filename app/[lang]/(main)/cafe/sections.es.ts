// IDs must match the DOM ids rendered by the cafe section components.
// Order must match page flow. Verified by e2e/dock-nav.spec.ts.
import type { NavSection } from "@/lib/sections";

export const SECTIONS_CAFE_ES: NavSection[] = [
  {
    id: "experiencia",
    title: "Experiencia",
    subs: [
      { id: "origin", title: "Origen" },
      { id: "grano", title: "Grano" },
      { id: "tueste", title: "Tueste" },
      { id: "agua", title: "Agua" },
      { id: "barra", title: "Barra" },
    ],
  },
  {
    id: "desayuno",
    title: "Desayuno",
    subs: [
      { id: "sazon", title: "Sazón" },
      { id: "origen", title: "Origen" },
      { id: "sustentable", title: "Sustentable" },
      { id: "manana", title: "Mañana" },
    ],
  },
  {
    id: "pan",
    title: "Pan",
    subs: [
      { id: "harinas", title: "Harinas" },
      { id: "recetas", title: "Recetas" },
      { id: "obradores", title: "Obradores" },
      { id: "rito", title: "Rito" },
    ],
  },
  {
    id: "padel",
    title: "Pádel",
    subs: [
      { id: "canchas", title: "Canchas" },
      { id: "luz", title: "Luz" },
      { id: "juego", title: "Juego" },
      { id: "vida", title: "Vida" },
    ],
  },
  {
    id: "gallery",
    title: "Galería",
    subs: [],
  },
  {
    id: "menu",
    title: "Menú",
    subs: [
      { id: "espresso", title: "Espresso" },
      { id: "filter", title: "Filtro" },
      { id: "tea", title: "Té" },
      { id: "cold", title: "Frío" },
    ],
  },
  { id: "faq", title: "Preguntas" },
];
