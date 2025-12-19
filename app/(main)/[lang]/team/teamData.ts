/* =========================================================
   Olivea — Team Data (Single Source of Truth)
   Used by:
   - Team grid
   - Profile modal
   - Personal linktree pages (/[lang]/team/[id])
   - Short URLs (/[lang]/[slug])
========================================================= */

export type Lang = "es" | "en";

/* ---------- Shared helpers ---------- */

export type I18nText = {
  es: string;
  en: string;
};

/* ---------- Linktree button type ---------- */

export type TeamLink = {
  label: I18nText;
  href: string;
  icon?:
    | "instagram"
    | "whatsapp"
    | "tock"
    | "hotel"
    | "email"
    | "link"
    | "calendar";
  highlight?: boolean;
};

/* ---------- Team member profile ---------- */

export type LeaderProfile = {
  id: string; // slug → /[lang]/[id]
  name: string;

  role: I18nText;
  org?: I18nText;
  tag?: I18nText;

  bio?: I18nText;

  avatar?: string;
  gallery?: string[];

  /** Grid layout priority (lower = first) */
  priority?: number;

  /** Grid tile size */
  tile?: "hero" | "md";

  /** Linktree-style buttons */
  links: TeamLink[];
};

/* =========================================================
   TEAM (11 members)
========================================================= */

