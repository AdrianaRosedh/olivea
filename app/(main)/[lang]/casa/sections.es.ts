// app/(main)/[lang]/casa/sections.es.ts
export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CASA_ES: NavSection[] = [
  {
    id: "habitaciones",
    title: "Habitaciones",
    subs: [
      { id: "esencia",         title: "Esencia" },
      { id: "detalle", title: "Confort" },
      { id: "luz",    title: "Luz" },
    ],
  },
  {
    id: "patio",
    title: "Patio",
    subs: [
      { id: "memoria",             title: "Memoria" },
      { id: "estetica_equilibrio", title: "Estética" },
      { id: "serenidad_clima",     title: "Serenidad" },
    ],
  },
  {
    id: "diseno",
    title: "Diseño",
    subs: [
      { id: "luz",            title: "Luz" },
      { id: "acustica",       title: "Acústica" },
      { id: "materiales",     title: "Materiales" },
      { id: "sostenibilidad", title: "Sustentable" },
    ],
  },
  {
    id: "mananas",
    title: "Mañanas",
    subs: [
      { id: "desayuno",       title: "Desayuno" },
      { id: "programa_cafe",  title: "Café" },
      { id: "ritmo",          title: "Ritmo" },
    ],
  },
  {
    id: "servicios",
    title: "Servicios",
    subs: [
      { id: "conectividad",    title: "Wi-Fi" },
      { id: "confort_termico", title: "Confort" },
      { id: "agua_amenities",  title: "Amenidades" },
      { id: "accesibilidad",   title: "Acceso" },
      { id: "concierge",       title: "Concierge" },
    ],
  },
];