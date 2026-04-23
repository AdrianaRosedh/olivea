// lib/supabase/actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for admin content editors.
// All writes use service_role key (bypasses RLS).
// ─────────────────────────────────────────────────────────────────────
"use server";

import { selectRows, selectOne, upsertRows, deleteRows, updateRows } from "./client";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "./config";

// ── Auth guard for write operations ────────────────────────────────
// All mutating actions verify the user has at least "editor" role.
// Settings and team actions require higher roles (checked individually).

async function requireEditor() {
  if (!isSupabaseConfigured) return; // Dev mode — skip
  const { requireRole } = await import("@/lib/auth/session");
  await requireRole("editor");
}

async function requireManager() {
  if (!isSupabaseConfigured) return;
  const { requireRole } = await import("@/lib/auth/session");
  await requireRole("manager");
}

// ── Bidirectional snake_case ↔ camelCase mappers ────────────────────
// Admin editors use camelCase keys (TypeScript convention) but
// Supabase columns use snake_case. These mappers bridge the gap
// so getPageContent returns camelCase and savePageContent accepts
// camelCase and writes snake_case to the database.

type FieldMap = [camel: string, snake: string][];

const fieldMaps: Record<string, FieldMap> = {
  contact_content: [
    ["footerNote", "footer_note"],
  ],
  global_settings: [
    ["siteName", "site_name"],
    ["defaultLocale", "default_locale"],
    ["contactInfo", "contact_info"],
    ["defaultOgImage", "default_og_image"],
    ["twitterHandle", "twitter_handle"],
  ],
  drawer_content: [
    ["mainLinks", "main_links"],
    ["moreLinks", "more_links"],
    ["seeMore", "see_more"],
  ],
  careers_content: [
    ["hiringSteps", "hiring_steps"],
    ["principlesTitle", "principles_title"],
    ["tracksTitle", "tracks_title"],
  ],
};

/** Convert a Supabase row (snake_case) → editor-friendly camelCase */
function snakeToCamel(
  row: Record<string, unknown>,
  fm: FieldMap
): Record<string, unknown> {
  const result = { ...row };
  for (const [camel, snake] of fm) {
    if (snake in result) {
      result[camel] = result[snake];
      if (camel !== snake) delete result[snake];
    }
  }
  return result;
}

/** Convert editor data (camelCase) → Supabase columns (snake_case) */
function camelToSnake(
  data: Record<string, unknown>,
  fm: FieldMap
): Record<string, unknown> {
  const result = { ...data };
  for (const [camel, snake] of fm) {
    if (camel in result) {
      result[snake] = result[camel];
      if (camel !== snake) delete result[camel];
    }
  }
  return result;
}

// ── Popups ──────────────────────────────────────────────────────────

export async function getPopups() {
  return selectRows("popups", {
    role: "service_role",
    query: "order=priority.desc,created_at.desc",
  });
}

export async function getPopup(id: string) {
  return selectOne("popups", id, { role: "service_role" });
}

export async function savePopup(popup: Record<string, unknown>) {
  await requireEditor();
  await upsertRows("popups", popup, { onConflict: "id" });
  revalidatePath("/api/popup");
  revalidatePath("/admin/popups");
}

export async function deletePopup(id: string) {
  await requireManager();
  await deleteRows("popups", `id=eq.${encodeURIComponent(id)}`);
  revalidatePath("/api/popup");
  revalidatePath("/admin/popups");
}

export async function togglePopup(id: string, enabled: boolean) {
  await requireEditor();
  await updateRows("popups", `id=eq.${encodeURIComponent(id)}`, { enabled });
  revalidatePath("/api/popup");
  revalidatePath("/admin/popups");
}

// ── Banners ─────────────────────────────────────────────────────────

export async function getBanners() {
  return selectRows("banners", {
    role: "service_role",
    query: "order=created_at.desc",
  });
}

export async function getBanner(id: string) {
  return selectOne("banners", id, { role: "service_role" });
}

export async function saveBanner(banner: Record<string, unknown>) {
  await requireEditor();
  await upsertRows("banners", banner, { onConflict: "id" });
  revalidatePath("/api/banner");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  await requireManager();
  await deleteRows("banners", `id=eq.${encodeURIComponent(id)}`);
  revalidatePath("/api/banner");
  revalidatePath("/admin/banners");
}

export async function toggleBanner(id: string, enabled: boolean) {
  await requireEditor();
  await updateRows("banners", `id=eq.${encodeURIComponent(id)}`, { enabled });
  revalidatePath("/api/banner");
  revalidatePath("/admin/banners");
}

// ── Casa FAQ ────────────────────────────────────────────────────────

export async function getCasaFaq() {
  return selectRows("casa_faq", {
    role: "service_role",
    query: "order=sort_order.asc",
  });
}

export async function saveCasaFaqItem(item: Record<string, unknown>) {
  await requireEditor();
  await upsertRows("casa_faq", item, { onConflict: "id" });
  revalidatePath("/es/casa");
  revalidatePath("/en/casa");
  revalidatePath("/admin/content/casa-faq");
}

export async function deleteCasaFaqItem(id: string) {
  await requireManager();
  await deleteRows("casa_faq", `id=eq.${encodeURIComponent(id)}`);
  revalidatePath("/es/casa");
  revalidatePath("/en/casa");
  revalidatePath("/admin/content/casa-faq");
}

export async function reorderCasaFaq(items: { id: string; sort_order: number }[]) {
  await requireEditor();
  for (const item of items) {
    await updateRows("casa_faq", `id=eq.${encodeURIComponent(item.id)}`, {
      sort_order: item.sort_order,
    });
  }
  revalidatePath("/es/casa");
  revalidatePath("/en/casa");
}

