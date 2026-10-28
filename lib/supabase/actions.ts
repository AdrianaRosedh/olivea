// lib/supabase/actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for admin content editors.
// All writes use service_role key (bypasses RLS).
// ─────────────────────────────────────────────────────────────────────
"use server";

import { selectRows, selectOne, upsertRows, deleteRows, updateRows } from "./client";
import { newFaqId } from "@/lib/seo/faq";
import { asFaqTopic, type FaqTopic } from "@/lib/faqTopics";
import type { SaveResult } from "@/lib/admin/save-result";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "./config";
import { logAudit } from "@/lib/auth/audit";
import { pingIndexNowForPaths } from "@/lib/indexnow";

// ── Auth guard for write operations ────────────────────────────────
// All mutating actions verify the user has at least "editor" role.
// Settings and team actions require higher roles (checked individually).

// Without Supabase there is no database to protect, so local development
// skips the checks. Production never does: a missing configuration there is a
// broken deploy, and these actions must refuse rather than run unchecked.
function authSkipped(): boolean {
  if (isSupabaseConfigured) return false;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Admin actions are unavailable: Supabase is not configured.");
  }
  return true;
}

async function requireEditor() {
  if (authSkipped()) return;
  const { requireRole } = await import("@/lib/auth/session");
  await requireRole("editor");
}

async function requireManager() {
  if (authSkipped()) return;
  const { requireRole } = await import("@/lib/auth/session");
  await requireRole("manager");
}

// Reads are server actions too, so the browser can call them directly: every
// one needs a signed-in admin, whatever its role, before it touches the
// service-role key.
async function requireAdmin() {
  if (authSkipped()) return;
  const { requireSession } = await import("@/lib/auth/session");
  await requireSession();
}

// Per-person section permissions. The role checks above are global; an owner
// can also hide a section from someone or make it read-only (admin → Equipo).
// These actions are public endpoints, so they enforce that themselves: the UI
// hiding a page did not stop a direct call (an editor barred from Legal could
// still save it). Passes if ANY listed section grants the level, because some
// documents are edited from two places (the café menu from Café and Menus).
async function requireSections(sections: string[], min: "viewer" | "editor") {
  if (authSkipped()) return;
  const [{ requireSession }, { canAccessSection }, { redirect }] = await Promise.all([
    import("@/lib/auth/session"),
    import("@/lib/auth/types"),
    import("next/navigation"),
  ]);
  const session = await requireSession();
  if (!sections.some((key) => canAccessSection(session.role, key, min, session.sectionPermissions))) {
    redirect("/admin?error=section_forbidden");
  }
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
  await requireAdmin();
  await requireSections(["content.popups"], "viewer");
  return selectRows("popups", {
    role: "service_role",
    query: "order=priority.desc,created_at.desc",
  });
}

export async function getPopup(id: string) {
  await requireAdmin();
  await requireSections(["content.popups"], "viewer");
  return selectOne("popups", id, { role: "service_role" });
}

export async function savePopup(popup: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["content.popups"], "editor");
  await upsertRows("popups", popup, { onConflict: "id" });
  await logAudit({ action: "save", resourceType: "popup", resourceId: String(popup.id ?? "") });
  revalidatePath("/api/popup");
  revalidatePath("/admin/popups");
}

export async function deletePopup(id: string) {
  await requireManager();
  await requireSections(["content.popups"], "editor");
  await deleteRows("popups", `id=eq.${encodeURIComponent(id)}`);
  await logAudit({ action: "delete", resourceType: "popup", resourceId: id });
  revalidatePath("/api/popup");
  revalidatePath("/admin/popups");
}

export async function togglePopup(id: string, enabled: boolean) {
  await requireEditor();
  await requireSections(["content.popups"], "editor");
  await updateRows("popups", `id=eq.${encodeURIComponent(id)}`, { enabled });
  await logAudit({ action: enabled ? "enable" : "disable", resourceType: "popup", resourceId: id });
  revalidatePath("/api/popup");
  revalidatePath("/admin/popups");
}

// ── Banners ─────────────────────────────────────────────────────────

export async function getBanners() {
  await requireAdmin();
  await requireSections(["content.banners"], "viewer");
  return selectRows("banners", {
    role: "service_role",
    query: "order=created_at.desc",
  });
}

export async function getBanner(id: string) {
  await requireAdmin();
  await requireSections(["content.banners"], "viewer");
  return selectOne("banners", id, { role: "service_role" });
}

