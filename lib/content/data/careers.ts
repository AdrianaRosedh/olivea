// lib/content/data/careers.ts
// Careers page — currently the most hardcoded page on the site

import type { CareersContent } from "../types";

const careers: CareersContent = {
  meta: {
    title: {
      es: "Carreras | OLIVEA",
      en: "Careers | OLIVEA",
    },
    description: {
      es: "Únete al equipo de Olivea en Valle de Guadalupe — hospitalidad, cocina de autor, huerto y café. Envía tu aplicación y crece con nosotros.",
      en: "Join the Olivea team in Valle de Guadalupe — hospitality, farm-to-table cuisine, garden, and café. Send your application and grow with us.",
    },
    ogImage: "/images/seo/seo-og.jpg",
  },
  hero: {
    kicker: {
      es: "Trabaja con nosotros",
      en: "Careers",
    },
    headline: {
      es: "Carreras en Olivea",
      en: "Careers at Olivea",
    },
    description: {
      es: "Olivea es un ecosistema: restaurante, hotel y café — guiados por el huerto. Buscamos personas con técnica, humildad y ritmo. No es \"solo un trabajo\". Es oficio.",
      en: "Olivea is an ecosystem: restaurant, hotel, and café — led by the garden. We look for people with technique, humility, and rhythm. Not \"just a job.\" A craft.",
    },
    image: {
      src: "/images/journal/seasonal-garden.avif",
      alt: {
        es: "Olivea — oficio del huerto",
        en: "Olivea — garden craft",
      },
    },
    signals: [
      {
        label: { es: "Ritmo", en: "Rhythm" },
        text: { es: "Calma con precisión.", en: "Calm with precision." },
      },
      {
        label: { es: "Oficio", en: "Craft" },
        text: { es: "Técnica visible en detalles.", en: "Technique in the details." },
      },
      {
        label: { es: "Origen", en: "Origin" },
        text: { es: "El huerto guía decisiones.", en: "The garden guides decisions." },
      },
    ],
  },
  standards: {
    title: {
      es: "El estándar Olivea",
      en: "The Olivea standard",
    },
    items: [
      {
        es: "Puntualidad, preparación y manos limpias.",
        en: "Punctuality, readiness, clean hands.",
      },
      {
        es: "Orden, lenguaje profesional y calma.",
        en: "Order, professional language, calm.",
      },
      {
        es: "Capacidad de recibir feedback y mejorar.",
        en: "Able to take feedback and improve.",
      },
    ],
  },
  hiringSteps: [
    { es: "Revisión (3–7 días)", en: "Review (3–7 days)" },
    { es: "Llamada (15 min)", en: "Short call (15 min)" },
    { es: "Prueba / stage", en: "Trial / stage" },
  ],
  principlesTitle: {
    es: "Cómo se ve la excelencia aquí",
    en: "What excellence looks like here",
  },
  principles: [
    {
      title: { es: "El huerto manda", en: "The garden leads" },
      description: {
        es: "Trabajamos con estación y origen — no con ego.",
        en: "We work with season and origin — not ego.",
      },
    },
    {
      title: { es: "Técnica silenciosa", en: "Quiet technique" },
      description: {
        es: "La excelencia se siente en el ritmo, la limpieza y el detalle.",
        en: "Excellence shows in rhythm, cleanliness, and detail.",
      },
    },
    {
      title: { es: "Ritmo completo", en: "Full rhythm" },
      description: {
        es: "Servicio coreografiado, comunicación limpia, cero caos.",
        en: "Choreographed service, clean communication, zero chaos.",
      },
    },
    {
      title: { es: "Cuidado real", en: "Real care" },
      description: {
        es: "Del huésped, del equipo y del lugar — con respeto.",
        en: "For guests, team, and place — with respect.",
      },
    },
    {
      title: { es: "Curiosidad disciplinada", en: "Disciplined curiosity" },
      description: {
        es: "Aprender es parte del rol. Mejorar es parte del día.",
        en: "Learning is part of the role. Improving is part of the day.",
      },
    },
    {
      title: { es: "Coherencia", en: "Coherence" },
      description: {
        es: "Cada detalle suma: lenguaje, postura, tiempos, manos, herramientas.",
        en: "Every detail matters: language, posture, timing, hands, tools.",
      },
    },
  ],
  tracksTitle: {
    es: "Áreas",
    en: "Tracks",
  },
  tracks: [
    {
      title: { es: "FOH / Servicio", en: "FOH / Service" },
      description: {
        es: "Hospitalidad con precisión: narrativa, timing, mesa impecable.",
        en: "Hospitality with precision: narrative, timing, immaculate table.",
      },
      chips: ["Host", "Mesero/a", "Captain", "Bar", "Sommelier"],
    },
    {
      title: { es: "BOH / Cocina", en: "BOH / Kitchen" },
      description: {
        es: "Técnica, limpieza, consistencia. El plato como tributo al huerto.",
        en: "Technique, cleanliness, consistency. A plate as tribute to the garden.",
      },
      chips: ["Línea", "Prep", "Pastry", "Expeditor"],
    },
    {
      title: { es: "Huerto / Grounds", en: "Garden / Grounds" },
      description: {
        es: "Cuidado diario del origen: riego, cosecha, compost, orden.",
        en: "Daily care of origin: irrigation, harvest, compost, order.",
      },
      chips: ["Riego", "Cosecha", "Compost", "Mantenimiento"],
    },
    {
      title: { es: "Hotel / Casa Olivea", en: "Hotel / Casa Olivea" },
      description: {
        es: "Calma y detalle: recepción, housekeeping, experiencia completa.",
        en: "Calm and detail: reception, housekeeping, full experience.",
      },
      chips: ["Front Desk", "Housekeeping", "Concierge"],
    },
    {
      title: { es: "Café / Padel", en: "Café / Padel" },
      description: {
        es: "Claridad y ritmo: café, desayunos, tardes ligeras y servicio ágil.",
        en: "Clarity and rhythm: coffee, breakfasts, light afternoons, agile service.",
      },
      chips: ["Barista", "Cocina", "Piso"],
    },
    {
      title: { es: "Operaciones", en: "Operations" },
      description: {
        es: "Sistemas, soporte, orden: compras, admin, mantenimiento.",
        en: "Systems, support, order: purchasing, admin, maintenance.",
      },
      chips: ["Compras", "Admin", "Mantenimiento", "Logística"],
    },
  ],
  openings: {
    title: { es: "Vacantes", en: "Openings" },
    openApplication: {
      label: { es: "Aplicación abierta", en: "Open application" },
      description: {
        es: "Si tu perfil encaja con nuestros estándares, queremos conocerte — incluso si hoy no hay una vacante publicada. Preferimos construir un banco de talento real.",
        en: "If your profile matches our standards, we want to meet you — even if there isn't a posted opening today. We prefer building a real talent bench.",
      },
      ctaLabel: { es: "Aplicar", en: "Apply" },
      responseTime: {
        es: "Respuesta típica: 3–7 días.",
        en: "Typical response: 3–7 days.",
      },
    },
    qualifications: {
      title: { es: "Qué buscamos", en: "What we look for" },
      items: [
        { es: "Humildad + disciplina.", en: "Humility + discipline." },
        { es: "Buen ritmo bajo presión.", en: "Good rhythm under pressure." },
        { es: "Amor por el detalle.", en: "Love for detail." },
      ],
    },
  },
  application: {
    title: { es: "Aplicación", en: "Application" },
    description: {
      es: "Leemos cada aplicación con intención. Si tu ritmo encaja con Olivea, te contactamos para una llamada corta.",
      en: "We read every application with intention. If your rhythm matches Olivea, we'll reach out for a short call.",
    },
    tip: {
      label: { es: "Consejo", en: "Tip" },
      text: {
        es: "Responde las 3 preguntas con honestidad. No buscamos \"perfección\", buscamos criterio, calma y disciplina.",
        en: "Answer the 3 questions honestly. We're not looking for \"perfection\" — we're looking for judgment, calm, and discipline.",
      },
    },
  },
};

export default careers;
