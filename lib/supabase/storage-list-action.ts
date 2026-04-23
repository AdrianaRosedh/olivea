// lib/supabase/storage-list-action.ts
// ─────────────────────────────────────────────────────────────────────
// Server action for listing files in a Supabase Storage folder.
// Separated from storage-actions.ts because listing is a distinct concern.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { listFiles, storagePublicUrl } from "./storage";
import { requireSession } from "@/lib/auth/session";

interface MediaFileItem {
  name: string;
  id: string;
  created_at: string;
  folder: string;
  publicUrl: string;
}

/**
 * List files in a storage folder. Returns items with public URLs.
 */
export async function listStorageFiles(folder: string): Promise<MediaFileItem[]> {
  await requireSession();

  // Sanitize folder
  const safeFolder = folder
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9_/-]/g, "-")
    .replace(/^\/+|\/+$/g, "")
    || "general";

  try {
    const items = await listFiles(safeFolder);

    return items
      .filter((f) => f.name && !f.name.endsWith("/")) // skip folder markers
      .map((f) => ({
        name: f.name,
        id: f.id ?? f.name,
        created_at: f.created_at ?? new Date().toISOString(),
        folder: safeFolder,
        publicUrl: storagePublicUrl(`${safeFolder}/${f.name}`),
      }));
  } catch (e) {
    console.error(`[storage] Failed to list files in ${safeFolder}:`, e);
    return [];
  }
}
