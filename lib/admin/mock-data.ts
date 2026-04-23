// lib/admin/mock-data.ts
// Mock data layer — swap for Supabase queries when ready

export interface WineItem {
  id: string;
  category: string;
  name: string;
  winery: string;
  grape?: string;
  year?: number;
  priceGlass?: number;
  priceBottle?: number;
  tags: string[];
  available: boolean;
  sortOrder: number;
}

export interface DrinkItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  price?: number;
  tags: string[];
  available: boolean;
  sortOrder: number;
}

export interface SpiritItem {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  brand?: string;
  price?: number;
  available: boolean;
  sortOrder: number;
}

export interface StatCard {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

// ── Dashboard mock data ──
export const dashboardStats: StatCard[] = [
  { label: "Wine list items", value: "94", change: "+3 this week", trend: "up" },
  { label: "Cocktails & mocktails", value: "15", change: "5 mocktails new", trend: "up" },
  { label: "Journal posts", value: "4", change: "All published", trend: "neutral" },
  { label: "Team members", value: "4", trend: "neutral" },
];

export const recentActivity: ActivityItem[] = [
  { id: "1", user: "Adriana", action: "updated", target: "Wine list — added Anatolia Pet Nat", timestamp: "2 hours ago" },
  { id: "2", user: "Chef Daniel", action: "edited", target: "Tasting menu — course 5 updated", timestamp: "5 hours ago" },
  { id: "3", user: "Adriana", action: "published", target: "Journal — Lo que la tierra ya sabe", timestamp: "1 week ago" },
  { id: "4", user: "Adriana", action: "published", target: "Journal — El Mar También es Nuestro Jardín", timestamp: "2 months ago" },
  { id: "5", user: "Adriana", action: "updated", target: "Drinks — added mocktails section", timestamp: "3 days ago" },
];

// ── Wine mock data (seeded from the carta-de-vinos restructuring) ──
export const wineCategories = [
  "De La Casa",
  "Vinos Naturales",
  "Blancos",
  "Rosados",
  "Espumosos",
  "Tintos Ligeros y Frescos",
  "Tintos De Cuerpo",
  "Monovarietales Únicos",
  "Ensambles",
  "Dulces",
] as const;

export const mockWines: WineItem[] = [
  // De La Casa
  { id: "w1", category: "De La Casa", name: "Chardonnay", winery: "Olivea", year: 2023, priceGlass: 220, priceBottle: 850, tags: ["house"], available: true, sortOrder: 0 },
  { id: "w2", category: "De La Casa", name: "Rosado", winery: "Olivea", year: 2023, priceGlass: 220, priceBottle: 850, tags: ["house"], available: true, sortOrder: 1 },
  { id: "w3", category: "De La Casa", name: "Granache", winery: "Olivea", year: 2022, priceGlass: 220, priceBottle: 850, tags: ["house"], available: true, sortOrder: 2 },
  { id: "w4", category: "De La Casa", name: "Cabernet Sauvignon 9M", winery: "Olivea", year: 2021, priceGlass: 280, priceBottle: 1100, tags: ["house"], available: true, sortOrder: 3 },
  { id: "w5", category: "De La Casa", name: "Cabernet Sauvignon 14M", winery: "Olivea", year: 2020, priceGlass: 350, priceBottle: 1400, tags: ["house"], available: true, sortOrder: 4 },
  { id: "w6", category: "De La Casa", name: "Zinfandel", winery: "Olivea", year: 2022, priceGlass: 250, priceBottle: 950, tags: ["house"], available: true, sortOrder: 5 },

  // Vinos Naturales
  { id: "w7", category: "Vinos Naturales", name: "Pet Nat", winery: "Anatolia", grape: "Macabeo", priceBottle: 950, tags: ["natural"], available: true, sortOrder: 0 },

  // Blancos (sample)
  { id: "w8", category: "Blancos", name: "Sauvignon Blanc", winery: "Adobe Guadalupe", year: 2023, priceGlass: 200, priceBottle: 800, tags: [], available: true, sortOrder: 0 },
  { id: "w9", category: "Blancos", name: "Chardonnay", winery: "Casta de Vinos", year: 2022, priceGlass: 230, priceBottle: 900, tags: [], available: true, sortOrder: 1 },
  { id: "w10", category: "Blancos", name: "Viognier", winery: "Bruma", year: 2022, priceGlass: 260, priceBottle: 1050, tags: [], available: true, sortOrder: 2 },
  { id: "w11", category: "Blancos", name: "Chenin Blanc", winery: "Decantos", year: 2023, priceGlass: 190, priceBottle: 750, tags: [], available: true, sortOrder: 3 },
  { id: "w12", category: "Blancos", name: "Albariño", winery: "Finca La Carrodilla", year: 2023, priceGlass: 240, priceBottle: 950, tags: [], available: true, sortOrder: 4 },

  // Rosados (sample)
  { id: "w13", category: "Rosados", name: "Rosado de Grenache", winery: "Bichi", year: 2023, priceBottle: 1100, tags: [], available: true, sortOrder: 0 },
  { id: "w14", category: "Rosados", name: "Rosa de Lola", winery: "Adobe Guadalupe", year: 2023, priceGlass: 200, priceBottle: 800, tags: [], available: true, sortOrder: 1 },

  // Espumosos
  { id: "w15", category: "Espumosos", name: "Espumoso Brut", winery: "Lechuza", year: 2022, priceBottle: 850, tags: ["sparkling"], available: true, sortOrder: 0 },
  { id: "w16", category: "Espumosos", name: "Espumoso Brut Rosé", winery: "Lechuza", year: 2022, priceBottle: 900, tags: ["sparkling"], available: true, sortOrder: 1 },

  // Tintos Ligeros
  { id: "w17", category: "Tintos Ligeros y Frescos", name: "Grenache", winery: "Bichi", year: 2022, priceBottle: 1200, tags: [], available: true, sortOrder: 0 },
  { id: "w18", category: "Tintos Ligeros y Frescos", name: "Tempranillo", winery: "Paralelo", year: 2022, priceGlass: 220, priceBottle: 880, tags: [], available: true, sortOrder: 1 },

  // Tintos De Cuerpo
  { id: "w19", category: "Tintos De Cuerpo", name: "Cabernet Sauvignon", winery: "Monte Xanic", year: 2020, priceGlass: 320, priceBottle: 1300, tags: [], available: true, sortOrder: 0 },
  { id: "w20", category: "Tintos De Cuerpo", name: "Merlot Reserva", winery: "Adobe Guadalupe", year: 2019, priceBottle: 1500, tags: [], available: true, sortOrder: 1 },

  // Monovarietales Únicos
  { id: "w21", category: "Monovarietales Únicos", name: "Mourvèdre", winery: "Vena Cava", year: 2021, priceBottle: 1400, tags: ["unique"], available: true, sortOrder: 0 },
  { id: "w22", category: "Monovarietales Únicos", name: "Pinot Noir", winery: "Santo Tomás", year: 2022, priceBottle: 1100, tags: ["unique"], available: true, sortOrder: 1 },
  { id: "w23", category: "Monovarietales Únicos", name: "Nebbiolo", winery: "Encuentro Guadalupe", year: 2020, priceBottle: 1600, tags: ["unique"], available: true, sortOrder: 2 },

  // Ensambles
  { id: "w24", category: "Ensambles", name: "Ensamble Tinto", winery: "Bruma", year: 2020, priceBottle: 1800, tags: ["blend"], available: true, sortOrder: 0 },
  { id: "w25", category: "Ensambles", name: "Gran Reserva", winery: "Monte Xanic", year: 2018, priceBottle: 2200, tags: ["blend"], available: true, sortOrder: 1 },

  // Dulces
  { id: "w26", category: "Dulces", name: "Late Harvest", winery: "Adobe Guadalupe", year: 2021, priceGlass: 180, priceBottle: 750, tags: ["sweet"], available: true, sortOrder: 0 },
];

// ── Drinks mock data ──
export const drinkCategories = [
  "Del Huerto al Vaso",
  "Cocktails",
  "Cerveza",
  "Agua",
] as const;

export const mockDrinks: DrinkItem[] = [
  // Mocktails
  { id: "d1", category: "Del Huerto al Vaso", name: "Huerto Vivo", description: "Fermented garden kombucha, seasonal herbs, citrus", price: 180, tags: ["mocktail", "garden"], available: true, sortOrder: 0 },
  { id: "d2", category: "Del Huerto al Vaso", name: "Jardín de Noche", description: "Lavender shrub, butterfly pea, lime", price: 180, tags: ["mocktail", "garden"], available: true, sortOrder: 1 },
  { id: "d3", category: "Del Huerto al Vaso", name: "Tierra Roja", description: "Beet kvass, ginger, black pepper", price: 180, tags: ["mocktail", "garden"], available: true, sortOrder: 2 },
  { id: "d4", category: "Del Huerto al Vaso", name: "Oliva Fresca", description: "Olive leaf infusion, cucumber, elderflower", price: 180, tags: ["mocktail", "garden"], available: true, sortOrder: 3 },
  { id: "d5", category: "Del Huerto al Vaso", name: "Citrus del Valle", description: "Valle citrus soda, rosemary, honey", price: 160, tags: ["mocktail", "garden"], available: true, sortOrder: 4 },

  // Cocktails
  { id: "d6", category: "Cocktails", name: "Margarita Olivea", description: "Tequila, agave, lime, sal de gusano", price: 240, tags: ["cocktail"], available: true, sortOrder: 0 },
  { id: "d7", category: "Cocktails", name: "Mezcal Negroni", description: "Mezcal, Campari, sweet vermouth", price: 260, tags: ["cocktail"], available: true, sortOrder: 1 },
  { id: "d8", category: "Cocktails", name: "Paloma del Huerto", description: "Tequila, grapefruit, garden herbs", price: 220, tags: ["cocktail"], available: true, sortOrder: 2 },

  // Cerveza
  { id: "d9", category: "Cerveza", name: "Cerveza Artesanal del Día", price: 120, tags: ["beer"], available: true, sortOrder: 0 },
  { id: "d10", category: "Cerveza", name: "Cerveza Importada", price: 140, tags: ["beer"], available: true, sortOrder: 1 },

  // Agua
  { id: "d11", category: "Agua", name: "Agua Mineral", price: 80, tags: ["water"], available: true, sortOrder: 0 },
  { id: "d12", category: "Agua", name: "Agua Natural", price: 60, tags: ["water"], available: true, sortOrder: 1 },
];

// ── Journal data — mirrors the 4 real MDX articles on the live site ──
// Re-export canonical types for backward compat
export type { JournalStatus, JournalPost } from "@/lib/content/types";
import type { JournalPost } from "@/lib/content/types";

export const mockJournalPosts: JournalPost[] = [
  {
    id: "lo-que-la-tierra-ya-sabe-001",
    title: {
      es: "Lo que la tierra ya sabe",
      en: "What the Land Already Knows",
    },
    slug: "2026-04-15-lo-que-la-tierra-ya-sabe",
    excerpt: {
      es: "En Olivea, el plato no empieza en la cocina. Empieza afuera, en la tierra que lo sostiene.",
      en: "At Olivea, the plate does not begin in the kitchen. It begins outside, in the land that sustains it.",
    },
    body: {
      es: "<p>Ensayo sobre territorio, clima y la relación entre el huerto y el menú.</p>",
      en: "<p>Essay on territory, climate, and the relationship between garden and menu.</p>",
    },
    coverImage: "/images/journal/LoQueLaTierraYaSabe/cover.jpg",
    author: "Adriana Rose & Daniel Nates",
    status: "published",
    tags: ["Territorio", "Huerto", "Clima", "Sostenibilidad", "Menú", "Valle de Guadalupe"],
    createdAt: "2026-04-15T08:00:00Z",
    updatedAt: "2026-04-15T08:00:00Z",
    publishedAt: "2026-04-15T08:00:00Z",
  },
  {
    id: "elmar-nuestro-jardin-001",
    title: {
      es: "El Mar También es Nuestro Huerto",
      en: "The Sea Is Also Our Garden",
    },
    slug: "2026-02-22-el-mar-tambien-nuestro-jardin",
    excerpt: {
      es: "A diez minutos del restaurante comienza el origen. Visitar a nuestros productores del mar reafirma nuestra coherencia: territorio, investigación y responsabilidad.",
      en: "Ten minutes from the restaurant, origin begins. Visiting our local seafood producers reinforces our commitment to territory, research, and coherence.",
    },
    body: {
      es: "<p>Crónica sobre los productores del Pacífico que abastecen a Olivea.</p>",
      en: "<p>Chronicle about the Pacific producers who supply Olivea.</p>",
    },
    coverImage: "/images/journal/ElMarTambienEsNuestroJardin/cover.jpg",
    author: "Adriana Rose",
    status: "published",
    tags: ["Territorio", "Mar", "Baja California", "Ensenada", "Productores"],
    createdAt: "2026-02-22T09:00:00Z",
    updatedAt: "2026-02-23T10:00:00Z",
    publishedAt: "2026-02-23T10:00:00Z",
  },
  {
    id: "cocinar-el-territorio-baja-001",
    title: {
      es: "Cocinando el territorio de Baja California",
      en: "Cooking the Territory of Baja California",
    },
    slug: "2026-01-25-cooking-the-territory-of-baja-california",
    excerpt: {
      es: "Un menú nace del diálogo entre origen y libertad. Así se construye cada plato en Olivea.",
      en: "A menu born from the dialogue between origin and freedom. This is how each plate is built at Olivea.",
    },
    body: {
      es: "<p>Ensayo del Chef Daniel Nates sobre la filosofía culinaria de Olivea.</p>",
      en: "<p>Essay by Chef Daniel Nates on Olivea's culinary philosophy.</p>",
    },
    coverImage: "/images/journal/modern-garden-rooted-hospitality.avif",
    author: "Daniel Nates",
    status: "published",
    tags: ["Gastronomía", "Territorio", "Baja California", "Huerto"],
    createdAt: "2026-01-25T08:00:00Z",
    updatedAt: "2026-01-25T08:00:00Z",
    publishedAt: "2026-01-25T08:00:00Z",
  },
  {
    id: "garden-rooted-hospitality-001",
    title: {
      es: "Así se construye la hospitalidad contemporánea con raíz en el huerto",
      en: "This Is How Modern Garden-Rooted Hospitality Is Built",
    },
    slug: "2026-01-05-modern-garden-rooted-hospitality",
    excerpt: {
      es: "Olivea como un caso vivo: sistemas, decisiones y ritmos que nacen en el huerto.",
      en: "Olivea as a living case study: systems, decisions, and rhythms that begin in the garden.",
    },
    body: {
      es: "<p>Ensayo fundacional sobre la hospitalidad del huerto.</p>",
      en: "<p>Foundational essay on garden hospitality.</p>",
    },
    coverImage: "/images/journal/seasonal-garden.avif",
    author: "Adriana Rose",
    status: "published",
    tags: ["Hospitalidad", "Huerto", "Sistemas", "Sostenibilidad"],
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-01-05T14:00:00Z",
    publishedAt: "2026-01-05T14:00:00Z",
  },
];

// ── Quick nav items for dashboard ──
export const quickActions = [
  { label: "Page content", href: "/admin/pages", icon: "layout" },
  { label: "New journal post", href: "/admin/journal", icon: "pen" },
  { label: "Upload media", href: "/admin/media", icon: "image" },
] as const;
