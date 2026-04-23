// proxy.ts — Next.js 16 proxy (replaces deprecated middleware.ts)
// Handles: subdomain routing for admin portal
// Auth protection is handled server-side in the admin layout.
import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // ── Admin subdomain → rewrite to /admin/* routes ──
  // Matches: admin.oliveafarmtotable.com, admin.localhost:3000
  const isAdminSubdomain =
    hostname.startsWith("admin.") ||
    hostname.startsWith("admin-");

  if (isAdminSubdomain && !pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon|images|manifest|robots|sitemap|api).*)",
  ],
};