export async function saveBanner(banner: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["content.banners"], "editor");
  await upsertRows("banners", banner, { onConflict: "id" });
  await logAudit({ action: "save", resourceType: "banner", resourceId: String(banner.id ?? "") });
  revalidatePath("/api/banner");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  await requireManager();
  await requireSections(["content.banners"], "editor");
  await deleteRows("banners", `id=eq.${encodeURIComponent(id)}`);
  await logAudit({ action: "delete", resourceType: "banner", resourceId: id });
  revalidatePath("/api/banner");
  revalidatePath("/admin/banners");
}

export async function toggleBanner(id: string, enabled: boolean) {
  await requireEditor();
  await requireSections(["content.banners"], "editor");
  await updateRows("banners", `id=eq.${encodeURIComponent(id)}`, { enabled });
  await logAudit({ action: enabled ? "enable" : "disable", resourceType: "banner", resourceId: id });
  revalidatePath("/api/banner");
  revalidatePath("/admin/banners");
}

// ── Casa FAQ ────────────────────────────────────────────────────────
//
// These used to read and write a `casa_faq` table. The public Casa page never
// rendered it — it fed the JSON-LD and nothing else — so every edit made in
// the Casa FAQ admin was invisible to visitors, while a different, longer FAQ
// showed on the page. The questions were merged into
// casa_content.sections[faq].items, and these actions operate on that.
//
// Entries are addressed by a stored id. They were briefly addressed by array
// position, which is only safe while nobody else is editing: if one person
// deletes a question while another has the list open, the second person's next
// save lands on whichever question slid into that slot and silently rewrites
// the wrong answer. An id refers to the same entry no matter where it moves.

type CasaFaqRow = {
  id: string;
  page: string;
  question: { es: string; en: string };
  answer: { es: string; en: string };
  topic: FaqTopic | null;
  sort_order: number;
};

type FaqStoreItem = {
  id?: string;
  q?: { es?: string; en?: string };
  a?: { es?: string; en?: string };
  /** The page groups questions by topic (lib/faqTopics). */
  topic?: FaqTopic;
};

async function readCasaSections(): Promise<Record<string, unknown>[]> {
  const rows = await selectRows<{ sections: Record<string, unknown>[] }>(
    "casa_content",
    { role: "service_role", query: "id=eq.singleton&select=sections" }
  );
  return rows[0]?.sections ?? [];
}

async function writeCasaFaqItems(items: FaqStoreItem[]): Promise<void> {
  const sections = await readCasaSections();
  const idx = sections.findIndex((s) => s?.id === "faq");
  const next = [...sections];
  if (idx >= 0) next[idx] = { ...next[idx], items };
  else next.push({ id: "faq", items });
  await updateRows("casa_content", "id=eq.singleton", { sections: next });
}

async function currentItems(): Promise<FaqStoreItem[]> {
  const sections = await readCasaSections();
  const idx = sections.findIndex((s) => s?.id === "faq");
  return idx >= 0 ? ((sections[idx] as { items?: FaqStoreItem[] }).items ?? []) : [];
}

function toRows(items: FaqStoreItem[]): CasaFaqRow[] {
  return items.map((it, i) => ({
    id: it.id ?? newFaqId(),
    page: "casa",
    question: { es: it.q?.es ?? "", en: it.q?.en ?? "" },
    answer: { es: it.a?.es ?? "", en: it.a?.en ?? "" },
    topic: asFaqTopic(it.topic) ?? null,
    sort_order: i,
  }));
}

function toItem(row: Record<string, unknown>, id: string): FaqStoreItem {
  const q = (row.question ?? {}) as { es?: string; en?: string };
  const a = (row.answer ?? {}) as { es?: string; en?: string };
  const topic = asFaqTopic(row.topic);
  return {
    id,
    q: { es: q.es ?? "", en: q.en ?? "" },
    a: { es: a.es ?? "", en: a.en ?? "" },
    ...(topic ? { topic } : {}),
  };
}

function revalidateCasa() {
  revalidatePath("/es/casa");
  revalidatePath("/en/casa");
  revalidatePath("/admin/content/casa-faq");
  revalidatePath("/admin/content/casa");
}

export async function getCasaFaq() {
  await requireAdmin();
  await requireSections(["content.casafaq"], "viewer");
  return toRows(await currentItems());
}

export async function saveCasaFaqItem(item: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["content.casafaq"], "editor");
  const items = await currentItems();
  const id = String(item.id ?? "").trim();
  const i = id ? items.findIndex((x) => x.id === id) : -1;

  if (i >= 0) {
    items[i] = toItem(item, id);
  } else {
    // Either a new question, or one someone else deleted while this editor had
    // it open. Appending is the safe reading of both: nothing else is
    // overwritten, and a re-added question is visible and removable.
    items.push(toItem(item, id || newFaqId()));
  }

  await writeCasaFaqItems(items);
  await logAudit({ action: "save", resourceType: "casa_faq", resourceId: id });
  revalidateCasa();
}

