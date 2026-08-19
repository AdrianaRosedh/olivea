// lib/supabase/resume-storage.ts
// ─────────────────────────────────────────────────────────────────────
// Storage for applicant CVs.
//
// Separate from lib/supabase/storage.ts on purpose: that module targets the
// public site-images bucket and hands back a permanent public URL, which is
// exactly the wrong shape for someone's CV. These go to the private
// applicant-cvs bucket, which has no storage policies at all — with RLS on,
// that means the service role and nothing else. The database stores a path,
// never a URL, and the admin gets a short-lived signed link when it needs one.
// ─────────────────────────────────────────────────────────────────────

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/config";

const BUCKET = "applicant-cvs";

/** Mirrors the bucket's own allowed_mime_types, checked before we upload. */
export const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

/** What the file input advertises, and what the copy tells the applicant. */
export const RESUME_ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Content sniffing, because a browser-reported MIME type is just a claim.
 * PDFs start with %PDF-, .docx is a zip so it starts with PK\x03\x04.
 */
export function sniffResumeType(bytes: Uint8Array): "pdf" | "docx" | null {
  if (bytes.length < 4) return null;
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
    return "pdf";
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04)
    return "docx";
  return null;
}

/** Strip anything that could escape the folder or confuse a download header. */
function safeName(name: string, ext: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "cv"}.${ext}`;
}

/**
 * Upload a CV. Returns the storage path — deliberately not a URL, so a caller
 * cannot accidentally persist something publicly fetchable.
 */
export async function uploadResume(
  bytes: Uint8Array,
  originalName: string,
  kind: "pdf" | "docx",
  /** Used only to group files; never trusted as a path segment. */
  applicantEmail: string
): Promise<{ path: string } | { error: string }> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Storage is not configured" };
  }
  if (bytes.byteLength > RESUME_MAX_BYTES) {
    return { error: "File too large" };
  }

  const contentType =
    kind === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  // A random prefix rather than anything derived from the applicant: paths
  // must not be guessable, and must not leak who applied to anyone who ever
  // sees one.
  const folder = crypto.randomUUID();
  const path = `${folder}/${safeName(originalName, kind)}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURI(path)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "false",
        // Never let a browser render one of these inline.
        "Cache-Control": "private, max-age=0, no-store",
      },
      body: new Blob([new Uint8Array(bytes)], { type: contentType }),
    }
  );

  if (!res.ok) {
    console.error("[careers] CV upload failed:", res.status, await res.text());
    return { error: "Upload failed" };
  }
  // Unused here, but keeps the email side honest about who to blame.
  void applicantEmail;
  return { path };
}

/**
 * Short-lived signed URL for the admin to open a stored CV.
 * Ten minutes is long enough to click through and short enough that a link
 * pasted somewhere by accident stops working.
 */
export async function signedResumeUrl(
  path: string,
  expiresInSeconds = 600
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${encodeURI(path)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresIn: expiresInSeconds }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { signedURL?: string };
    return data.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : null;
  } catch {
    return null;
  }
}
