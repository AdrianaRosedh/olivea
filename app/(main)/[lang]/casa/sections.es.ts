// app/(main)/[lang]/casa/sections.es.ts
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
      { id: "estetica", title: "Estética" },
      { id: "serenidad", title: "Serenidad" },
    ],
  },

  {
    id: "mananas",
    title: "Mañanas",
    subs: [
      { id: "desayuno", title: "Desayuno" },
      { id: "programa_cafe", title: "Café" },
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
