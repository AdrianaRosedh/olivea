// lib/supabase/content-actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for wines, drinks, spirits, and journal — fetching
// real data from Supabase with fallback to mock data.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { selectRows, updateRows, deleteRows, upsertRows, assertUUID } from "@/lib/supabase/client";
import { requireSession } from "@/lib/auth/session";
import type { WineItem, DrinkItem, JournalPost, JournalStatus } from "@/lib/content/types";

// ── Wine helpers ─────────────────────────────────────────────────────

interface WineRow {
  id: string;
  category: string;
  name: string;
  winery: string;
  grape: string | null;
  year: number | null;
  price_glass: number | null;
  price_bottle: number | null;
  tags: string[] | null;
  available: boolean;
  sort_order: number;
}

function mapWineRow(r: WineRow): WineItem {
  return {
    id: r.id ?? "",
    category: r.category ?? "Uncategorized",
    name: r.name ?? "Unnamed",
    winery: r.winery ?? "",
    grape: r.grape ?? undefined,
    year: r.year ?? undefined,
    priceGlass: r.price_glass ?? undefined,
    priceBottle: r.price_bottle ?? undefined,
    tags: r.tags ?? [],
    available: r.available ?? true,
    sortOrder: r.sort_order ?? 0,
  };
}

export async function getWines(): Promise<WineItem[]> {
  await requireSession();
  if (!isSupabaseConfigured) {
    const { mockWines } = await import("@/lib/admin/mock-data");
    return mockWines;
  }
  try {
    const rows = await selectRows<WineRow>("wines", {
      role: "service_role",
      query: "order=category.asc,sort_order.asc",
    });
    return rows.map(mapWineRow);
  } catch (e) {
    console.error("[content-actions] Failed to fetch wines:", e);
    const { mockWines } = await import("@/lib/admin/mock-data");
    return mockWines;
  }
}

export async function getWineCategories(): Promise<string[]> {
  await requireSession();
  if (!isSupabaseConfigured) {
    const { wineCategories } = await import("@/lib/admin/mock-data");
    return [...wineCategories];
  }
  try {
    const rows = await selectRows<{ category: string }>("wines", {
      role: "service_role",
      query: "select=category",
    });
    const cats = [...new Set(rows.map((r) => r.category))];
    return cats.length > 0 ? cats : [...(await import("@/lib/admin/mock-data")).wineCategories];
  } catch {
    const { wineCategories } = await import("@/lib/admin/mock-data");
    return [...wineCategories];
  }
}

// ── Drink helpers ────────────────────────────────────────────────────

interface DrinkRow {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number | null;
  tags: string[] | null;
  available: boolean;
  sort_order: number;
}

function mapDrinkRow(r: DrinkRow): DrinkItem {
  return {
    id: r.id ?? "",
    category: r.category ?? "Uncategorized",
    name: r.name ?? "Unnamed",
    description: r.description ?? undefined,
    price: r.price ?? undefined,
    tags: r.tags ?? [],
    available: r.available ?? true,
    sortOrder: r.sort_order ?? 0,
  };
}

export async function getDrinks(): Promise<DrinkItem[]> {
  await requireSession();
  if (!isSupabaseConfigured) {
    const { mockDrinks } = await import("@/lib/admin/mock-data");
    return mockDrinks;
  }
  try {
    const rows = await selectRows<DrinkRow>("drinks", {
      role: "service_role",
      query: "order=category.asc,sort_order.asc",
    });
    return rows.map(mapDrinkRow);
  } catch (e) {
    console.error("[content-actions] Failed to fetch drinks:", e);
    const { mockDrinks } = await import("@/lib/admin/mock-data");
    return mockDrinks;
  }
}

export async function getDrinkCategories(): Promise<string[]> {
  await requireSession();
  if (!isSupabaseConfigured) {
    const { drinkCategories } = await import("@/lib/admin/mock-data");
    return [...drinkCategories];
  }
  try {
    const rows = await selectRows<{ category: string }>("drinks", {
      role: "service_role",
      query: "select=category",
    });
    const cats = [...new Set(rows.map((r) => r.category))];
    return cats.length > 0 ? cats : [...(await import("@/lib/admin/mock-data")).drinkCategories];
  } catch {
    const { drinkCategories } = await import("@/lib/admin/mock-data");
    return [...drinkCategories];
  }
}

// ── Journal helpers ──────────────────────────────────────────────────

