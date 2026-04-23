// lib/supabase/storage.ts
// ─────────────────────────────────────────────────────────────────────
// Supabase Storage helpers for image upload, delete, and URL generation.
// Uses the Storage REST API — no @supabase/supabase-js dependency.
// ─────────────────────────────────────────────────────────────────────

import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./config";

const BUCKET = "site-images";

/** Public URL for a file in the site-images bucket */
export function storagePublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Upload a file to the site-images bucket (service_role only) */
export async function uploadFile(
  path: string,
  file: Uint8Array,
  contentType: string,
  opts?: { upsert?: boolean }
): Promise<{ publicUrl: string }> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": contentType,
      ...(opts?.upsert ? { "x-upsert": "true" } : {}),
    },
    body: file as unknown as BodyInit,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage upload failed (${res.status}): ${body}`);
  }

  return { publicUrl: storagePublicUrl(path) };
}

/** Delete a file from the site-images bucket (service_role only) */
export async function deleteFile(path: string): Promise<void> {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage delete failed (${res.status}): ${body}`);
  }
}

/** List files in a folder within the site-images bucket */
export async function listFiles(
  folder: string
): Promise<Array<{ name: string; id: string; created_at: string }>> {
  const url = `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prefix: folder.endsWith("/") ? folder : `${folder}/`,
      limit: 200,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Storage list failed (${res.status}): ${body}`);
  }

  return res.json();
}
