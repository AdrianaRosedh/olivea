// lib/supabase/careers-submit.ts
// ─────────────────────────────────────────────────────────────────────
// Writes a job application. Deliberately NOT a "use server" module: every
// export of one is a public endpoint, and this must only run behind the
// careers form's own action (app/[lang]/(main)/carreras/actions.ts), which
// checks the bot challenge, the honeypot and the rate limits first.
// ─────────────────────────────────────────────────────────────────────

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { insertRows, assertUUID } from "@/lib/supabase/client";

/** A path uploadResume returns: a random folder and a cleaned file name. */
const RESUME_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[A-Za-z0-9._-]{1,80}\.(pdf|docx)$/;

export async function submitApplication(data: {
  openingId?: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  coverNote: string;
  /** Storage path in the private applicant-cvs bucket, never a URL. */
  resumePath?: string;
  /** Locale they applied in; the status page and emails follow it. */
  lang?: "es" | "en";
}): Promise<{ error: string | null; statusToken?: string }> {
  if (!isSupabaseConfigured) return { error: "Applications are not available" };

  // Validate inputs
  if (!data.name || data.name.length > 200) return { error: "Name is required (max 200 chars)" };
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "A valid email is required" };
  if (data.phone && data.phone.length > 30) return { error: "Phone too long (max 30 chars)" };
  if (!data.area || data.area.length > 100) return { error: "Area is required (max 100 chars)" };
  if (data.coverNote && data.coverNote.length > 5000) return { error: "Cover note too long (max 5000 chars)" };
  if (data.resumePath && (!RESUME_PATH.test(data.resumePath) || data.resumePath.includes(".."))) {
    return { error: "Invalid CV" };
  }

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
  if (data.resumePath) row.resume_url = data.resumePath;
  row.lang = data.lang === "en" ? "en" : "es";

  try {
    // The token is generated here rather than defaulted in the database so
    // the confirmation email can carry the link without a second round trip.
    const statusToken = randomStatusToken();
    row.status_token = statusToken;
    await insertRows("job_applications", row);
    return { error: null, statusToken };
  } catch (e) {
    console.error("[careers] Failed to submit application:", e);
    return { error: "Failed to submit application" };
  }
}

/** 32 random bytes, base64url — the only credential guarding a status page. */
function randomStatusToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
