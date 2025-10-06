import type { NavSection } from "./sections.es";

export const SECTIONS_EN: NavSection[] = [
  {
    id: "experiencia",
    title: "The experience",
    subs: [
      { id: "origen",     title: "Origin" },
      { id: "equilibrio", title: "Balance" },
      { id: "valores",    title: "Values" },
    ],
  },
  {
    id: "cocina",
    title: "The kitchen",
    subs: [
      { id: "equilibrio", title: "Balance" },
      { id: "estetica",          title: "Aesthetics" },
      { id: "tecnica",           title: "Technique" },
      { id: "vision",            title: "Vision" },
    ],
  },
  {
    id: "mesa",
    title: "The table",
    subs: [
      { id: "hospitalidad", title: "Hospitality" },
      { id: "atencion",     title: "Attentiveness" },
      { id: "narrativa",    title: "Narrative" },
    ],
  },
  {
    id: "despensa",
    title: "The larder",
    subs: [
      { id: "proximidad",   title: "Proximity" },
      { id: "temporada",    title: "Seasonality" },
      { id: "trazabilidad", title: "Traceability" },
    ],
  },
  {
    id: "menu",
    title: "Menu",
    subs: [
      { id: "estructura", title: "Structure" },
      { id: "maridaje",        title: "Pairing" },
      { id: "preferencias",    title: "Preferences" },
    ],
  },
];
