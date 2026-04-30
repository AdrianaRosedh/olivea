// proxy.ts — Next.js 16 proxy (replaces deprecated middleware.ts)
// Handles: subdomain routing for admin portal + locale-less short URLs.
// Auth protection is handled server-side in the admin layout.
import { NextRequest, NextResponse } from "next/server";

/** Pick a sensible default language from Accept-Language; fall back to "es". */
function detectLang(req: NextRequest): "es" | "en" {
  const al = req.headers.get("accept-language") ?? "";
  // first segment, lowercased
  const first = al.split(",")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("en")) return "en";
  return "es";
}

const LOCALE_RE = /^\/(es|en)(?:\/|$)/;

/** Routes that exist under both `/es/...` and `/en/...` and we want to make
 *  reachable without the locale prefix (e.g., short, shareable URLs). */
const SHORT_URL_PREFIXES = [
  "/team",
  "/casa",
  "/cafe",
  "/farmtotable",
  "/journal",
  "/contact",
  "/press",
  "/sustainability",
  "/menu",
];

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

  // ── Locale-less short URLs → redirect to the user's preferred locale ──
  // e.g. /team/adriana → /es/team/adriana (or /en/... if Accept-Language is English)
  if (!pathname.startsWith("/admin") && !LOCALE_RE.test(pathname)) {
    const isShortUrl = SHORT_URL_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (isShortUrl) {
      const lang = detectLang(request);
      const url = request.nextUrl.clone();
      url.pathname = `/${lang}${pathname}`;
      // 308 (permanent) so the browser caches the rewrite for next time.
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon|images|manifest|robots|sitemap|api).*)",
  ],
};
