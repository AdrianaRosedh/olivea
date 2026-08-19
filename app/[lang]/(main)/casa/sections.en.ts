// app/(main)/[lang]/casa/sections.en.ts
// IDs must match the DOM ids rendered by the casa section components
// (sub ids are shared across languages; titles are localized). Order must
// match page flow. Verified against the live DOM by e2e/dock-nav.spec.ts.
import type { NavSection } from "@/lib/sections";

export const SECTIONS_CASA_EN: NavSection[] = [
  {
    id: "rooms",
    title: "Rooms",
    subs: [
      { id: "luz", title: "Light" },
    ],
  },
  {
    id: "design",
    title: "Design",
    subs: [
      { id: "iluminacion", title: "Light" },
      { id: "materiales", title: "Materials" },
      { id: "sostenibilidad", title: "Sustainable" },
    ],
  },
  {
    id: "courtyard",
    title: "Courtyard",
    subs: [
      { id: "memoria", title: "Memory" },
      { id: "estetica_equilibrio", title: "Balance" },
      { id: "serenidad_clima", title: "Serenity" },
    ],
  },
  {
    id: "mornings",
    title: "Mornings",
    subs: [
      { id: "breakfast", title: "Breakfast" },
      { id: "cafe", title: "Coffee" },
    ],
  },
  {
    id: "practical",
    title: "Stay Info",
    subs: [
      { id: "arrival", title: "Arrival & Check-in" },
      { id: "included", title: "What’s Included" },
      { id: "access", title: "Getting Here" },
      { id: "concierge", title: "Concierge" },
    ],
  },
  {
    id: "gallery",
    title: "Gallery",
    subs: [],
  },
  {
    id: "services",
    title: "Services",
    subs: [
      { id: "conectividad", title: "Wi-Fi" },
      { id: "confort", title: "Comfort" },
      { id: "detalles-habitacion", title: "Amenities" },
      { id: "opciones-accesibles", title: "Access" },
      { id: "conserjeria", title: "Concierge" },
      { id: "conexion-local", title: "Valle Support" },
    ],
  },
  {
    id: "faq",
    title: "Before You Book",
  },
];
