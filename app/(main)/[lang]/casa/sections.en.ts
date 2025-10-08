export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CASA_EN: NavSection[] = [
  {
    id: "rooms",
    title: "Rooms",
    subs: [
      { id: "esencia",         title: "Essence" },
      { id: "detalle", title: "Comfort" },
      { id: "luz",    title: "Light" },
    ],
  },
  {
    id: "courtyard",
    title: "Courtyard",
    subs: [
      { id: "memoria",             title: "Memory" },
      { id: "estetica", title: "Balance" },
      { id: "serenidad",     title: "Serenity" },
    ],
  },
  {
    id: "design",
    title: "Design",
    subs: [
      { id: "luz",            title: "Light" },
      { id: "materiales",     title: "Materials" },
      { id: "sostenibilidad", title: "Sustainable" },
    ],
  },
  {
    id: "mornings",
    title: "Mornings",
    subs: [
      { id: "breakfast",       title: "Breakfast" },
      { id: "cafe",  title: "Coffee" },
      { id: "ritmo",          title: "Tempo" },
    ],
  },
  {
    id: "services",
    title: "Services",
    subs: [
      { id: "conectividad",    title: "Wi-Fi" },
      { id: "confort", title: "Comfort" },
      { id: "amenities",  title: "Amenities" },
      { id: "accesibilidad",   title: "Access" },
      { id: "concierge",       title: "Concierge" },
    ],
  },
];
