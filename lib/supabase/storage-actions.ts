// lib/supabase/storage-actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for image upload and management from admin editors.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { uploadFile, deleteFile, storagePublicUrl, VIDEO_BUCKET } from "./storage";
import { isSupabaseConfigured } from "./config";

async function requireEditor() {
  if (!isSupabaseConfigured) return;
  const { requireRole } = await import("@/lib/auth/session");
  await requireRole("editor");
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

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowed.includes(file.type)) {
      return { url: "", error: `File type ${file.type} not allowed. Use JPEG, PNG, WebP, SVG, or GIF.` };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { url: "", error: "File too large. Maximum 5MB." };
    }

    // Generate a clean filename: timestamp-originalname
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")           // remove extension
      .replace(/[^a-zA-Z0-9_-]/g, "-")   // sanitize
      .replace(/-+/g, "-")               // collapse dashes
      .substring(0, 60);                  // limit length
    const timestamp = Date.now();
    const path = `${folder}/${timestamp}-${safeName}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { publicUrl } = await uploadFile(path, bytes, file.type, { upsert: true });

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
    await requireEditor();
    // Extract path from URL: .../storage/v1/object/public/site-images/folder/file.jpg
    const marker = "/storage/v1/object/public/site-images/";
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) {
      return { error: "Not a valid storage URL" };
    }
    const path = publicUrl.slice(idx + marker.length);
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

/**
 * Upload a short looping video.
 * Expects: formData.get("file") as File, formData.get("folder") as string
 */
export async function uploadVideo(
  formData: FormData
): Promise<{ url: string; error?: string }> {
  try {
    await requireEditor();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "general";
    const folder =
      rawFolder
        .replace(/\.\./g, "")
        .replace(/[^a-zA-Z0-9_/-]/g, "-")
        .replace(/^\/+|\/+$/g, "") || "general";

    if (!file || !file.size) return { url: "", error: "No file provided" };

    const allowed = ["video/mp4", "video/webm"];
    if (!allowed.includes(file.type)) {
      return {
        url: "",
        error: `${file.type || "That file"} is not supported. Use MP4 or WebM.`,
      };
    }

    if (file.size > VIDEO_MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return {
        url: "",
        error: `That video is ${mb}MB. Keep loops under 12MB — trim the clip or export it smaller.`,
      };
    }

    const ext = file.type === "video/webm" ? "webm" : "mp4";
    const safeName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 60);
    const path = `${folder}/${Date.now()}-${safeName}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { publicUrl } = await uploadFile(path, bytes, file.type, {
      upsert: true,
      bucket: VIDEO_BUCKET,
    });

    return { url: publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return { url: "", error: message };
  }
}

/** Delete a video by its public URL. */
export async function deleteVideo(publicUrl: string): Promise<{ error?: string }> {
  try {
    await requireEditor();
    const marker = `/storage/v1/object/public/${VIDEO_BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return { error: "Not a valid video storage URL" };
    await deleteFile(publicUrl.slice(idx + marker.length), VIDEO_BUCKET);
    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return { error: message };
  }
}
