// lib/supabase/storage-actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for image upload and management from admin editors.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { uploadFile, deleteFile, storagePublicUrl, VIDEO_BUCKET } from "./storage";
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "./config";
import {
  extensionForUploadType,
  sniffRasterImageType,
  sniffVideoType,
} from "@/lib/uploads/file-types";

async function requireEditor() {
  if (!isSupabaseConfigured) return;
  const { requireSectionAccess } = await import("@/lib/auth/session");
  await requireSectionAccess("content.media", "editor");
}

async function requireManager() {
  if (!isSupabaseConfigured) return;
  const { requireRole, requireSectionAccess } = await import("@/lib/auth/session");
  await requireSectionAccess("content.media", "editor");
  await requireRole("manager");
}

function storagePathFromPublicUrl(publicUrl: string, bucket: string): string | null {
  try {
    const url = new URL(publicUrl);
    if (!SUPABASE_URL || url.origin !== new URL(SUPABASE_URL).origin) return null;

    const marker = `/storage/v1/object/public/${bucket}/`;
    if (!url.pathname.startsWith(marker)) return null;

    const path = decodeURIComponent(url.pathname.slice(marker.length));
    if (!path || path.split("/").some((part) => !part || part === "." || part === "..")) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
}

/**
 * Upload an image from a FormData object.
 * Expects: formData.get("file") as File, formData.get("folder") as string
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(formData: FormData): Promise<{ url: string; error?: string }> {
  try {
    await requireEditor();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "general";
    // Sanitize folder to prevent path traversal
    const folder = rawFolder
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9_/-]/g, "-")
      .replace(/^\/+|\/+$/g, "")
      || "general";

    if (!file || !file.size) {
      return { url: "", error: "No file provided" };
    }

    // 4 MB: photos are compressed in the browser to well under 1 MB first, but
    // GIF/SVG pass through untouched, and Vercel refuses request bodies over
    // 4.5 MB — a 5 MB limit here could never actually be reached.
    if (file.size > 4 * 1024 * 1024) {
      return { url: "", error: "File too large. Maximum 4MB." };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detectedType = sniffRasterImageType(bytes);
    if (!detectedType) {
      return {
        url: "",
        error: "File contents are not a supported image. Use JPEG, PNG, WebP, or GIF.",
      };
    }

    // Generate a clean filename: timestamp-originalname
    const ext = extensionForUploadType(detectedType);
    const safeName = file.name
      .replace(/\.[^.]+$/, "")           // remove extension
      .replace(/[^a-zA-Z0-9_-]/g, "-")   // sanitize
      .replace(/-+/g, "-")               // collapse dashes
      .substring(0, 60);                  // limit length
    const timestamp = Date.now();
    const path = `${folder}/${timestamp}-${safeName}.${ext}`;

    const { publicUrl } = await uploadFile(path, bytes, detectedType, { upsert: true });

    return { url: publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return { url: "", error: message };
  }
}

/**
 * Delete an image by its public URL.
 * Extracts the storage path from the URL and deletes it.
 */
export async function deleteImage(publicUrl: string): Promise<{ error?: string }> {
  try {
    await requireManager();
    const path = storagePathFromPublicUrl(publicUrl, "site-images");
    if (!path) {
      return { error: "Not a valid storage URL" };
    }
    await deleteFile(path);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return { error: message };
  }
}

/**
 * Get the public URL for a storage path (convenience for server components).
 */
export async function getImageUrl(path: string): Promise<string> {
  return storagePublicUrl(path);
}

/* ── Video ──────────────────────────────────────────────────────────
   Popup loops are decoration, so the ceiling here is deliberately low.
   There is no client-side compression for video the way there is for
   images — a canvas can re-encode a photo, it cannot transcode a movie —
   so the size limit is the only guard, and it has to be enforced rather
   than merely suggested.                                              */

/** Hard ceiling for an uploaded loop. Matches the site-video bucket. */
const VIDEO_MAX_BYTES = 12 * 1024 * 1024;

function sanitizeFolder(raw: string): string {
  return (
    raw
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9_/-]/g, "-")
      .replace(/^\/+|\/+$/g, "") || "general"
  );
}

function serviceHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra,
  };
}

/**
 * Step 1 of a video upload: a one-time signed upload URL.
 *
 * Videos used to travel through this server action, and Vercel refuses any
 * request body over 4.5 MB — so the advertised 12 MB loop failed for anything
 * over ~4.5 MB with an unhelpful platform error. Now the browser uploads the
 * file straight to the bucket. The bucket itself enforces 12 MB and MP4/WebM;
 * finalizeVideoUpload() then checks the actual bytes.
 */
export async function createVideoUpload(input: {
  name: string;
  size: number;
  folder?: string;
}): Promise<{ uploadUrl?: string; path?: string; contentType?: string; error?: string }> {
  try {
    await requireEditor();
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return { error: "Storage is not configured." };

    const size = Number(input.size);
    if (!Number.isFinite(size) || size <= 0) return { error: "No file provided" };
    if (size > VIDEO_MAX_BYTES) {
      const mb = (size / 1024 / 1024).toFixed(1);
      return { error: `That video is ${mb}MB. Keep loops under 12MB — trim the clip or export it smaller.` };
    }

    const ext = /\.webm$/i.test(input.name) ? "webm" : /\.mp4$/i.test(input.name) ? "mp4" : null;
    if (!ext) return { error: "Use an MP4 or WebM file." };
    const contentType = ext === "webm" ? "video/webm" : "video/mp4";

    const safeName = String(input.name)
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 60);
    const path = `${sanitizeFolder(input.folder || "general")}/${Date.now()}-${safeName}.${ext}`;

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${VIDEO_BUCKET}/${path}`, {
      method: "POST",
      headers: serviceHeaders({ "Content-Type": "application/json" }),
      body: "{}",
      cache: "no-store",
    });
    if (!res.ok) return { error: `Could not prepare the upload (${res.status}).` };
    const data = (await res.json()) as { url?: string };
    if (!data.url) return { error: "Could not prepare the upload." };

    return { uploadUrl: `${SUPABASE_URL}/storage/v1${data.url}`, path, contentType };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed" };
  }
}

/**
 * Step 2: confirm the uploaded object really is a video (the bucket only
 * checked the declared type), and return its public URL. A file whose bytes
 * are not MP4/WebM is deleted again.
 */
export async function finalizeVideoUpload(path: string): Promise<{ url: string; error?: string }> {
  try {
    await requireEditor();
    if (
      typeof path !== "string" ||
      !/^[a-zA-Z0-9_/-]+\/\d+-[a-zA-Z0-9_-]*\.(mp4|webm)$/.test(path) ||
      path.split("/").some((p) => !p || p === "..")
    ) {
      return { url: "", error: "Invalid upload." };
    }

    const head = await fetch(`${SUPABASE_URL}/storage/v1/object/${VIDEO_BUCKET}/${path}`, {
      headers: serviceHeaders({ Range: "bytes=0-63" }),
      cache: "no-store",
    });
    if (!head.ok) return { url: "", error: "The upload did not arrive. Try again." };
    const bytes = new Uint8Array(await head.arrayBuffer());

    if (!sniffVideoType(bytes)) {
      await deleteFile(path, VIDEO_BUCKET).catch(() => {});
      return { url: "", error: "File contents are not a supported MP4 or WebM video." };
    }
    return { url: storagePublicUrl(path, VIDEO_BUCKET) };
  } catch (err) {
    return { url: "", error: err instanceof Error ? err.message : "Upload failed" };
  }
}

/** Delete a video by its public URL. */
export async function deleteVideo(publicUrl: string): Promise<{ error?: string }> {
  try {
    await requireManager();
    const path = storagePathFromPublicUrl(publicUrl, VIDEO_BUCKET);
    if (!path) return { error: "Not a valid video storage URL" };
    await deleteFile(path, VIDEO_BUCKET);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return { error: message };
  }
}
