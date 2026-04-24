// lib/auth/actions.ts
// ─────────────────────────────────────────────────────────────────────
// Server actions for auth operations (login, signup, team management).
// ─────────────────────────────────────────────────────────────────────
"use server";

import { createClient, createAdminClient } from "./supabase-server";
import { selectRows, insertRows, updateRows, deleteRows, assertUUID } from "@/lib/supabase/client";
import { requireRole } from "./session";
import { revalidatePath } from "next/cache";
import type { AdminRole, SectionAccess, SectionPermissions } from "./types";
import { ADMIN_SECTIONS, SECTION_ACCESS_HIERARCHY } from "./types";

/* ── Login ── */

export async function loginWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Update last_active_at
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      assertUUID(user.id, "userId");
      await updateRows("admin_users", `id=eq.${user.id}`, {
        last_active_at: new Date().toISOString(),
      });
    } catch {
      // Non-critical — profile might not exist yet
    }
  }

  return { error: null };
}

export async function loginWithMagicLink(email: string) {
  const adminClient = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Generate magic link via Supabase Admin API (doesn't send email)
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${siteUrl}/admin/auth/callback`,
    },
  });

  if (error) {
    // If user doesn't exist in auth, show generic message (don't leak info)
    return { error: "If an account exists with this email, a magic link has been sent." };
  }

  // Send branded email via Resend
  try {
    const { sendMagicLinkEmail } = await import("@/lib/email/send");

    // Build the magic link URL pointing directly to our callback route.
    // This bypasses Supabase's redirect URL allowlist validation by
    // verifying the token server-side in our callback via verifyOtp().
    const tokenHash = data.properties?.hashed_token;
    const magicLinkUrl = tokenHash
      ? `${siteUrl}/admin/auth/callback?token_hash=${tokenHash}&type=magiclink`
      : (data.properties?.action_link ?? `${siteUrl}/admin/login`);

    await sendMagicLinkEmail({ to: email, magicLinkUrl });
  } catch (emailError) {
    console.error("[auth] Failed to send magic link email:", emailError);
    return { error: "Failed to send magic link. Please try again." };
  }

  return { error: null };
}

/* ── Team management (Owner only) ── */

export async function getTeamMembers() {
  await requireRole("owner");

  const rows = await selectRows<{
    id: string;
    full_name: string;
    email: string;
    role: AdminRole;
    avatar_url: string | null;
    last_active_at: string | null;
    created_at: string;
    section_permissions: Record<string, string> | null;
  }>("admin_users", {
    role: "service_role",
    query: "order=created_at.asc",
  });

  return rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    role: r.role,
    avatarUrl: r.avatar_url ?? undefined,
    lastActiveAt: r.last_active_at ?? undefined,
    createdAt: r.created_at,
    sectionPermissions: (r.section_permissions as SectionPermissions | null) ?? undefined,
  }));
}

export async function inviteTeamMember(email: string, role: AdminRole, fullName: string) {
  const currentUser = await requireRole("owner");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Create user via Supabase Auth admin API (service role)
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    email_confirm: true, // auto-confirm so magic link works immediately
    user_metadata: { full_name: fullName },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Failed to create user" };
  }

  // Create admin profile
  await insertRows("admin_users", {
    id: data.user.id,
    full_name: fullName,
    email,
    role,
  });

  // Generate magic link and send branded invitation via Resend
  try {
    const { data: linkData } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${siteUrl}/admin/auth/callback`,
      },
    });

    const tokenHash = linkData?.properties?.hashed_token;
    const magicLinkUrl = tokenHash
      ? `${siteUrl}/admin/auth/callback?token_hash=${tokenHash}&type=magiclink`
      : (linkData?.properties?.action_link ?? `${siteUrl}/admin/login`);

    const { sendInviteEmail } = await import("@/lib/email/send");
    await sendInviteEmail({
      to: email,
      inviteName: fullName,
      invitedByName: currentUser.fullName,
      role,
      magicLinkUrl,
    });
  } catch (emailError) {
    console.error("[auth] Failed to send invite email:", emailError);
    // User was created but email failed — non-fatal, they can use magic link later
  }

  revalidatePath("/admin/team");
  return { error: null, userId: data.user.id };
}

const VALID_ROLES: AdminRole[] = ["owner", "manager", "editor", "host"];

export async function updateTeamMemberRole(userId: string, role: AdminRole) {
  await requireRole("owner");
  assertUUID(userId, "userId");
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  await updateRows("admin_users", `id=eq.${userId}`, { role });
  revalidatePath("/admin/team");
}

const VALID_SECTION_KEYS = new Set(ADMIN_SECTIONS.map((s) => s.key));
const VALID_ACCESS_VALUES = new Set<string>(SECTION_ACCESS_HIERARCHY);

export async function updateSectionPermissions(
  userId: string,
  sectionPermissions: Record<string, string>
) {
  await requireRole("owner");
  assertUUID(userId, "userId");

  // Validate every key is a known section and every value is a valid access level
  const validated: SectionPermissions = {};
  for (const [key, value] of Object.entries(sectionPermissions)) {
    if (!VALID_SECTION_KEYS.has(key)) {
      throw new Error(`Invalid section key: ${key}`);
    }
    if (!VALID_ACCESS_VALUES.has(value)) {
      throw new Error(`Invalid access level: ${value}`);
    }
    validated[key] = value as SectionAccess;
  }

  await updateRows("admin_users", `id=eq.${userId}`, {
    section_permissions: validated,
  });
  revalidatePath("/admin/team");
}

export async function removeTeamMember(userId: string) {
  await requireRole("owner");
  assertUUID(userId, "userId");

  // Remove admin profile
  await deleteRows("admin_users", `id=eq.${userId}`);

  // Delete auth user
  const adminClient = createAdminClient();
  await adminClient.auth.admin.deleteUser(userId);

  revalidatePath("/admin/team");
}

/* ── Profile (self) ── */

export async function updateProfile(data: {
  fullName?: string;
  avatarUrl?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = {};
  if (data.fullName) updates.full_name = data.fullName;
  if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

  if (Object.keys(updates).length > 0) {
    assertUUID(user.id, "userId");
    await updateRows("admin_users", `id=eq.${user.id}`, updates);
  }

  revalidatePath("/admin");
  return { error: null };
}
