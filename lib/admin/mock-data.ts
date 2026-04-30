// lib/admin/mock-data.ts
// Mock data layer for the admin dashboard — fallback when Supabase is offline.

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
  { label: "Journal posts", value: "4", change: "All published", trend: "neutral" },
  { label: "Team members", value: "—", trend: "neutral" },
  { label: "Active banners", value: "—", trend: "neutral" },
  { label: "Active popups", value: "—", trend: "neutral" },
];

export const recentActivity: ActivityItem[] = [
  { id: "1", user: "Adriana", action: "published", target: "Journal — Lo que la tierra ya sabe", timestamp: "1 week ago" },
  { id: "2", user: "Adriana", action: "published", target: "Journal — El Mar También es Nuestro Jardín", timestamp: "2 months ago" },
  { id: "3", user: "Chef Daniel", action: "edited", target: "Tasting menu — course 5 updated", timestamp: "5 hours ago" },
];

// ── Journal data — mirrors the published MDX articles on the live site ──
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
