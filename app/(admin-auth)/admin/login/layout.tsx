// app/(admin-auth)/admin/login/layout.tsx
// ─────────────────────────────────────────────────────────────────────
// Standalone layout for auth pages — no dock/sidebar.
// Subdomain enforcement: login only responds on admin subdomain.
// ─────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { requireAdminHost } from "@/lib/admin/require-admin-host";

export const metadata: Metadata = {
  title: "Sign In — Olivea Admin",
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Admin login only exists on admin.oliveafarmtotable.com (or localhost)
  await requireAdminHost();

  return <>{children}</>;
}
