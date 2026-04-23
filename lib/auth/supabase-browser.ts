// lib/auth/supabase-browser.ts
// ─────────────────────────────────────────────────────────────────────
// Browser-side Supabase client for auth operations.
// Used in client components for login, logout, session listening.
// ─────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton Supabase client for browser components.
 * Cookie-based session management (no localStorage).
 */
export function createClient() {
  if (client) return client;
  client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
