export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CASA_EN: NavSection[] = [
  {
    id: "habitaciones",
    title: "Rooms",
    subs: [
      { id: "esencia",         title: "Essence" },
      { id: "confort_detalle", title: "Comfort" },
      { id: "amplitud_luz",    title: "Light" },
      { id: "paz_silencio",    title: "Quiet" },
    ],
  },
  {
    id: "patio",
    title: "Courtyard",
    subs: [
      { id: "memoria",             title: "Memory" },
      { id: "estetica_equilibrio", title: "Balance" },
      { id: "serenidad_clima",     title: "Serenity" },
    ],
  },
  {
    id: "diseno",
    title: "Design",
    subs: [
      { id: "luz",            title: "Light" },
      { id: "acustica",       title: "Acoustics" },
      { id: "materiales",     title: "Materials" },
      { id: "sostenibilidad", title: "Sustainable" },
    ],
  },
  {
    id: "mananas",
    title: "Mornings",
    subs: [
      { id: "desayuno",       title: "Breakfast" },
      { id: "programa_cafe",  title: "Coffee" },
      { id: "ritmo",          title: "Tempo" },
    ],
  },
  {
    id: "servicios",
    title: "Services",
    subs: [
      { id: "conectividad",    title: "Wi-Fi" },
      { id: "confort_termico", title: "Comfort" },
      { id: "agua_amenities",  title: "Amenities" },
      { id: "accesibilidad",   title: "Access" },
      { id: "concierge",       title: "Concierge" },
    ],
  },
];
