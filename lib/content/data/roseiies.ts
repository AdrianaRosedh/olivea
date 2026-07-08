// lib/content/data/roseiies.ts
// roseiies page content — static seed (used until an admin saves
// roseiies_content in Supabase; then the DB row wins).

import type { RoseiiesContent } from "../types";

const roseiies: RoseiiesContent = {
  meta: {
    title: {
      es: "roseiies — La tecnología detrás de Olivea | OLIVEA",
      en: "roseiies — The technology behind Olivea | OLIVEA",
    },
    description: {
      es: "roseiies es el estudio que da a Olivea su tecnología silenciosa: las cartas vivas, el mapa del huerto en vivo y los sistemas que permiten que un equipo pequeño sostenga una visión grande.",
      en: "roseiies is the studio behind Olivea's quiet technology — the living menus, the live garden map, and the systems that let a small team hold a large vision.",
    },
  },
  hero: {
    back: { es: "Volver a Innovación", en: "Back to Innovation" },
    eyebrow: { es: "Tecnología", en: "Technology" },
    headline: { es: "Construido con roseiies", en: "Built with roseiies" },
    intro: {
      es: "Detrás de cada carta viva, cada reservación y el mapa del huerto en tiempo real hay un estudio: roseiies. Así es como Olivea innova — con tecnología que desaparece dentro del trabajo.",
      en: "Behind every living menu, every reservation, and the real-time garden map is a studio: roseiies. This is how Olivea innovates — with technology that disappears into the work.",
    },
  },
  founder: {
    eyebrow: { es: "La fundadora", en: "The founder" },
    title: { es: "Una misma mente", en: "One mind" },
    paragraphs: [
      {
        es: "Adriana Rose fundó roseiies y dirige Olivea como su CEO. Arquitecta del ecosistema Olivea, diseña la experiencia como un sistema vivo donde concepto, tecnología y sensibilidad estética convergen.",
        en: "Adriana Rose founded roseiies and leads Olivea as its CEO. The architect of the Olivea ecosystem, she designs the experience as a living system where concept, technology, and aesthetic sensibility converge.",
      },
      {
        es: "Lo que aprende caminando el piso de Olivea — llevando los libros, abriendo el restaurante — moldea roseiies. Y lo que construye en roseiies regresa a Olivea.",
        en: "What she learns walking the floor at Olivea — keeping the books, opening the restaurant — shapes roseiies. And what she builds in roseiies returns to Olivea.",
      },
    ],
    quote: { es: "Una hace mejor a la otra.", en: "Each makes the other better." },
    image: "/images/team/adriana.jpg",
  },
  sections: [
    {
      eyebrow: { es: "El estudio", en: "The studio" },
      title: {
        es: "Un espacio de trabajo para toda la propiedad",
        en: "One workspace for the whole property",
      },
      body: [
        {
          es: "roseiies nació de una frustración simple: las herramientas para administrar un lugar como Olivea estaban dispersas, ruidosas y diseñadas para tableros — no para personas.",
          en: "roseiies began from a simple frustration: the tools to run a place like Olivea were scattered, noisy, and built for dashboards — not for people.",
        },
        {
          es: "La idea es una sola: reunir el huerto, la cocina, el comedor y el hotel bajo una misma fuente de verdad. Software calmado para un oficio inherentemente caótico.",
          en: "The idea is singular: bring the garden, the kitchen, the dining room, and the stay under one source of truth. Calm software for an inherently chaotic craft.",
        },
      ],
    },
    {
      eyebrow: { es: "En la práctica", en: "In practice" },
      title: {
        es: "Cómo Olivea funciona con roseiies",
        en: "How Olivea runs on roseiies",
      },
      body: [
        {
          es: "Lo que ves vivo en Olivea, vive en roseiies: las cartas que se actualizan solas — maridaje, vinos —, el mapa del huerto en tiempo real, y el conocimiento que permite que un equipo pequeño sostenga una visión grande.",
          en: "Everything you see live at Olivea lives on roseiies: the menus that update themselves — pairings, wine — the real-time garden map, and the knowledge that lets a small team hold a large vision.",
        },
        {
          es: "Y lo que no ves, también: la organización de tareas, el monitoreo de energía, los ciclos de retroalimentación. La capa digital viva de un ecosistema vivo.",
          en: "And what you don't see, too: scheduling, energy monitoring, feedback loops. The living digital layer of a living ecosystem.",
        },
      ],
    },
    {
      eyebrow: { es: "Principios", en: "Principles" },
      title: { es: "Tecnología silenciosa", en: "Quiet technology" },
      body: [
        {
          es: "En Olivea, la tecnología es intencionalmente silenciosa. roseiies comparte esa creencia. Innovar, aquí, es menos fricción — no más pantallas.",
          en: "At Olivea, technology is intentionally quiet. roseiies shares that belief. Innovation, here, is less friction — not more screens.",
        },
      ],
    },
  ],
  beliefs: [
    {
      es: "Las herramientas amplían la capacidad de un equipo, no la reducen.",
      en: "Tools expand a team's capacity — they don't diminish it.",
    },
    {
      es: "Diseñado para quienes operan, no para quienes miran tableros.",
      en: "Built for the people who operate, not the ones who watch dashboards.",
    },
    {
      es: "Una sola fuente de verdad para toda la propiedad.",
      en: "One source of truth for the whole property.",
    },
    {
      es: "Software calmado para un oficio inherentemente caótico.",
      en: "Calm software for an inherently chaotic craft.",
    },
  ],
  cta: {
    kicker: { es: "Hecho con", en: "Built with" },
    line: {
      es: "Conoce el estudio detrás de la capa viva de Olivea.",
      en: "Meet the studio behind Olivea's living layer.",
    },
    primary: { es: "Conoce el estudio", en: "Meet the studio" },
    secondary: { es: "Nuestra filosofía", en: "Our philosophy" },
  },
};

export default roseiies;
