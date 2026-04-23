// components/admin/RoleGate.tsx
// ─────────────────────────────────────────────────────────────────────
// Client-side role gate — renders children only if the user has
// the required role level. Shows an access-denied message otherwise.
// ─────────────────────────────────────────────────────────────────────

"use client";

import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";
import type { AdminRole } from "@/lib/auth/types";

interface RoleGateProps {
  /** Minimum role required to see the content */
  requiredRole: AdminRole;
  /** What to render if access is granted */
  children: React.ReactNode;
  /** Optional custom message for the access-denied screen */
  message?: string;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  manager: "Manager",
  editor: "Editor",
  host: "Host",
};

export default function RoleGate({ requiredRole, children, message }: RoleGateProps) {
  const { hasRole, user } = useAuth();

  if (!hasRole(requiredRole)) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <ShieldAlert size={40} className="mx-auto mb-4 text-[#5e7658]/25" />
        <h1 className="text-lg font-semibold text-[#2d3b29] mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-[#6b7a65] leading-relaxed">
          {message ??
            `This page requires ${ROLE_LABELS[requiredRole]} access or above.
             ${user ? `Your current role is ${ROLE_LABELS[user.role]}.` : ""}`}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
