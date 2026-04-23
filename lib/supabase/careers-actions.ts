// lib/supabase/careers-actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for the careers pipeline: job openings + applications.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  selectRows,
  insertRows,
  updateRows,
  deleteRows,
  upsertRows,
  assertUUID,
} from "@/lib/supabase/client";
import { requireSession } from "@/lib/auth/session";

// ── Types ───────────────────────────────────────────────────────────

export interface JobOpening {
  id: string;
  titleEs: string;
  titleEn: string;
  area: string;
  type: "full-time" | "part-time" | "seasonal" | "internship";
  descriptionEs: string;
  descriptionEn: string;
  requirementsEs: string;
  requirementsEn: string;
  location: string;
  status: "draft" | "live" | "closed";
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationNote {
  text: string;
  author: string;
  date: string;
}

export interface JobApplication {
  id: string;
  openingId: string | null;
  openingTitle?: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  coverNote: string;
  resumeUrl: string | null;
  status: "applied" | "reviewing" | "interview" | "offer" | "hired" | "rejected";
  notes: ApplicationNote[];
  appliedAt: string;
  updatedAt: string;
}

// ── Row types ───────────────────────────────────────────────────────

interface OpeningRow {
  id: string;
  title_es: string;
  title_en: string;
  area: string;
  type: string;
  description_es: string;
  description_en: string;
  requirements_es: string;
  requirements_en: string;
  location: string;
  status: string;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ApplicationRow {
  id: string;
  opening_id: string | null;
  name: string;
  email: string;
  phone: string;
  area: string;
  cover_note: string;
  resume_url: string | null;
  status: string;
  notes: ApplicationNote[];
  applied_at: string;
  updated_at: string;
}

// ── Mappers ─────────────────────────────────────────────────────────

function mapOpening(r: OpeningRow): JobOpening {
  return {
    id: r.id,
    titleEs: r.title_es ?? "",
    titleEn: r.title_en ?? "",
    area: r.area ?? "",
    type: (r.type as JobOpening["type"]) ?? "full-time",
    descriptionEs: r.description_es ?? "",
    descriptionEn: r.description_en ?? "",
    requirementsEs: r.requirements_es ?? "",
    requirementsEn: r.requirements_en ?? "",
    location: r.location ?? "Valle de Guadalupe",
    status: (r.status as JobOpening["status"]) ?? "draft",
    sortOrder: r.sort_order ?? 0,
    publishedAt: r.published_at ?? null,
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? new Date().toISOString(),
  };
}

function mapApplication(r: ApplicationRow, openingTitle?: string): JobApplication {
  return {
    id: r.id,
    openingId: r.opening_id ?? null,
    openingTitle,
    name: r.name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    area: r.area ?? "",
    coverNote: r.cover_note ?? "",
    resumeUrl: r.resume_url ?? null,
    status: (r.status as JobApplication["status"]) ?? "applied",
    notes: Array.isArray(r.notes) ? r.notes : [],
    appliedAt: r.applied_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? new Date().toISOString(),
  };
}

// ── Job Openings CRUD ───────────────────────────────────────────────

export async function getJobOpenings(): Promise<JobOpening[]> {
  await requireSession();
  if (!isSupabaseConfigured) return [];
  try {
    const rows = await selectRows<OpeningRow>("job_openings", {
      role: "service_role",
      query: "order=sort_order.asc,created_at.desc",
    });
    return rows.map(mapOpening);
  } catch (e) {
    console.error("[careers] Failed to fetch openings:", e);
    return [];
  }
}

export async function saveJobOpening(opening: Partial<JobOpening> & { id?: string }): Promise<JobOpening | null> {
  await requireSession();
  if (!isSupabaseConfigured) return null;

  const row: Record<string, unknown> = {
    title_es: opening.titleEs ?? "",
    title_en: opening.titleEn ?? "",
    area: opening.area ?? "",
    type: opening.type ?? "full-time",
    description_es: opening.descriptionEs ?? "",
    description_en: opening.descriptionEn ?? "",
    requirements_es: opening.requirementsEs ?? "",
    requirements_en: opening.requirementsEn ?? "",
    location: opening.location ?? "Valle de Guadalupe",
    status: opening.status ?? "draft",
    sort_order: opening.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (opening.status === "live" && !opening.publishedAt) {
    row.published_at = new Date().toISOString();
  }

  if (opening.id) {
    assertUUID(opening.id, "openingId");
    row.id = opening.id;
  }

  const [saved] = await upsertRows<OpeningRow>("job_openings", row, { onConflict: "id" });
  return saved ? mapOpening(saved) : null;
}

export async function deleteJobOpening(id: string): Promise<void> {
  await requireSession();
  assertUUID(id, "openingId");
  if (!isSupabaseConfigured) return;
  await deleteRows("job_openings", `id=eq.${id}`);
}

export async function toggleJobOpeningStatus(id: string, status: "draft" | "live" | "closed"): Promise<void> {
  await requireSession();
  assertUUID(id, "openingId");
  if (!isSupabaseConfigured) return;
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "live") updates.published_at = new Date().toISOString();
  await updateRows("job_openings", `id=eq.${id}`, updates);
}

// ── Job Applications ────────────────────────────────────────────────

export async function getJobApplications(): Promise<JobApplication[]> {
  await requireSession();
  if (!isSupabaseConfigured) return [];
  try {
    // Fetch applications and openings in parallel
    const [appRows, openingRows] = await Promise.all([
      selectRows<ApplicationRow>("job_applications", {
        role: "service_role",
        query: "order=applied_at.desc",
      }),
      selectRows<{ id: string; title_es: string }>("job_openings", {
        role: "service_role",
        query: "select=id,title_es",
      }),
    ]);
    const openingMap = new Map(openingRows.map((o) => [o.id, o.title_es]));
    return appRows.map((r) => mapApplication(r, r.opening_id ? openingMap.get(r.opening_id) : undefined));
  } catch (e) {
    console.error("[careers] Failed to fetch applications:", e);
    return [];
  }
}

export async function updateApplicationStatus(
  id: string,
  status: JobApplication["status"]
): Promise<void> {
  await requireSession();
  assertUUID(id, "applicationId");
  if (!isSupabaseConfigured) return;
  const validStatuses = ["applied", "reviewing", "interview", "offer", "hired", "rejected"];
  if (!validStatuses.includes(status)) throw new Error(`Invalid status: ${status}`);
  await updateRows("job_applications", `id=eq.${id}`, {
    status,
    updated_at: new Date().toISOString(),
  });
}

export async function addApplicationNote(
  id: string,
  note: { text: string; author: string }
): Promise<void> {
  await requireSession();
  assertUUID(id, "applicationId");
  if (!isSupabaseConfigured) return;

  // Fetch current notes, append new one
  const [app] = await selectRows<{ notes: ApplicationNote[] }>("job_applications", {
    role: "service_role",
    query: `id=eq.${id}&select=notes`,
    single: true,
  });
  const notes = Array.isArray(app?.notes) ? [...app.notes] : [];
  notes.push({ text: note.text, author: note.author, date: new Date().toISOString() });
  await updateRows("job_applications", `id=eq.${id}`, {
    notes,
    updated_at: new Date().toISOString(),
  });
}

// ── Public: submit application (no auth required) ───────────────────

export async function submitApplication(data: {
  openingId?: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  coverNote: string;
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: "Applications are not available" };

  // Validate inputs
  if (!data.name || data.name.length > 200) return { error: "Name is required (max 200 chars)" };
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "A valid email is required" };
  if (data.phone && data.phone.length > 30) return { error: "Phone too long (max 30 chars)" };
  if (!data.area || data.area.length > 100) return { error: "Area is required (max 100 chars)" };
  if (data.coverNote && data.coverNote.length > 5000) return { error: "Cover note too long (max 5000 chars)" };

  const row: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    area: data.area,
    cover_note: data.coverNote,
    status: "applied",
  };
  if (data.openingId) {
    assertUUID(data.openingId, "openingId");
    row.opening_id = data.openingId;
  }

  try {
    await insertRows("job_applications", row);
    return { error: null };
  } catch (e) {
    console.error("[careers] Failed to submit application:", e);
    return { error: "Failed to submit application" };
  }
}

// ── Public: get live openings (no auth required) ────────────────────

export async function getLiveJobOpenings(): Promise<JobOpening[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const rows = await selectRows<OpeningRow>("job_openings", {
      role: "anon",
      query: "status=eq.live&order=sort_order.asc",
    });
    return rows.map(mapOpening);
  } catch {
    return [];
  }
}
