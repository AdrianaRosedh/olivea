export type NavSub = { id: string; title: string };
export type NavSection = { id: string; title: string; subs?: NavSub[] };

export const SECTIONS_CAFE_ES: NavSection[] = [
  {
    id: "experiencia",
    title: "Experiencia",
    subs: [
      { id: "origen", title: "Origen" },
      { id: "grano", title: "Grano" },
      { id: "tueste", title: "Tueste" },
      { id: "agua", title: "Agua" },
      { id: "barra", title: "Barra" },
    ],
  },
  {
    id: "desayuno",
    title: "Desayuno",
    subs: [
      { id: "sazon", title: "Sazón" },
      { id: "origen", title: "Origen" },
      { id: "sustentable", title: "Sustentable" },
      { id: "manana", title: "Mañana" },
    ],
  },
  {
    id: "pan",
    title: "Pan",
    subs: [
      { id: "harinas", title: "Harinas" },
      { id: "recetas", title: "Recetas" },
      { id: "obradores", title: "Obradores" },
      { id: "rito", title: "Rito" },
    ],
  },
  {
    id: "padel",
    title: "Pádel",
    subs: [
      { id: "canchas", title: "Canchas" },
      { id: "luz", title: "Luz" },
      { id: "juego", title: "Juego" },
      { id: "vida", title: "Vida" },
    ],
  },
  {
    id: "menu",
    title: "Menú",
    subs: [
      { id: "espresso", title: "Espresso" },
      { id: "filtro", title: "Filtro" },
      { id: "te", title: "Té" },
      { id: "frio", title: "Frío" },
    ],
  },
  { id: "galeria", title: "Galería" },
  { id: "faq", title: "Preguntas" },
];
