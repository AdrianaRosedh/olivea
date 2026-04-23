// lib/admin/require-admin-host.ts
// ─────────────────────────────────────────────────────────────────────
// Subdomain enforcement for the admin portal.
// Ensures admin routes ONLY respond on admin.oliveafarmtotable.com
// (or localhost during local development).
//
// Next.js 16 DAL pattern — enforced in server components, not middleware.
// ─────────────────────────────────────────────────────────────────────

import { headers } from "next/headers";
import { notFound } from "next/navigation";

/**
 * Allowed hostnames for the admin portal.
 * - Production: admin.oliveafarmtotable.com
 * - Local dev: localhost (any port)
 *
 * Override with ADMIN_HOSTNAME env var if needed.
 */
const ADMIN_HOSTNAME = process.env.ADMIN_HOSTNAME ?? "admin.oliveafarmtotable.com";

/**
 * Call this at the top of any admin server component or layout.
 * If the request hostname doesn't match the admin subdomain,
 * it triggers a 404 — the admin portal simply doesn't exist
 * on the main domain.
 */
export async function requireAdminHost(): Promise<void> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  // Strip port for comparison (localhost:3000 → localhost)
  const hostname = host.split(":")[0];

  // Allow localhost in development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return;
  }

  // Allow the configured admin hostname
  if (hostname === ADMIN_HOSTNAME) {
    return;
  }

  // Allow Vercel preview deployments (*.vercel.app)
  // These are used for PR previews and branch deploys
  if (host.endsWith(".vercel.app")) {
    return;
  }

  // Any other hostname → admin doesn't exist here
  notFound();
}
