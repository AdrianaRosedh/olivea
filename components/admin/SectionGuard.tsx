// components/admin/SectionGuard.tsx
// ─────────────────────────────────────────────────────────────────────
// Client component that enforces section-level permissions on editor
// pages.  Wraps editor content and checks the current user's access
// level before rendering.
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useAuth } from "@/components/admin/AuthProvider";
import { canAccessSection } from "@/lib/auth/types";
import type { SectionAccess } from "@/lib/auth/types";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface SectionGuardProps {
  /** Section key from ADMIN_SECTIONS, e.g. "pages.farmtotable" */
  sectionKey: string;
  /** Minimum access level required to render children (default: "viewer") */
  minAccess?: SectionAccess;
  /** The editor content to render if the user has access */
  children: React.ReactNode;
}

export default function SectionGuard({
  sectionKey,
  minAccess = "viewer",
  children,
}: SectionGuardProps) {
  const { user } = useAuth();

  // If no user (shouldn't happen — layout enforces auth), show nothing
  if (!user) return null;

  // Check section-level access
  const hasAccess = canAccessSection(
    user.role,
    sectionKey,
    minAccess,
    user.sectionPermissions
  );

  if (!hasAccess) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Shield size={48} className="mx-auto mb-4 text-[#5e7658]/20" />
          <h1 className="text-lg font-semibold text-[#2d3b29] mb-2">
            Acceso restringido
          </h1>
          <p className="text-sm text-[#6b7a65] leading-relaxed">
            No tienes permisos para ver esta sección.
            Contacta al administrador del equipo para solicitar acceso.
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
