// lib/supabase/content-actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for journal content — fetch and mutate journal posts
// from Supabase with mock-data fallback when unconfigured.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { selectRows, updateRows, upsertRows, assertUUID } from "@/lib/supabase/client";
import { requireSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/auth/audit";
import type { JournalPost, JournalStatus } from "@/lib/content/types";

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
  await logAudit({
    action: "save",
    resourceType: "journal_post",
    resourceId: post.id,
    metadata: { slug: post.slug, status: post.status },
  });
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
  await logAudit({ action: "publish", resourceType: "journal_post", resourceId: id });
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
  await logAudit({ action: "unpublish", resourceType: "journal_post", resourceId: id });
}
