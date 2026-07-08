// lib/content/data/innovation.ts
// Innovation page content — static seed (used until an admin saves
// innovation_content in Supabase; then the DB row wins).

import type { InnovationContent } from "../types";

const innovation: InnovationContent = {
  meta: {
    title: {
      es: "Innovación — Cómo innova Olivea | OLIVEA",
      en: "Innovation — How Olivea innovates | OLIVEA",
    },
    description: {
      es: "En Olivea la innovación es donde el arte se encuentra con la tecnología: el laboratorio donde fermentamos, curamos y creamos, y roseiies que se encarga de lo técnico para que el oficio conserve su tiempo.",
      en: "At Olivea, innovation is where art meets technology — the laboratory where we ferment, cure, and create, and roseiies handling the techy admin so the craft keeps its time.",
    },
  },
  hero: {
    eyebrow: { es: "Innovación", en: "Innovation" },
    headline: {
      es: "Donde el arte encuentra la tecnología",
      en: "Where art meets technology",
    },
    intro: {
      es: "Nada de esto es decoración. El trabajo detrás del plato se sostiene con el mismo rigor que el plato mismo — el oficio sigue siendo humano, la tecnología permanece en silencio, y cada uno protege el tiempo del otro.",
      en: "None of this is decoration. The work behind the plate is held to the same standard as the plate itself — the craft kept human, the technology kept quiet, each protecting the other's time.",
    },
  },
  craft: {
    eyebrow: { es: "El oficio", en: "The craft" },
    title: { es: "El laboratorio", en: "The laboratory" },
    intro: {
      es: "Todo aquí se hace, no se compra — y nada se hace a la ligera.",
      en: "Everything here is made, not bought — and nothing is made casually.",
    },
    items: [
      {
        title: { es: "Salsa de soya", en: "Soy sauce" },
        line: {
          es: "Fermentada en casa durante meses. Hace años que no compramos una botella.",
          en: "Fermented in-house over months. We haven't bought a bottle in years.",
        },
      },
      {
        title: { es: "Curados y preservados", en: "Aged & preserved" },
        line: {
          es: "La cosecha detenida en su punto, para que la temporada nunca termine.",
          en: "The harvest held at its peak, so the season never fully ends.",
        },
      },
      {
        title: { es: "La carta líquida", en: "The liquid menu" },
        line: {
          es: "Compuesta con el mismo rigor que el plato.",
          en: "Composed with the same rigor as the plate.",
        },
      },
      {
        title: { es: "Fermentación", en: "Fermentation" },
        line: {
          es: "Una investigación constante: registrada, probada, corregida.",
          en: "An ongoing investigation: logged, tasted, corrected.",
        },
      },
      {
        title: { es: "La tierra", en: "The land" },
        line: {
          es: "Recorrida a diario. No se toma nada que no se comprenda.",
          en: "Walked daily. Nothing is taken that isn't understood.",
        },
      },
    ],
  },
  technology: {
    eyebrow: { es: "La tecnología", en: "The technology" },
    intro: {
      es: "Junto al laboratorio, invisible, el estudio que absorbe el trabajo que ningún oficio debería cargar.",
      en: "Beside the laboratory, unseen, the studio that absorbs the work no craft should carry.",
    },
    items: [
      { es: "Agendas y los libros", en: "Scheduling & the books" },
      { es: "Inventario y abasto", en: "Inventory & supply" },
      { es: "Reservaciones", en: "Reservations" },
      { es: "La carta viva, sincronizada", en: "The living menu, in sync" },
    ],
  },
  quote: { es: "Ninguno se apodera del otro.", en: "Neither takes over the other." },
  method: {
    eyebrow: { es: "El método", en: "The method" },
    lead: {
      es: "roseiies absorbe la fricción — y el laboratorio conserva lo único de lo que un oficio no puede prescindir: tiempo, y atención sin reservas.",
      en: "roseiies absorbs the friction — and the laboratory keeps the one thing a craft cannot do without: time, and undivided attention.",
    },
    body: {
      es: "Lo que la cocina aprende, la tecnología lo recuerda. Lo que la tecnología resuelve, la cocina nunca tiene que cargarlo.",
      en: "What the kitchen learns, the technology remembers. What the technology handles, the kitchen never has to.",
    },
  },
  closing: {
    line: {
      es: "El mismo rigor recorre toda la propiedad.",
      en: "The same standard runs through the whole property.",
    },
  },
};

export default innovation;
