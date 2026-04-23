// lib/supabase/index.ts
// Barrel export for Supabase utilities

export {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  isSupabaseConfigured,
} from "./config";

export {
  selectRows,
  selectOne,
  insertRows,
  updateRows,
  upsertRows,
  deleteRows,
} from "./client";

export {
  storagePublicUrl,
  uploadFile,
  deleteFile,
  listFiles,
} from "./storage";