export async function deleteCasaFaqItem(id: string) {
  await requireManager();
  await requireSections(["content.casafaq"], "editor");
  const items = await currentItems();
  const next = items.filter((x) => x.id !== id);
  // A no-op means someone else already removed it — not an error worth raising.
  if (next.length !== items.length) await writeCasaFaqItems(next);
  await logAudit({ action: "delete", resourceType: "casa_faq", resourceId: id });
  revalidateCasa();
}

export async function reorderCasaFaq(order: { id: string; sort_order: number }[]) {
  await requireEditor();
  await requireSections(["content.casafaq"], "editor");
  const items = await currentItems();
  const byId = new Map(items.map((it) => [it.id, it]));

  const next: FaqStoreItem[] = [];
  for (const o of [...order].sort((a, b) => a.sort_order - b.sort_order)) {
    const hit = byId.get(o.id);
    if (hit) {
      next.push(hit);
      byId.delete(o.id);
    }
  }
  // Anything added by someone else since this list was loaded keeps its place
  // at the end rather than disappearing.
  for (const it of items) if (byId.has(it.id)) next.push(it);

  await writeCasaFaqItems(next);
  revalidateCasa();
}

// ── Careers Content ─────────────────────────────────────────────────

export async function getCareersContent() {
  await requireAdmin();
  await requireSections(["pages.careers"], "viewer");
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
  await requireSections(["pages.careers"], "editor");
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
  await requireAdmin();
  await requireSections(["pages.homepage"], "viewer");
  return selectRows("hero_videos", {
    role: "service_role",
    query: "order=created_at.desc",
  });
}

export async function saveHeroVideo(video: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["pages.homepage"], "editor");
  await upsertRows("hero_videos", video, { onConflict: "id" });
  revalidatePath("/es");
  revalidatePath("/en");
  revalidatePath("/admin/content/homepage");
}

export async function setActiveVideo(id: string) {
  await requireEditor();
  await requireSections(["pages.homepage"], "editor");
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
  await requireAdmin();
  await requireSections(["pages.homepage"], "viewer");
  return selectOne("home_content", "home", { role: "service_role" });
}

export async function saveHomeContent(data: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["pages.homepage"], "editor");
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
  | "menu_content"
  | "not_found_content"
  | "global_settings"
  | "drawer_content"
  | "footer_content"
  | "innovation_content"
  | "roseiies_content";

const pageRevalidations: Record<PageTable, string[]> = {
  farmtotable_content: ["/es/farmtotable", "/en/farmtotable"],
  casa_content: ["/es/casa", "/en/casa"],
  cafe_content: ["/es/cafe", "/en/cafe"],
  contact_content: ["/es/contact", "/en/contact"],
  sustainability_content: ["/es/sustainability", "/en/sustainability"],
  press_content: ["/es/press", "/en/press"],
  legal_content: ["/es/legal", "/en/legal"],
  team_content: ["/es/team", "/en/team"],
  menu_content: ["/es/menu", "/en/menu"],
  not_found_content: ["/es", "/en"],
  // These three feed the dictionary CMS overlay in app/(main)/[lang]/layout.tsx,
  // so they affect every page under the layout — revalidate the whole tree.
  global_settings: ["layout:/"],
  drawer_content: ["layout:/"],
  footer_content: ["layout:/"],
  innovation_content: ["/es/innovation", "/en/innovation"],
  roseiies_content: ["/es/roseiies", "/en/roseiies"],
};

// Pages built partly from ANOTHER table's content, refreshed alongside the
// table's own pages so an admin save reaches them too: the home and Menu
// search articles show each house's description, and the AI summary
// (/llms.txt) quotes their FAQs and facts. Not pinged to IndexNow — the
// edited page is.
const AI_SUMMARY = ["/llms.txt", "/llms-full.txt"];
const derivedRevalidations: Partial<Record<PageTable, string[]>> = {
  farmtotable_content: ["/es", "/en", "/es/menu", "/en/menu", ...AI_SUMMARY],
  casa_content: ["/es", "/en", ...AI_SUMMARY],
  cafe_content: ["/es", "/en", "/es/menu", "/en/menu", ...AI_SUMMARY],
  sustainability_content: AI_SUMMARY,
  team_content: AI_SUMMARY,
};

function revalidateDerived(table: PageTable) {
  for (const path of derivedRevalidations[table] ?? []) revalidatePath(path);
}