interface JournalRow {
  id: string;
  title_es: string;
  title_en: string;
  slug: string;
  excerpt_es: string;
  excerpt_en: string;
  body_es: string;
  body_en: string;
  cover_image: string | null;
  cover_alt: string | null;
  author: string;
  authors: { id?: string; name: string }[] | null;
  gallery: { src: string; alt: string }[] | null;
  status: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

function mapJournalRow(r: JournalRow): JournalPost {
  const status = (["draft", "published", "archived"].includes(r.status) ? r.status : "draft") as JournalPost["status"];
  return {
    id: r.id ?? "",
    title: { es: r.title_es ?? "", en: r.title_en ?? "" },
    slug: r.slug ?? "",
    excerpt: { es: r.excerpt_es ?? "", en: r.excerpt_en ?? "" },
    body: { es: r.body_es ?? "", en: r.body_en ?? "" },
    coverImage: r.cover_image ?? undefined,
    coverAlt: r.cover_alt ?? undefined,
    author: r.author ?? "Unknown",
    authors: Array.isArray(r.authors) && r.authors.length > 0 ? r.authors : undefined,
    gallery: Array.isArray(r.gallery) && r.gallery.length > 0 ? r.gallery : undefined,
    status,
    tags: r.tags ?? [],
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? new Date().toISOString(),
    publishedAt: r.published_at ?? undefined,
  };
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  await requireSession();
  if (!isSupabaseConfigured) {
    const { mockJournalPosts } = await import("@/lib/admin/mock-data");
    return mockJournalPosts;
  }
  try {
    const rows = await selectRows<JournalRow>("journal_posts", {
      role: "service_role",
      query: "order=created_at.desc",
    });
    return rows.map(mapJournalRow);
  } catch (e) {
    console.error("[content-actions] Failed to fetch journal posts:", e);
    const { mockJournalPosts } = await import("@/lib/admin/mock-data");
    return mockJournalPosts;
  }
}

// ── Wine mutations ──────────────────────────────────────────────────

export async function toggleWineAvailability(id: string, available: boolean): Promise<void> {
  await requireSession();
  assertUUID(id, "wineId");
  if (!isSupabaseConfigured) return;
  await updateRows("wines", `id=eq.${id}`, { available });
}

export async function deleteWine(id: string): Promise<void> {
  await requireSession();
  assertUUID(id, "wineId");
  if (!isSupabaseConfigured) return;
  await deleteRows("wines", `id=eq.${id}`);
}

// ── Drink mutations ─────────────────────────────────────────────────

export async function toggleDrinkAvailability(id: string, available: boolean): Promise<void> {
  await requireSession();
  assertUUID(id, "drinkId");
  if (!isSupabaseConfigured) return;
  await updateRows("drinks", `id=eq.${id}`, { available });
}

export async function deleteDrink(id: string): Promise<void> {
  await requireSession();
  assertUUID(id, "drinkId");
  if (!isSupabaseConfigured) return;
  await deleteRows("drinks", `id=eq.${id}`);
}

// ── Journal mutations ───────────────────────────────────────────────

const VALID_JOURNAL_STATUSES: JournalStatus[] = ["draft", "published", "archived"];

export async function saveJournalPost(post: JournalPost): Promise<JournalPost> {
  await requireSession();
  assertUUID(post.id, "postId");
  if (!VALID_JOURNAL_STATUSES.includes(post.status)) {
    throw new Error(`Invalid journal status: ${post.status}`);
  }

  if (!isSupabaseConfigured) return post;

  // Derive legacy author string from authors array for backward compat
  const authorName = post.authors?.length
    ? post.authors.map((a) => a.name).join(", ")
    : post.author;

  const row = {
    id: post.id,
    title_es: post.title.es,
    title_en: post.title.en,
    slug: post.slug,
    excerpt_es: post.excerpt.es,
    excerpt_en: post.excerpt.en,
    body_es: post.body.es,
    body_en: post.body.en,
    cover_image: post.coverImage ?? null,
    cover_alt: post.coverAlt ?? null,
    author: authorName,
    authors: post.authors?.length ? post.authors : null,
    gallery: post.gallery?.length ? post.gallery : null,
    status: post.status,
    tags: post.tags,
    updated_at: new Date().toISOString(),
    published_at: post.publishedAt ?? null,
  };

  const [saved] = await upsertRows<JournalRow>("journal_posts", row, { onConflict: "id" });
  return saved ? mapJournalRow(saved) : post;
}

export async function publishJournalPost(id: string): Promise<void> {
  await requireSession();
  assertUUID(id, "postId");
  if (!isSupabaseConfigured) return;
  await updateRows("journal_posts", `id=eq.${id}`, {
    status: "published",
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function unpublishJournalPost(id: string): Promise<void> {
  await requireSession();
  assertUUID(id, "postId");
  if (!isSupabaseConfigured) return;
  await updateRows("journal_posts", `id=eq.${id}`, {
    status: "draft",
    published_at: null,
    updated_at: new Date().toISOString(),
  });
}
