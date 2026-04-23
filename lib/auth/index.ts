// lib/auth/index.ts
// ─────────────────────────────────────────────────────────────────────
// Barrel export for the auth module.
// ─────────────────────────────────────────────────────────────────────

export type { AdminUser, AdminRole } from "./types";
export { ROLE_HIERARCHY, hasRole, canEdit, canDelete, canManageTeam, canAccessChat, canManageSettings } from "./types";
