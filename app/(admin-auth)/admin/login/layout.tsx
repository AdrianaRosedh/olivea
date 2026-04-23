// app/(admin-auth)/admin/login/layout.tsx
// ─────────────────────────────────────────────────────────────────────
// Standalone layout for auth pages — no dock/sidebar.
// ─────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Olivea Admin",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
