export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_ES: NavSection[] = [
  {
    id: "experiencia",
    title: "La experiencia",
    subs: [
      { id: "origen",      title: "Origen" },
      { id: "equilibrio",  title: "Equilibrio" },
      { id: "valores",     title: "Valores" },
    ],
  },
  {
    id: "cocina",
    title: "La cocina",
    subs: [
      { id: "equilibrio", title: "Equilibrio" },
      { id: "estetica",          title: "Estética" },
      { id: "tecnica",           title: "Técnica" },
      { id: "vision",            title: "Visión" },
    ],
  },
  {
    id: "mesa",
    title: "La mesa",
    subs: [
      { id: "hospitalidad", title: "Hospitalidad" },
      { id: "atencion",     title: "Atención" },
      { id: "narrativa",    title: "Narrativa" },
    ],
  },
  {
    id: "despensa",
    title: "La despensa",
    subs: [
      { id: "proximidad",   title: "Proximidad" },
      { id: "temporada",    title: "Temporada" },
      { id: "trazabilidad", title: "Trazabilidad" },
    ],
  },
  {
    id: "menu",
    title: "Menú",
    subs: [
      { id: "estructura", title: "Estructura" },
      { id: "maridaje",        title: "Maridaje" },
      { id: "preferencias",    title: "Preferencias" },
    ],
  },
];
