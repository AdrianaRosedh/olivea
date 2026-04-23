// lib/admin/mock-user.ts
// ─────────────────────────────────────────────────────────────────────
// Mock auth layer for development when Supabase is not configured.
// Re-exports types from the real auth module for compatibility.
// ─────────────────────────────────────────────────────────────────────

import type { AdminUser, AdminRole } from "@/lib/auth/types";
export type { AdminUser, AdminRole };
export { canEdit, canManageTeam } from "@/lib/auth/types";

// Default mock user for development
export const mockUser: AdminUser = {
  id: "mock-owner-001",
  fullName: "Adriana Rose",
  email: "rose@roseiies.com",
  role: "owner",
};
