export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CASA_EN: NavSection[] = [
  {
    id: "rooms",
    title: "Rooms",
    subs: [
      { id: "esencia", title: "Essence" },
      { id: "detalle", title: "Comfort" },
      { id: "luz", title: "Light" },
    ],
  },
  {
    id: "design",
    title: "Design",
    subs: [
      { id: "luz", title: "Light" },
      { id: "materiales", title: "Materials" },
      { id: "sostenibilidad", title: "Sustainable" },
    ],
  },
  {
    id: "courtyard",
    title: "Courtyard",
    subs: [
      { id: "memoria", title: "Memory" },
      { id: "estetica", title: "Balance" },
      { id: "serenidad", title: "Serenity" },
    ],
  },
  {
    id: "mornings",
    title: "Mornings",
    subs: [
      { id: "breakfast", title: "Breakfast" },
      { id: "cafe", title: "Coffee" },
      { id: "ritmo", title: "Tempo" },
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
    id: "services",
    title: "Services",
    subs: [
      { id: "conectividad", title: "Wi-Fi" },
      { id: "confort", title: "Comfort" },
      { id: "amenities", title: "Amenities" },
      { id: "accesibilidad", title: "Access" },
      { id: "concierge", title: "Concierge" },
      { id: "valle", title: "Valle Support" },
    ],
  },
  {
    id: "faq",
    title: "Before You Book",
  },
];