// Which sections may read / write each page document (see requireSections).
const TABLE_SECTIONS: Record<PageTable, { read: string[]; write: string[] }> = {
  farmtotable_content: { read: ["pages.farmtotable", "content.menu"], write: ["pages.farmtotable", "content.menu"] },
  cafe_content: { read: ["pages.cafe", "content.menu"], write: ["pages.cafe", "content.menu"] },
  casa_content: { read: ["pages.casa"], write: ["pages.casa"] },
  contact_content: { read: ["pages.contact"], write: ["pages.contact"] },
  sustainability_content: { read: ["pages.sustainability"], write: ["pages.sustainability"] },
  press_content: { read: ["pages.press"], write: ["pages.press"] },
  legal_content: { read: ["pages.legal"], write: ["pages.legal"] },
  team_content: { read: ["pages.team"], write: ["pages.team"] },
  menu_content: { read: ["pages.menu", "content.menu"], write: ["pages.menu", "content.menu"] },
  not_found_content: { read: ["pages.notfound"], write: ["pages.notfound"] },
  // Hours reads the settings row; it saves through saveHours (hours column only).
  global_settings: { read: ["settings.global", "settings.hours"], write: ["settings.global"] },
  drawer_content: { read: ["settings.navigation"], write: ["settings.navigation"] },
  footer_content: { read: ["settings.footer"], write: ["settings.footer"] },
  innovation_content: { read: ["pages.innovation"], write: ["pages.innovation"] },
  roseiies_content: { read: ["pages.roseiies"], write: ["pages.roseiies"] },
};

// The table name arrives from the browser; TypeScript's PageTable is not
// checked at runtime. Only these singletons may be read or written here.
function assertPageTable(table: string): asserts table is PageTable {
  if (!Object.prototype.hasOwnProperty.call(pageRevalidations, table)) {
    throw new Error("Unknown page table.");
  }
}

export async function getPageContent(table: PageTable) {
  await requireAdmin();
  assertPageTable(table);
  await requireSections(TABLE_SECTIONS[table].read, "viewer");
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

/**
 * Save a page document.
 *
 * `expectedVersion` is the `updated_at` the editor loaded. When supplied, the
 * write only lands if the row still carries that value — otherwise someone
 * saved in between, and since these editors send the whole document, going
 * ahead would replace fields this writer never opened. Callers that omit it
 * keep the previous last-write-wins behaviour.
 */
export async function savePageContent(
  table: PageTable,
  data: Record<string, unknown>,
  expectedVersion?: string | null
): Promise<SaveResult> {
  assertPageTable(table);
  // Global settings require manager role; everything else requires editor
  if (table === "global_settings") {
    await requireManager();
  } else {
    await requireEditor();
  }
  await requireSections(TABLE_SECTIONS[table].write, "editor");
  // Convert camelCase editor keys → snake_case Supabase columns
  const fieldMap = fieldMaps[table];
  const dbData = fieldMap ? camelToSnake(data, fieldMap) : data;

  if (expectedVersion) {
    // The filter is the guard: PostgREST returns the rows it touched, so an
    // empty result means the version moved between load and save. This is one
    // statement, so there is no window between checking and writing.
    const touched = await updateRows<{ updated_at: string }>(
      table,
      `id=eq.singleton&updated_at=eq.${encodeURIComponent(expectedVersion)}`,
      dbData
    );

    if (touched.length === 0) {
      const [current] = await selectRows<{ updated_at: string }>(table, {
        role: "service_role",
        query: "id=eq.singleton&select=updated_at",
      });
      return {
        ok: false,
        reason: "conflict",
        savedBy: null,
        at: current?.updated_at ?? null,
      };
    }

    await logAudit({ action: "save", resourceType: table, resourceId: "singleton" });
    for (const path of pageRevalidations[table] ?? []) {
      if (path.startsWith("layout:")) {
        revalidatePath(path.slice("layout:".length), "layout");
      } else {
        revalidatePath(path);
      }
    }
    revalidateDerived(table);
    await pingIndexNowForPaths(pageRevalidations[table] ?? []);
    return { ok: true, version: touched[0]?.updated_at ?? null };
  }

  await upsertRows(table, { id: "singleton", ...dbData }, { onConflict: "id" });
  await logAudit({ action: "save", resourceType: table, resourceId: "singleton" });
  for (const path of pageRevalidations[table] ?? []) {
    if (path.startsWith("layout:")) {
      revalidatePath(path.slice("layout:".length), "layout");
    } else {
      revalidatePath(path);
    }
  }
  revalidateDerived(table);
  // Notify IndexNow (Bing -> Copilot + ChatGPT Search) of the changed URLs.
  await pingIndexNowForPaths(pageRevalidations[table] ?? []);
  return { ok: true, version: null };
}

/**
 * Save operating hours — the one editor-writable slice of global_settings.
 *
 * Hours are operational content editors are meant to manage (settings.hours is
 * a normal editor-accessible section), but they live on the global_settings
 * singleton next to sensitive site-wide config (site name, contact info,
 * socials, OG image), so savePageContent gates that whole table at manager.
 * That left editors able to open the hours page but not save it.
 *
 * This action fixes the mismatch: it gates on the settings.hours SECTION
 * (editor+) instead of the manager role, and writes ONLY the `hours` column —
 * so an editor can update hours without being able to touch anything else on
 * that row. Revalidates the same layout tree savePageContent does.
 */
export async function saveHours(hours: unknown[]): Promise<SaveResult> {
  if (isSupabaseConfigured) {
    const { requireSectionAccess } = await import("@/lib/auth/session");
    await requireSectionAccess("settings.hours", "editor");
  }

  const touched = await updateRows<{ updated_at: string }>(
    "global_settings",
    "id=eq.singleton",
    { hours },
  );

  await logAudit({ action: "save", resourceType: "global_settings", resourceId: "singleton" });
  for (const path of pageRevalidations.global_settings ?? []) {
    if (path.startsWith("layout:")) {
      revalidatePath(path.slice("layout:".length), "layout");
    } else {
      revalidatePath(path);
    }
  }
  return { ok: true, version: touched[0]?.updated_at ?? null };
}

// ── Sustainability Sections (collection) ───────────────────────────

export async function getSustainabilitySections() {
  await requireAdmin();
  await requireSections(["pages.sustainability"], "viewer");
  return selectRows("sustainability_sections", {
    role: "service_role",
    query: "order=sort_order.asc",
  });
}

export async function saveSustainabilitySection(item: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["pages.sustainability"], "editor");
  await upsertRows("sustainability_sections", item, { onConflict: "id" });
  await logAudit({ action: "save", resourceType: "sustainability_section", resourceId: String(item.id ?? "") });
  revalidatePath("/es/sustainability");
  revalidatePath("/en/sustainability");
}

