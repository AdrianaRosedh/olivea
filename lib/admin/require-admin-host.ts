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
 * Whether the admin portal may be served on this Host header. Shared by the
 * admin layout and the auth callback so the two can never disagree.
 *  - the configured admin hostname, always;
 *  - localhost variants, only in development;
 *  - *.vercel.app, only on preview deployments (a production deployment's
 *    *.vercel.app alias must not expose a second admin entrance).
 */
export function isAllowedAdminHost(host: string): boolean {
  const hostname = host.split(":")[0];
  if (hostname === ADMIN_HOSTNAME) return true;
  if (process.env.NODE_ENV !== "production" && (hostname.includes("localhost") || hostname === "127.0.0.1")) {
    return true;
  }
  return process.env.VERCEL_ENV === "preview" && hostname.endsWith(".vercel.app");
}

/**
 * Call this at the top of any admin server component or layout.
 * If the request hostname doesn't match the admin subdomain,
 * it triggers a 404 — the admin portal simply doesn't exist
 * on the main domain.
 */
export async function requireAdminHost(): Promise<void> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";

  if (isAllowedAdminHost(host)) return;

  // Any other hostname → admin doesn't exist here
  notFound();
}
