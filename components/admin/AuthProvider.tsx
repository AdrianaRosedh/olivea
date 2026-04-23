// components/admin/AuthProvider.tsx
// ─────────────────────────────────────────────────────────────────────
// Client-side auth context for the admin portal.
// Provides the current user and auth methods to all admin components.
// Falls back to mockUser when Supabase is not configured (dev mode).
// ─────────────────────────────────────────────────────────────────────

"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser, AdminRole } from "@/lib/auth/types";
import { hasRole, canEdit, canDelete, canManageTeam, canAccessChat, canManageSettings } from "@/lib/auth/types";

/* ── Context shape ── */

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Permission helpers
  hasRole: (required: AdminRole) => boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canAccessChat: boolean;
  canManageSettings: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ── */

interface AuthProviderProps {
  children: React.ReactNode;
  /** Server-fetched user passed from layout — avoids client-side fetch flash */
  initialUser: AdminUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  // Keep user in sync when initialUser changes (e.g., after revalidation)
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      // Re-fetch by triggering router refresh — the layout will re-run getSession()
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSignOut = useCallback(async () => {
    // Import dynamically to avoid pulling server action into initial bundle
    const { signOut } = await import("@/lib/auth/session");
    await signOut();
  }, []);

  const value: AuthContextValue = useMemo(() => ({
    user,
    isLoading,
    signOut: handleSignOut,
    refreshUser,
    hasRole: (required: AdminRole) => user ? hasRole(user.role, required) : false,
    canEdit: user ? canEdit(user.role) : false,
    canDelete: user ? canDelete(user.role) : false,
    canManageTeam: user ? canManageTeam(user.role) : false,
    canAccessChat: user ? canAccessChat(user.role) : false,
    canManageSettings: user ? canManageSettings(user.role) : false,
  }), [user, isLoading, handleSignOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Hook ── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
