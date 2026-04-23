// lib/auth/session.ts
// ─────────────────────────────────────────────────────────────────────
// Server-side session helpers for admin pages and server actions.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { createClient } from "./supabase-server";
import { selectOne } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import type { AdminUser, AdminRole, SectionPermissions } from "./types";

/**
 * Get the current authenticated admin user.
 * Returns null if not logged in or no admin profile exists.
 */
export async function getSession(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Look up admin profile
  const profile = await selectOne<{
    id: string;
    full_name: string;
    email: string;
    role: AdminRole;
    avatar_url: string | null;
    last_active_at: string | null;
    created_at: string;
    section_permissions: Record<string, string> | null;
  }>("admin_users", user.id, { role: "service_role" });

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    avatarUrl: profile.avatar_url ?? undefined,
    lastActiveAt: profile.last_active_at ?? undefined,
    createdAt: profile.created_at,
    sectionPermissions: (profile.section_permissions as SectionPermissions | null) ?? undefined,
  };
}

/**
 * Require an authenticated admin session.
 * Redirects to /admin/login if not authenticated.
 */
export async function requireSession(): Promise<AdminUser> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Require a specific role level.
 * Redirects to /admin if the user doesn't have sufficient privileges.
 */
export async function requireRole(requiredRole: AdminRole): Promise<AdminUser> {
  const session = await requireSession();
  const hierarchy: AdminRole[] = ["owner", "manager", "editor", "host"];
  const userLevel = hierarchy.indexOf(session.role);
  const requiredLevel = hierarchy.indexOf(requiredRole);

  if (userLevel > requiredLevel) {
    redirect("/admin?error=insufficient_permissions");
  }
  return session;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
