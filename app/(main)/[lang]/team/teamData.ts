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

/* ---------- Team filter categories (for Team page filters) ---------- */
/** Matches TeamDockLeft categories (minus "all") */
export type TeamFilterCategory = "hotel" | "restaurant" | "cafe";

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

  /**
   * Explicit filter control for the Team page.
   * - If set, this overrides org-based category inference.
   * - Example: showIn: ["restaurant", "cafe"]
   */
  showIn?: TeamFilterCategory[];

  /**
   * If true, this person appears in EVERY filter (hotel/restaurant/cafe).
   * Use for brand/ecosystem leaders.
   */
  alwaysShow?: boolean;

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

    // ✅ show in every filter explicitly (replaces org-based "experience" hack)
    alwaysShow: true,

    bio: {
      es: "Fundadora, diseñadora y la presencia que da vida a la experiencia. Ange es el alma detrás de Olivea: su sensibilidad estética, su energía dinámica y su profunda pasión por el huerto impulsan cada detalle. Como anfitriona natural, sostiene el espíritu de bienvenida que hace que cada persona se sienta en casa. Desde el diseño de los espacios hasta la atmósfera que se respira, su visión y su corazón habitan en cada rincón de Olivea.",
      en: "Founder, Designer, and the Presence Behind the Experience. Ange is the soul of Olivea: her aesthetic sensibility, dynamic energy, and deep passion for the garden shape every detail. A natural host, she carries the spirit of welcome that makes every guest feel at home. From the design of each space to the atmosphere you feel upon arrival, her vision and heart live within every corner of Olivea.",
    },
    avatar: "/images/team/ange.avif",
    gallery: [
      "/images/team/ange.jpg",
      "/images/team/ange/01.JPG",
      "/images/team/ange/02.JPG",
      "/images/team/ange/03.jpg",
      "/images/team/ange/04.jpeg",
      "/images/team/ange/05.jpg",
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
      {
        label: { es: "Instagram", en: "Instagram" },
        href: "https://www.instagram.com/inventing_ange",
      },
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

    // ✅ Restaurant only (Farm To Table)
    showIn: ["restaurant"],

    bio: {
      es: "Chef Ejecutivo de Olivea, Daniel dirige la visión gastronómica del ecosistema y ha sido una fuerza transformadora dentro del equipo. Su energía, intensidad y pasión por hacer las cosas de manera distinta encendieron una nueva etapa para Olivea. Su cocina nace del huerto y del territorio de Baja California, con el Valle de Guadalupe como raíz y responsabilidad. Diseña cada menú en diálogo con los vinos regionales y construye platos alrededor de historias locales poderosas. Pero más allá del plato, su vocación por la diferencia y su búsqueda constante de excelencia inspiran a todo el equipo. Su fuego creativo se contagia. Ha sembrado una luz que empuja a cada persona a pensar más grande, trabajar con mayor orgullo y atreverse a ser únicos.",
      en: "Executive Chef of Olivea, Daniel directs the gastronomic vision of the ecosystem and has been a transformative force within the team. His intensity, energy, and passion for doing things differently ignited a new chapter for Olivea. His cuisine begins in the garden and is rooted in Baja California, with Valle de Guadalupe as both origin and responsibility. He designs each menu in dialogue with regional wines, building plates around powerful local stories. Beyond the plate, his vocation for uniqueness and relentless pursuit of excellence inspire the entire team. His creative fire is contagious. He sparked a light that pushes every person to think bigger, work with deeper pride, and dare to be distinct.",
    },
    avatar: "/images/team/daniel.jpg",
    gallery: [
      "/images/team/daniel.jpg",
      "/images/team/daniel/01.JPG",
      "/images/team/daniel/02.PNG",
      "/images/team/daniel/03.JPG",
      "/images/team/daniel/04.JPG",
      "/images/team/daniel/05.JPG",
    ],
    tile: "hero",
    priority: 2,
    links: [
      {
        label: { es: "Olivea Farm To Table", en: "Olivea Farm To Table" },
        href: "https://oliveafarmtotable.com/farmtotable",
        highlight: true,
      },
      {
        label: { es: "Sitio Personal", en: "Personal Website" },
        href: "https://danielnates.com",
      },
      {
        label: { es: "Fritanguita", en: "Fritanguita" },
        href: "https://www.instagram.com/fritanguita_",
        forceButton: true,
      },
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

    // ✅ show in every filter explicitly
    alwaysShow: true,

    bio: {
      es: "CEO de Olivea y fundadora de Roseiies. Adriana es la arquitecta del ecosistema Olivea. Define la dirección estratégica de la marca, su evolución a largo plazo y la coherencia entre hotel, restaurante, café y territorio. Diseña la experiencia como un sistema vivo donde concepto, tecnología, estructura y sensibilidad estética convergen. Toma decisiones de alto nivel, traduce visión en dirección concreta y conecta cada expresión bajo una sola narrativa. Su enfoque integra inteligencia, territorio y humanidad para construir una hospitalidad diseñada para perdurar.",
      en: "CEO of Olivea and founder of Roseiies. Adriana is the architect of the Olivea ecosystem. She defines the brand’s long-term direction and ensures coherence between hotel, restaurant, café, and territory. She designs the experience as a living system where concept, technology, structure, and aesthetic sensibility converge. Making high-level decisions, she translates vision into concrete direction and connects every expression under a single narrative. Her approach integrates intelligence, place, and humanity to build hospitality designed to endure.",
    },
    avatar: "/images/team/adriana.jpg",
    gallery: [
      "/images/team/adriana.jpg",
      "/images/team/adriana/01.png",
      "/images/team/adriana/02.png",
      "/images/team/adriana/03.png",
      "/images/team/adriana/04.png",
      "/images/team/adriana/05.png",
    ],
    tile: "hero",
    priority: 3,
    links: [
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

    // ✅ Restaurant only
    showIn: ["restaurant"],

    bio: {
      es: "Sous Chef de Olivea Farm To Table, Onan es el eje operativo y humano de la cocina. Líder nato, equilibra energía y serenidad, unificando al equipo con una presencia firme y empática. Escucha, aprende y ejecuta con una precisión poco común, sosteniendo la consistencia diaria mientras impulsa la mejora continua. Sabe exigir sin fracturar y motivar sin imponer. Ambicioso y disciplinado, es el centro que mantiene unida la cocina.",
      en: "Sous Chef of Olivea Farm To Table, Onan is the operational and human axis of the kitchen. A natural leader, he balances energy with calm, unifying the team through a steady and empathetic presence. He listens, learns, and executes with uncommon precision, sustaining daily consistency while driving continuous improvement. He knows how to demand excellence without creating friction and how to motivate without imposing. He is the center that holds the kitchen together.",
    },
    avatar: "/images/team/onan.jpg",
    gallery: [
      "/images/team/onan.jpg",
      "/images/team/onan/01.JPG",
      "/images/team/onan/02.jpg",
      "/images/team/onan/03.jpeg",
    ],
    tile: "md",
    priority: 4,
    links: [
      {
        href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Table",
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

    // ✅ FIX: only show under Restaurant (Farm To Table)
    showIn: ["restaurant"],

    bio: {
      es: "Encargado de Investigación y Desarrollo en Olivea, Luis es el motor científico del ecosistema. Lidera el Comité de Investigación, donde el equipo explora hallazgos del territorio, fermentaciones y nuevas técnicas para enriquecer la experiencia gastronómica. Su precisión y obsesión por el detalle sostienen los procesos invisibles que elevan cada plato. Protector del ciclo completo, cuida que el recorrido del huerto al restaurante, del café a la fermentación, de la conservación al compostaje, se mantenga coherente y responsable. Es guardián del desperdicio cero y arquitecto de la circularidad en Olivea.",
      en: "Head of Research & Development at Olivea, Luis is the scientific engine of the ecosystem. He leads the Research Committee, where the team explores regional discoveries, fermentations, and new techniques to deepen the culinary experience. His precision and attention to detail sustain the invisible processes that elevate every dish. Guardian of the full cycle, he ensures the journey from garden to restaurant, from café to fermentation, from preservation to compost, remains coherent and responsible. He is protector of zero waste and architect of circularity within Olivea.",
    },
    avatar: "/images/team/luis.jpg",
    gallery: [
      "/images/team/luis.jpg",
      "/images/team/luis/01.jpg",
      "/images/team/luis/02.jpg",
      "/images/team/luis/03.jpg",
      "/images/team/luis/04.jpg",
    ],
    tile: "md",
    priority: 5,
    links: [
      {
        href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Table",
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

    // ✅ FIX: shows in BOTH Restaurant + Cafe
    showIn: ["restaurant", "cafe"],

    bio: {
      es: "Supervisor de Patisserie en Olivea, Jesús lidera panadería y postres con disciplina, elegancia y una ambición creativa incansable. Es un líder por ejemplo: dinámico, enfocado y dispuesto al trabajo duro. También pieza clave en Olivea Café, piensa constantemente en cómo unificar restaurante y café como expresiones distintas de una misma visión. Le entusiasma el desafío de llevar el huerto a terrenos tradicionales, reinterpretando lo clásico desde el territorio. Su hambre por crear y aprender lo convierte en una fuerza expansiva dentro del ecosistema.",
      en: "Head of Patisserie at Olivea, Jesús leads bread and desserts with discipline, elegance, and relentless creative ambition. A leader by example, he is dynamic, focused, and unafraid of hard work. Also a key figure in Olivea Café, he constantly thinks about unifying restaurant and café as different expressions of the same vision. He is energized by the challenge of bringing the garden into traditionally structured forms, reinterpreting the familiar through the territory. His hunger to create and learn makes him an expansive force within the ecosystem.",
    },
    avatar: "/images/team/jesus.jpg",
    gallery: [
      "/images/team/jesus.jpg",
      "/images/team/jesus/01.JPG",
      "/images/team/jesus/02.JPG",
      "/images/team/jesus/03.jpeg",
      "/images/team/jesus/04.JPG",
      "/images/team/jesus/05.JPG",
      "/images/team/jesus/06.jpeg",
    ],
    tile: "md",
    priority: 6,
    links: [
      {
        href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Table",
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

    // (optional) If you want her only under "all", leave showIn undefined.
    // showIn: [],

    bio: {
      es: "Encargada de Recursos Humanos en Olivea, Cristina es la guardiana del bienestar del equipo. Escucha con profundidad y crea un espacio donde cada persona puede sentirse segura para hablar, crecer y ser tomada en cuenta. Es el puente entre el equipo y la dirección, asegurando que las voces internas se transformen en acciones concretas. Observa dónde están las mentes y los corazones del equipo, permitiendo que Olivea crezca de manera sana y consciente. En una organización donde el equipo es familia, su trabajo sostiene la confianza, la estructura y el desarrollo humano.",
      en: "Head of Human Resources at Olivea, Cristina is the guardian of the team’s well-being. A powerful listener, she creates a space where every person feels safe to speak, grow, and be taken seriously. She serves as the bridge between the team and leadership, ensuring that internal voices translate into meaningful action. She understands where people stand emotionally and professionally, allowing Olivea to grow in a healthy and conscious way. In an organization where the team is family, her work sustains trust, structure, and human development.",
    },
    avatar: "/images/team/cristina.png",
    gallery: [
      "/images/team/cristina.png",
      "/images/team/cristina/01.JPG",
      "/images/team/cristina/02.JPG",
      "/images/team/cristina/03.JPG",
      "/images/team/cristina/04.jpg",
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
    role: { es: "Supervisor de Hotel", en: "Hotel Supervisor" },
    org: { es: "Casa Olivea", en: "Casa Olivea" },
    tag: { es: "Hotel", en: "Hotel" },

    // ✅ Hotel only
    showIn: ["hotel"],

    bio: {
      es: "Supervisor de Casa Olivea, Leonardo cuida la operación diaria con responsabilidad, temple y una profunda vocación por su equipo. Escucha, protege y asume el liderazgo con firmeza y sensibilidad. Toma orgullo en su rol y en la consistencia del servicio, asegurando que cada huésped viva la experiencia con coherencia y calidez. Inquieto y ambicioso, siempre busca mejorar procesos, probar nuevas ideas y aprender de cada intento, sea éxito o error. Su impulso por crecer y evolucionar no solo lo mueve a él, sino que inspira a quienes lo rodean. Es guardián del estándar y promotor del crecimiento dentro de Casa Olivea.",
      en: "Supervisor of Casa Olivea, Leonardo oversees daily operations with responsibility, composure, and a deep commitment to his team. He listens, protects, and leads with both firmness and care. Taking pride in his role and in service consistency, he ensures every guest experiences Olivea with coherence and warmth. Ambitious and forward-moving, he constantly seeks improvement, testing new ideas and learning from every outcome — whether success or failure. His drive for growth not only fuels him, but elevates those around him. He is both guardian of the standard and catalyst for evolution within Casa Olivea.",
    },
    avatar: "/images/team/leonardo.png",
    gallery: [
      "/images/team/leonardo.png",
      "/images/team/leo/01.jpg",
      "/images/team/leo/02.jpg",
      "/images/team/leo/03.JPG",
      "/images/team/leo/04.jpg",
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

    // ✅ Restaurant only
    showIn: ["restaurant"],

    bio: {
      es: "Maître D de Olivea Farm To Table, Franklin es el corazón del servicio. Líder de pasión y carácter, protege la cultura del equipo y eleva los estándares con orgullo contagioso. Transmite una energía que inspira compromiso, precisión y presencia en cada interacción. Exige pasión porque él mismo la encarna. Cuando los huéspedes llegan, sienten esa intensidad y la devuelven. Franklin siembra orgullo en el equipo, y ese orgullo florece en la experiencia. Es la chispa que convierte el servicio en algo memorable.",
      en: "Maître D of Olivea Farm To Table, Franklin is the heart of service. A leader of passion and character, he protects the team’s culture and elevates standards with contagious pride. He transmits an energy that inspires commitment, precision, and presence in every interaction. He demands passion because he embodies it. When guests arrive, they feel that intensity and reflect it back. Franklin plants pride within the team, and that pride blossoms in the experience. He is the spark that turns service into something memorable.",
    },
    avatar: "/images/team/franklin.jpg",
    gallery: [
      "/images/team/franklin.jpg",
      "/images/team/franklin/01.png",
      "/images/team/franklin/02.jpg",
      "/images/team/franklin/03.jpg",
      "/images/team/franklin/04.jpg",
    ],
    tile: "md",
    priority: 9,
    links: [
      {
        href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Table",
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

    // ✅ Restaurant only
    showIn: ["restaurant"],

    bio: {
      es: "Capitán en Olivea Farm To Table, Jahudiel es promotor orgulloso de la experiencia dentro y fuera del restaurante. Comparte con la comunidad lo que significa formar parte de Olivea y transmite esa energía al equipo. Hambre de crecimiento lo define: aprende constantemente, explora nuevas regiones y profundiza en el vino como sommelier en formación. Es pieza fundamental en la experiencia vinícola, protegiendo la coherencia de la carta y asegurando que cada botella cuente la historia correcta. Sabe lo que quiere y trabaja con disciplina para alcanzarlo, convirtiendo su ambición en evolución continua.",
      en: "Captain at Olivea Farm To Table, Jahudiel is a proud ambassador of the experience both inside and beyond the restaurant. He shares what it means to be part of Olivea with the community and transmits that energy to the team. Growth defines him: he is constantly learning, exploring new wine regions, and deepening his knowledge as a sommelier in training. A fundamental part of the wine experience, he protects the integrity of the wine program and ensures every bottle communicates the right story. He knows what he wants and works with discipline to achieve it, turning ambition into continuous evolution.",
    },
    avatar: "/images/team/jahudiel.png",
    gallery: [
      "/images/team/jahudiel.png",
      "/images/team/jahudiel/01.jpg",
      "/images/team/jahudiel/02.jpg",
    ],
    tile: "md",
    priority: 10,
    links: [
      {
        href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Table",
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

    // ✅ Restaurant only (operations for Farm To Table)
    showIn: ["restaurant"],

    bio: {
      es: "Coordinador de Operaciones en Olivea desde el primer día, Fran es la columna invisible que sostiene el ritmo diario. Es el principal responsable de compras y abastecimiento, protegiendo costos sin comprometer calidad. Se le puede ver por la mañana gestionando proveedores y por la noche apoyando donde haga falta — siempre dispuesto a decir sí cuando el equipo necesita más. Recoge fruta directamente de productores, asegura los ingredientes para cada servicio y cuida incluso los detalles del family meal. Su pasión por la gastronomía y su compromiso con la mejora continua lo convierten en una fuerza constante dentro del ecosistema. La pregunta con Fran no es qué hace, sino qué no hace.",
      en: "Operations Coordinator at Olivea since day one, Fran is the invisible backbone of daily rhythm. He leads procurement and sourcing, protecting costs without compromising quality. You may see him in the morning managing suppliers and at night stepping in wherever needed — always the first to say yes when the team needs more. He personally collects fruit from producers, ensures every service has what it needs, and even safeguards the details of the family meal. His passion for gastronomy and commitment to constant improvement make him a steady force within the ecosystem. With Fran, the question isn’t what he does — it’s what doesn’t he do.",
    },
    avatar: "/images/team/fran.jpg",
    gallery: [
      "/images/team/fran.jpg",
      "/images/team/fran/01.JPG",
      "/images/team/fran/02.JPG",
      "/images/team/fran/03.JPG",
      "/images/team/fran/04.JPG",
    ],
    tile: "md",
    priority: 11,
    links: [
      {
        href: "https://oliveafarmtotable.com/farmtotable",
        label: {
          es: "Olivea Farm To Table",
          en: "Olivea Farm To Table",
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
  return [...TEAM].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
}