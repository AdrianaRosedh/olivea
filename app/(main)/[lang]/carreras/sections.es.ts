// app/(main)/[lang]/casa/sections.es.ts
export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CASA_ES: NavSection[] = [
  {
    id: "rooms",
    title: "Habitaciones",
    subs: [
      { id: "esencia", title: "Esencia" },
      { id: "detalle", title: "Comodidad" },
      { id: "luz", title: "Luz" },
    ],
  },
  {
    id: "design",
    title: "Diseño",
    subs: [
      { id: "luz", title: "Luz" },
      { id: "materiales", title: "Materiales" },
      { id: "sostenibilidad", title: "Sostenibilidad" },
    ],
  },
  {
    id: "courtyard",
    title: "Patio",
    subs: [
      { id: "memoria", title: "Memoria" },
      { id: "estetica", title: "Estética" },
      { id: "serenidad", title: "Serenidad" },
    ],
  },

  {
    id: "mornings",
    title: "Mañanas",
    subs: [
      { id: "desayuno", title: "Desayuno" },
      { id: "cafe", title: "Café" },
      { id: "ritmo", title: "Ritmo" },
    ],
  },
  {
    id: "practical",
    title: "Información Práctica",
    subs: [
      { id: "arrival", title: "Llegada" },
      { id: "included", title: "Incluye" },
      { id: "access", title: "Acceso" },
      { id: "concierge", title: "Conserjería" },
    ],
  },
  {
    id: "services",
    title: "Servicios",
    subs: [
      { id: "conectividad", title: "Conectividad" },
      { id: "confort", title: "Comodidad" },
      { id: "amenidades", title: "Amenidades" },
      { id: "accesibilidad", title: "Accesibilidad" },
      { id: "concierge", title: "Conserjería" },
      { id: "valle", title: "Conexión local" },
    ],
  },
  {
    id: "faq",
    title: "Antes de Reservar",
  },
];