export const TEAM: LeaderProfile[] = [
  {
    id: "ange",
    name: "Ange Joy",
    role: { es: "Fundadora · Co-Owner", en: "Founder · Co-Owner" },
    org: { es: "Olivea The Experience", en: "Olivea The Experience" },
    tag: { es: "Fundación", en: "Founding" },
    bio: {
      es: "Co-crea la visión integral de Olivea: diseño, sensibilidad y coherencia estética en toda la experiencia.",
      en: "Co-shapes Olivea’s holistic vision: design, sensibility, and visual cohesion across the full experience.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "hero",
    priority: 1,
    links: [
      { label: { es: "Reservar en Olivea", en: "Reserve at Olivea" }, href: "/reservar", highlight: true },
      { label: { es: "Instagram Olivea", en: "Olivea Instagram" }, href: "https://www.instagram.com/oliveafarmtotable", icon: "instagram" },
    ],
  },

  {
    id: "daniel",
    name: "Daniel",
    role: { es: "Chef Ejecutivo · Co-Owner", en: "Executive Chef · Co-Owner" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Cocina", en: "Culinary" },
    bio: {
      es: "Lidera la cocina con enfoque huerto-primero: técnica, estacionalidad y precisión.",
      en: "Leads the kitchen with a garden-first philosophy: technique, seasonality, and precision.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "hero",
    priority: 2,
    links: [
      { label: { es: "Menú actual", en: "Current Menu" }, href: "/restaurant", highlight: true },
      { label: { es: "Reservar mesa", en: "Reserve a Table" }, href: "/reservar", icon: "tock" },
    ],
  },

  {
    id: "adrianarose",
    name: "Adriana Rose",
    role: {
      es: "CEO · Dueña · Tecnología y Visión",
      en: "CEO · Owner ·Technology & Vision",
    },
    org: { es: "Olivea The Experience", en: "Olivea The Experience" },
    bio: {
      es: "Lidera la visión estratégica, tecnológica y de experiencia de Olivea. Fundadora de Roseiies, una plataforma de inteligencia aplicada para hospitalidad y experiencias.",
      en: "Leads the strategic, technological, and experiential vision of Olivea. Founder of Roseiies, an intelligence-driven platform for hospitality and experiential brands.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "hero",
    priority: 3,
    links: [
      // ⭐ PRIMARY LINK — startup
      {
        href: "https://roseiies.com",
        label: {
          es: "Roseiies — Hospitality Intelligence",
          en: "Roseiies — Hospitality Intelligence",
        },
        highlight: true,
      },
      {
    href: "https://oliveafarmtotable.com",
      label: {
        es: "Olivea La Experiencia",
        en: "Olivea The Experience",
      },
      highlight: true,
    },
      // Social
      {
        href: "https://www.linkedin.com/in/adrianarosediaz/",
        label: {
          es: "LinkedIn",
          en: "LinkedIn",
        },
      },
      {
        href: "https://www.instagram.com/arosedh",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
      {
        href: "https://www.tiktok.com/@_adriana.rose",
        label: {
          es: "TikTok",
          en: "TikTok",
        },
      },
    ],
  },

  {
    id: "cristina",
    name: "Cristina",
    role: { es: "Head of HR", en: "Head of HR" },
    org: { es: "Olivea", en: "Olivea" },
    tag: { es: "People", en: "People" },
    bio: {
      es: "Cultura, estructura y crecimiento del equipo.",
      en: "Culture, structure, and team growth.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 9,
    links: [
      { label: { es: "Trabaja con nosotros", en: "Careers" }, href: "/careers", highlight: true },
    ],
  },

  {
    id: "leo",
    name: "Leo",
    role: { es: "Head of Hotel", en: "Head of Hotel" },
    org: { es: "Casa Olivea", en: "Casa Olivea" },
    tag: { es: "Hotel", en: "Hotel" },
    bio: {
      es: "Responsable de la operación hotelera y consistencia de servicio.",
      en: "Oversees hotel operations and service consistency.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 10,
    links: [
      { label: { es: "Reservar habitación", en: "Book a Room" }, href: "/casa", icon: "hotel", highlight: true },
    ],
  },

  {
    id: "maro",
    name: "Maro",
    role: { es: "Encargado del Huerto", en: "Head of Garden" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Huerto", en: "Garden" },
    bio: {
      es: "Cuida, investiga y cultiva el huerto que da origen a cada plato.",
      en: "Cares for, researches, and cultivates the garden behind every dish.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 12,
    links: [
      { label: { es: "El Huerto", en: "The Garden" }, href: "/restaurant", highlight: true },
    ],
  },

  {
    id: "onan",
    name: "Onan",
    role: { es: "Sous Chef", en: "Sous Chef" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Cocina", en: "Kitchen" },
    bio: {
      es: "Ejecución diaria, consistencia y mejora continua.",
      en: "Daily execution, consistency, and continuous improvement.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 13,
    links: [
      { label: { es: "Reservar mesa", en: "Reserve a Table" }, href: "/reservar", highlight: true },
    ],
  },

  {
    id: "luis",
    name: "Luis",
    role: { es: "Head de Investigación", en: "Head of Research" },
    org: { es: "Olivea", en: "Olivea" },
    tag: { es: "I+D", en: "R&D" },
    bio: {
      es: "Investigación culinaria, eficiencia y reducción de desperdicio.",
      en: "Culinary research, efficiency, and waste reduction.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 14,
    links: [
      { label: { es: "Investigación Olivea", en: "Olivea Research" }, href: "/journal", highlight: true },
    ],
  },

  {
    id: "franklin",
    name: "Franklin",
    role: { es: "Maître D", en: "Maître D" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Servicio", en: "Service" },
    bio: {
      es: "Hospitalidad coreografiada y estándares de servicio.",
      en: "Choreographed hospitality and service standards.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 15,
    links: [
      { label: { es: "La Experiencia", en: "The Experience" }, href: "/restaurant", highlight: true },
    ],
  },

  {
    id: "jaudiel",
    name: "Jaudiel",
    role: { es: "Capitán", en: "Captain" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Servicio", en: "Service" },
    bio: {
      es: "Coordinación del equipo y precisión en la experiencia.",
      en: "Team coordination and precision in guest experience.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 16,
    links: [
      { label: { es: "Reservar mesa", en: "Reserve a Table" }, href: "/reservar" },
    ],
  },

  {
    id: "jesus",
    name: "Jesús",
    role: { es: "Head Patisserie", en: "Head Patisserie" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Pastelería", en: "Patisserie" },
    bio: {
      es: "Postres con precisión y elegancia.",
      en: "Desserts with precision and elegance.",
    },
    avatar: "/images/team/persona.jpg",
    tile: "md",
    priority: 17,
    links: [
      { label: { es: "Menú", en: "Menu" }, href: "/restaurant" },
    ],
  },
];

/* =========================================================
   Helpers
========================================================= */

export function getLeader(id?: string | null): LeaderProfile | undefined {
  if (!id) return undefined;

  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const key = normalize(String(id));

  return TEAM.find((l) => normalize(l.id) === key);
}

export function getSortedTeam(): LeaderProfile[] {
  return [...TEAM].sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );
}