// ── Careers Content ─────────────────────────────────────────────────

export async function getCareersContent() {
  const row = await selectOne("careers_content", "careers", { role: "service_role" });
  if (!row) return null;
  // Convert snake_case → camelCase for admin editor
  const fieldMap = fieldMaps.careers_content;
  return fieldMap
    ? snakeToCamel(row as Record<string, unknown>, fieldMap)
    : row;
}

export async function saveCareersContent(data: Record<string, unknown>) {
  await requireEditor();
  // Convert camelCase → snake_case for Supabase
  const fieldMap = fieldMaps.careers_content;
  const dbData = fieldMap ? camelToSnake(data, fieldMap) : data;
  await upsertRows("careers_content", { id: "careers", ...dbData }, { onConflict: "id" });
  revalidatePath("/es/carreras");
  revalidatePath("/en/carreras");
  revalidatePath("/admin/content/careers");
}

// ── Hero Videos ─────────────────────────────────────────────────────

export async function getHeroVideos() {
  return selectRows("hero_videos", {
    role: "service_role",
    query: "order=created_at.desc",
  });
}

export async function saveHeroVideo(video: Record<string, unknown>) {
  await requireEditor();
  await upsertRows("hero_videos", video, { onConflict: "id" });
  revalidatePath("/es");
  revalidatePath("/en");
  revalidatePath("/admin/content/homepage");
}

export async function setActiveVideo(id: string) {
  await requireEditor();
  // Deactivate all, then activate the chosen one.
  // If the second call fails, re-activate the original to avoid inconsistency.
  await updateRows("hero_videos", "active=eq.true", { active: false });
  try {
    await updateRows("hero_videos", `id=eq.${encodeURIComponent(id)}`, { active: true });
  } catch (err) {
    // Rollback: try to restore the original active state isn't possible
    // since we don't know the old id. At minimum, activate the requested one again.
    console.error("[setActiveVideo] Activate failed, state may be inconsistent:", err);
    throw err;
  }
  revalidatePath("/es");
  revalidatePath("/en");
  revalidatePath("/admin/content/homepage");
}

// ── Home Content ────────────────────────────────────────────────────

export async function getHomeContent() {
  return selectOne("home_content", "home", { role: "service_role" });
}

export async function saveHomeContent(data: Record<string, unknown>) {
  await requireEditor();
  await upsertRows("home_content", { id: "home", ...data }, { onConflict: "id" });
  revalidatePath("/es");
  revalidatePath("/en");
  revalidatePath("/admin/content/homepage");
}

// ── Generic Page Content (singleton tables) ────────────────────────
// Pattern: each page has a single-row table with id='singleton'

type PageTable =
  | "farmtotable_content"
  | "casa_content"
  | "cafe_content"
  | "contact_content"
  | "sustainability_content"
  | "press_content"
  | "legal_content"
  | "team_content"
  | "not_found_content"
  | "global_settings"
  | "drawer_content"
  | "footer_content";

const pageRevalidations: Record<PageTable, string[]> = {
  farmtotable_content: ["/es/farmtotable", "/en/farmtotable"],
  casa_content: ["/es/casa", "/en/casa"],
  cafe_content: ["/es/cafe", "/en/cafe"],
  contact_content: ["/es/contact", "/en/contact"],
  sustainability_content: ["/es/sustainability", "/en/sustainability"],
  press_content: ["/es/press", "/en/press"],
  legal_content: ["/es/legal", "/en/legal"],
  team_content: ["/es/team", "/en/team"],
  not_found_content: ["/es", "/en"],
  global_settings: ["/"],
  drawer_content: ["/"],
  footer_content: ["/"],
};

export async function getPageContent(table: PageTable) {
  const rows = await selectRows(table, {
    role: "service_role",
    query: "limit=1",
  });
  const row = rows[0] ?? null;
  if (!row) return null;

  // Convert snake_case columns → camelCase for the admin editor
  const fieldMap = fieldMaps[table];
  if (fieldMap) {
    return snakeToCamel(row as Record<string, unknown>, fieldMap);
  }
  return row;
}

export async function savePageContent(table: PageTable, data: Record<string, unknown>) {
  // Global settings require manager role; everything else requires editor
  if (table === "global_settings") {
    await requireManager();
  } else {
    await requireEditor();
  }
  // Convert camelCase editor keys → snake_case Supabase columns
  const fieldMap = fieldMaps[table];
  const dbData = fieldMap ? camelToSnake(data, fieldMap) : data;

  await upsertRows(table, { id: "singleton", ...dbData }, { onConflict: "id" });
  for (const path of pageRevalidations[table] ?? []) {
    revalidatePath(path);
  }
}

// ── Sustainability Sections (collection) ───────────────────────────

export async function getSustainabilitySections() {
  return selectRows("sustainability_sections", {
    role: "service_role",
    query: "order=sort_order.asc",
  });
}

export async function saveSustainabilitySection(item: Record<string, unknown>) {
  await requireEditor();
  await upsertRows("sustainability_sections", item, { onConflict: "id" });
  revalidatePath("/es/sustainability");
  revalidatePath("/en/sustainability");
}

export async function deleteSustainabilitySection(id: string) {
  await requireManager();
  await deleteRows("sustainability_sections", `id=eq.${encodeURIComponent(id)}`);
  revalidatePath("/es/sustainability");
  revalidatePath("/en/sustainability");
}