export async function deleteSustainabilitySection(id: string) {
  await requireManager();
  await requireSections(["pages.sustainability"], "editor");
  await deleteRows("sustainability_sections", `id=eq.${encodeURIComponent(id)}`);
  await logAudit({ action: "delete", resourceType: "sustainability_section", resourceId: id });
  revalidatePath("/es/sustainability");
  revalidatePath("/en/sustainability");
}

// ── Press Items (collection) ────────────────────────────────────────
// Rows in press_items are the press page's primary source (the MDX
// files remain as a fallback when the table is empty/unreachable).

const PRESS_ID_RE = /^[a-z0-9][a-z0-9-]{1,80}$/i;
function assertPressId(id: string): void {
  if (!PRESS_ID_RE.test(id)) {
    throw new Error(`Invalid press item id: ${id}`);
  }
}

// The home search article lists the awards, so it refreshes with the press page.
const PRESS_REVALIDATE = ["/es/press", "/en/press", "/es", "/en"];

function revalidatePress() {
  for (const p of PRESS_REVALIDATE) revalidatePath(p);
}

export async function getPressItemsAdmin() {
  await requireAdmin();
  await requireSections(["content.pressitems"], "viewer");
  return selectRows("press_items", {
    role: "service_role",
    query: "order=published_at.desc",
  });
}

export async function savePressItem(item: Record<string, unknown>) {
  await requireEditor();
  await requireSections(["content.pressitems"], "editor");
  assertPressId(String(item.id ?? ""));
  await upsertRows("press_items", item, { onConflict: "id" });
  await logAudit({ action: "save", resourceType: "press_item", resourceId: String(item.id) });
  revalidatePress();
  await pingIndexNowForPaths(PRESS_REVALIDATE);
}

export async function togglePressItem(id: string, enabled: boolean) {
  await requireEditor();
  await requireSections(["content.pressitems"], "editor");
  assertPressId(id);
  await updateRows("press_items", `id=eq.${encodeURIComponent(id)}`, { enabled });
  await logAudit({ action: enabled ? "enable" : "disable", resourceType: "press_item", resourceId: id });
  revalidatePress();
}

export async function deletePressItem(id: string) {
  await requireManager();
  await requireSections(["content.pressitems"], "editor");
  assertPressId(id);
  await deleteRows("press_items", `id=eq.${encodeURIComponent(id)}`);
  await logAudit({ action: "delete", resourceType: "press_item", resourceId: id });
  revalidatePress();
}
