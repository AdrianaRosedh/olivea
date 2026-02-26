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
  forceButton?: boolean; 
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
    role: { es: "Fundadora", en: "Founder" },
    org: { es: "OLIVEA · La Experiencia", en: "OLIVEA · The Experience" },
    tag: { es: "Fundación", en: "Founding" },
    bio: {
      es: "Fundadora, diseñadora y la presencia que da vida a la experiencia. Ange es el alma detrás de Olivea: su sensibilidad estética, su energía dinámica y su profunda pasión por el huerto impulsan cada detalle. Como anfitriona natural, sostiene el espíritu de bienvenida que hace que cada persona se sienta en casa. Desde el diseño de los espacios hasta la atmósfera que se respira, su visión y su corazón habitan en cada rincón de Olivea.",
      en: "Founder, Designer, and the Presence Behind the Experience. Ange is the soul of Olivea: her aesthetic sensibility, dynamic energy, and deep passion for the garden shape every detail. A natural host, she carries the spirit of welcome that makes every guest feel at home. From the design of each space to the atmosphere you feel upon arrival, her vision and heart live within every corner of Olivea."
    },
    avatar: "/images/team/ange.avif",
    gallery: [
      "/images/team/ange.avif",
      "/images/team/ange/01.avif",
      "/images/team/ange/02.avif",
      "/images/team/ange/03.avif",
      "/images/team/ange/04.avif",
      "/images/team/ange/05.avif"
    ],
    tile: "hero",
    priority: 1,
    links: [
      {
        href: "https://oliveafarmtotable.com",
          label: {
            es: "Olivea · La Experiencia",
            en: "Olivea · The Experience",
          },
          highlight: true,
      },
      {
        label: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
        href: "https://oliveafarmtotable.com/farmtotable",
      },
      {
        label: { es: "Casa Olivea", en: "Casa Olivea" },
        href: "https://oliveafarmtotable.com/casa",
      },
      {
        label: { es: "Olivea Café", en: "Olivea Cafe" },
        href: "https://oliveafarmtotable.com/cafe",
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
      { label: { es: "Instagram", en: "Instagram" }, href: "https://www.instagram.com/inventing_ange" },
    ],
  },

   {
    id: "danielnates",
    name: "Daniel Nates",
    role: {
      es: "Chef Ejecutivo",
      en: "Executive Chef",
    },
    org: {
      es: "Olivea Farm To Table",
      en: "Olivea Farm To Table",
    },
    tag: { es: "Cocina", en: "Culinary" },
    bio: {
      es: "Lidera la cocina con un enfoque huerto-primero: técnica, estacionalidad y precisión.",
      en: "Leads the kitchen with a garden-first philosophy: technique, seasonality, and precision.",
    },
    avatar: "/images/team/daniel.jpg",
     gallery: [
      "/images/team/daniel.jpg",
      "/images/team/daniel/persona.jpg",
      "/images/team/daniel/persona.jpg",
      "/images/team/daniel/persona.jpg",
      "/images/team/daniel/persona.jpg",
    ],
    tile: "hero",
    priority: 2,
    links: [
      // 🔹 Primary
      {
        label: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
        href: "https://oliveafarmtotable.com/farmtotable",
        highlight: true,
      },

      // 🔹 Secondary
      {
        label: { es: "Sitio Personal", en: "Personal Website" },
        href: "https://danielnates.com",
      },

      // 🔹 Brand (button, NOT icon)
      {
        label: { es: "Fritanguita", en: "Fritanguita" },
        href: "https://www.instagram.com/fritanguita_",
        forceButton: true,
      },

      // 🔹 Personal social
      {
        label: { es: "Instagram", en: "Instagram" },
        href: "https://www.instagram.com/danielnatesv",
      },

      {
        href: "oliveafarmtotable.com/journal/author/danielnates",
          label: {
            es: "Mis Entradas al Diario de Olivea",
            en: "My Journal Entries for Olivea",
          },
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
    ],
  },

  {
    id: "adrianarose",
    name: "Adriana Rose",
    role: {
      es: "CEO · Tecnología y Visión",
      en: "CEO · Technology & Vision",
    },
    org: { es: "OLIVEA · La Experencia", en: "OLIVEA · The Experience" },
    bio: {
      es: "CEO de Olivea y fundadora de Roseiies. Adriana conecta visión y estructura para dar forma a una hospitalidad que piensa, mide y evoluciona. Su trabajo integra tecnología, experiencia y territorio para construir sistemas coherentes que sostienen lo humano. Cree en una hospitalidad más inteligente, más consciente y diseñada para el largo plazo.",
      en: "CEO of Olivea and founder of Roseiies. Adriana connects vision and structure to shape a form of hospitality that thinks, measures, and evolves. Her work integrates technology, experience, and place to build coherent systems that support what is human. She believes in a more intelligent, conscious, and long-term approach to hospitality."
    },
    avatar: "/images/team/adriana.avif",
    gallery: [
      "/images/team/adriana.avif",
      "/images/team/adriana/01.avif",
      "/images/team/adriana/02.avif",
      "/images/team/adriana/03.avif",
      "/images/team/adriana/04.avif",
      "/images/team/adriana/05.avif"
    ],
    tile: "hero",
    priority: 3,
    links: [
      // ⭐ PRIMARY LINK — startup
      {
        href: "https://roseiies.com",
        label: {
          es: "Roseiies — Hospitaidad Inteligente",
          en: "Roseiies — Hospitality Intelligence",
        },
        highlight: true,
      },
      {
        href: "https://oliveafarmtotable.com",
          label: {
            es: "Olivea · La Experiencia",
            en: "Olivea · The Experience",
          },
          highlight: true,
      },
      {
        href: "oliveafarmtotable.com/journal/author/adrianarose",
          label: {
            es: "Mis Entradas al Diario de Olivea",
            en: "My Journal Entries for Olivea",
          },
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
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
    id: "onan",
    name: "Onan Mendoza",
    role: { es: "Sous Chef", en: "Sous Chef" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Cocina", en: "Kitchen" },
    bio: {
      es: "Ejecución diaria, consistencia y mejora continua.",
      en: "Daily execution, consistency, and continuous improvement.",
    },
    avatar: "/images/team/onan.avif",
    gallery: [
      "/images/team/onan.avif",
      "/images/team/onan/persona.avif",
      "/images/team/onan/persona.avif",
      "/images/team/onan/persona.avif",
      "/images/team/onan/persona.avif",
      "/images/team/onan/persona.avif"
    ],
    tile: "md",
    priority: 4,
    links: [
      { href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Tablee",
        },
        highlight: true,
       },
      {
        href: "https://www.instagram.com/onanmendoza",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
    ],
  },

  {
    id: "luis",
    name: "Luis Ruiz",
    role: { es: "Encargado de I+D", en: "Head of R&D" },
    org: { es: "Olivea", en: "Olivea" },
    tag: { es: "I+D", en: "R&D" },
    bio: {
      es: "Investigación culinaria, eficiencia y reducción de desperdicio.",
      en: "Culinary research, efficiency, and waste reduction.",
    },
    avatar: "/images/team/luis.avif",
    gallery: [
      "/images/team/luis.avif",
      "/images/team/luis/persona.avif",
      "/images/team/luis/persona.avif",
      "/images/team/luis/persona.avif",
      "/images/team/luis/persona.avif",
      "/images/team/luis/persona.avif"
    ],
    tile: "md",
    priority: 5,
    links: [
      { href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Tablee",
        },
        highlight: true,
       },
      {
        href: "https://www.instagram.com/luisruiz971401",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
      {
        href: "https://www.instagram.com/koji.more.anything",
        label: {
          es: "Koji + anything",
          en: "Koji + anything",
        },
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
    ],
  },

  {
    id: "jesus",
    name: "Jesús Zazueta",
    role: { es: "Supervisor de Patisserie", en: "Head of Patisserie" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Pastelería", en: "Patisserie" },
    bio: {
      es: "Postres con precisión y elegancia.",
      en: "Desserts with precision and elegance.",
    },
    avatar: "/images/team/jesus.avif",
    gallery: [
      "/images/team/jesus.avif",
      "/images/team/jesus/persona.avif",
      "/images/team/jesus/persona.avif",
      "/images/team/jesus/persona.avif",
      "/images/team/jesus/persona.avif",
      "/images/team/jesus/persona.avif"
    ],
    tile: "md",
    priority: 6,
    links: [
      { href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Tablee",
        },
        highlight: true,
       },
      {
        href: "https://www.instagram.com/jesuszazuettas",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
      {
        href: "https://www.instagram.com/pandelvalle",
        label: {
          es: "Pan del Valle",
          en: "Pan del Valle",
        },
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
    ],
  },

  {
    id: "cristina",
    name: "Cristina",
    role: { es: "Encargada de RRHH", en: "Head of HR" },
    org: { es: "Olivea", en: "Olivea" },
    tag: { es: "People", en: "People" },
    bio: {
      es: "Cultura, estructura y crecimiento del equipo.",
      en: "Culture, structure, and team growth.",
    },
    avatar: "/images/team/cristina.avif",
    gallery: [
      "/images/team/cristina.avif",
      "/images/team/cristina/persona.avif",
      "/images/team/cristina/persona.avif",
      "/images/team/cristina/persona.avif",
      "/images/team/cristina/persona.avif",
      "/images/team/cristina/persona.avif"
    ],
    tile: "md",
    priority: 7,
    links: [
    {
        href: "https://oliveafarmtotable.com",
          label: {
            es: "Olivea · La Experiencia",
            en: "Olivea · The Experience",
          },
          highlight: true,
    },
    {
        href: "https://oliveafarmtotable.com/carreras",
          label: {
            es: "Carreras Olivea",
            en: "Olivea Careers",
          },
          highlight: true,
    },
    {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
    ],
  },

  {
    id: "leo",
    name: "Leonardo",
    role: { es: "Supervisor del Hotel", en: "Hotel Supervisor" },
    org: { es: "Casa Olivea", en: "Casa Olivea" },
    tag: { es: "Hotel", en: "Hotel" },
    bio: {
      es: "Responsable de la operación hotelera y consistencia de servicio.",
      en: "Oversees hotel operations and service consistency.",
    },
    avatar: "/images/team/leonardo.avif",
    gallery: [
      "/images/team/leonardo.avif",
      "/images/team/leonardo/persona.avif",
      "/images/team/leonardo/persona.avif",
      "/images/team/leonardo/persona.avif",
      "/images/team/leonardo/persona.avif",
      "/images/team/leonardo/persona.avif"
    ],
    tile: "md",
    priority: 8,
    links: [
      {
        href: "https://oliveafarmtotable.com/casa",
          label: {
            es: "Casa Olivea",
            en: "Casa Olivea",
          },
          highlight: true,
      },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
      {
        href: "https://www.instagram.com/leoconcer99",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
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
    avatar: "/images/team/franklin.avif",
    gallery: [
      "/images/team/franklin.avif",
      "/images/team/franklin/persona.avif",
      "/images/team/franklin/persona.avif",
      "/images/team/franklin/persona.avif",
      "/images/team/franklin/persona.avif",
      "/images/team/franklin/persona.avif"
    ],
    tile: "md",
    priority: 9,
    links: [
      { href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Tablee",
        },
        highlight: true,
       },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
      {
        href: "https://www.instagram.com/elcortesdelosgalindo",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
    ],
  },

  {
    id: "jahudiel",
    name: "Jahudiel",
    role: { es: "Capitán", en: "Captain" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Servicio", en: "Service" },
    bio: {
      es: "Coordinación del equipo y precisión en la experiencia.",
      en: "Team coordination and precision in guest experience.",
    },
    avatar: "/images/team/jahudiel.avif",
    gallery: [
      "/images/team/jahudiel.avif",
      "/images/team/jahudiel/persona.avif",
      "/images/team/jahudiel/persona.avif",
      "/images/team/jahudiel/persona.avif",
      "/images/team/jahudiel/persona.avif",
      "/images/team/jahudiel/persona.avif"
    ],
    tile: "md",
    priority: 10,
    links: [
      { href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Tablee",
        },
        highlight: true,
       },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
      {
        href: "https://www.instagram.com/jahuvalenz7",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
    ],
  },

  {
    id: "fran",
    name: "Fran",
    role: { es: "Coord. Operaciones", en: "Operations Coordinator" },
    org: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
    tag: { es: "Operations", en: "Operaciones" },
    bio: {
      es: "Coordina las operaciones diarias, compras y procesos administrativos para asegurar el buen funcionamiento de Olivea.",
      en: "Oversees daily operations, purchasing, and administrative processes to keep Olivea running smoothly.",
    },
    avatar: "/images/team/fran.avif",
    gallery: [
      "/images/team/fran.avif",
      "/images/team/fran/persona.avif",
      "/images/team/fran/persona.avif",
      "/images/team/fran/persona.avif",
      "/images/team/fran/persona.avif",
      "/images/team/fran/persona.avif"
    ],
    tile: "md",
    priority: 11,
    links: [
      { href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Tablee",
        },
        highlight: true,
       },
      {
        href: "https://oliveafarmtotable.com/journal",
          label: {
            es: "Cuaderno de Olivea",
            en: "Olivea's Journal",
          },
      },
      {
        href: "https://www.instagram.com/franrojoo",
        label: {
          es: "Instagram",
          en: "Instagram",
        },
      },
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