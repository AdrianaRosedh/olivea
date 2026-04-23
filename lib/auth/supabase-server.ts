// lib/auth/supabase-server.ts
// ─────────────────────────────────────────────────────────────────────
// Server-side Supabase client for auth operations.
// Uses @supabase/ssr for cookie-based session management in Next.js.
// ─────────────────────────────────────────────────────────────────────

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/config";

/**
 * Create a Supabase client for server components / server actions.
 * Reads and writes auth cookies automatically.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can throw in server components (read-only).
          // This is expected — cookies are written in the proxy instead.
        }
      },
    },
  });
}

/**
 * Create a Supabase admin client (service role) for operations like
 * generating magic links, managing users, etc.
 * ⚠️  Never expose this client to the browser.
 */
export function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
