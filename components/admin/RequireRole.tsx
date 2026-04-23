// components/admin/RequireRole.tsx
// ─────────────────────────────────────────────────────────────────────
// Server component that enforces role-based access on admin pages.
// Wraps children and redirects if the user lacks the required role.
// ─────────────────────────────────────────────────────────────────────

import { requireRole } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AdminRole } from "@/lib/auth/types";

interface RequireRoleProps {
  /** Minimum role required */
  role: AdminRole;
  children: React.ReactNode;
}

export default async function RequireRole({ role, children }: RequireRoleProps) {
  // In dev mode (no Supabase), skip server-side role check
  // Client-side RoleGate still provides visual enforcement
  if (isSupabaseConfigured) {
    await requireRole(role);
  }

  return <>{children}</>;
}
