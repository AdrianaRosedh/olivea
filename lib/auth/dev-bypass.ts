// lib/auth/dev-bypass.ts
// The one place that decides whether an admin action may skip its auth check.
//
// Locally, blanking NEXT_PUBLIC_SUPABASE_ANON_KEY (the `olivea-admin-preview`
// launch config) makes Supabase "unconfigured" so the admin can be exercised
// without a login. That shortcut must never exist in production: there, an
// unconfigured Supabase is a broken deployment, and the action fails instead
// of running unauthenticated.

import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function authSkipped(): boolean {
  if (isSupabaseConfigured) return false;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Admin actions are unavailable: Supabase is not configured.");
  }
  return true;
}
