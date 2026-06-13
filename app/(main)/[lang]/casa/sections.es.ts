// app/(main)/[lang]/casa/sections.es.ts
// IDs must match the DOM ids rendered by the casa section components
// (sub ids are shared across languages; titles are localized). Order must
// match page flow. Verified against the live DOM by e2e/dock-nav.spec.ts.
import type { NavSection } from "@/lib/sections";

export const SECTIONS_CASA_ES: NavSection[] = [
  {
    id: "habitaciones",
    title: "Habitaciones",
    subs: [
      { id: "luz", title: "Luz" },
    ],
  },
  {
    id: "diseno",
    title: "Diseño",
    subs: [
      { id: "iluminacion", title: "Luz" },
      { id: "materiales", title: "Materiales" },
      { id: "sostenibilidad", title: "Sostenibilidad" },
    ],
  },
  {
    id: "patio",
    title: "Patio",
    subs: [
      { id: "memoria", title: "Memoria" },
      { id: "estetica_equilibrio", title: "Estética" },
      { id: "serenidad_clima", title: "Serenidad" },
    ],
  },
  {
    id: "mananas",
    title: "Mañanas",
    subs: [
      { id: "breakfast", title: "Desayuno" },
      { id: "cafe", title: "Café" },
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
    id: "gallery",
    title: "Galería",
    subs: [],
  },
  {
    id: "servicios",
    title: "Servicios",
    subs: [
      { id: "conectividad", title: "Conectividad" },
      { id: "confort", title: "Comodidad" },
      { id: "detalles-habitacion", title: "Amenidades" },
      { id: "opciones-accesibles", title: "Accesibilidad" },
      { id: "conserjeria", title: "Conserjería" },
      { id: "conexion-local", title: "Conexión local" },
    ],
  },
  {
    id: "faq",
    title: "Antes de Reservar",
  },
];
