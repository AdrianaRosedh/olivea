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
  "/roseiies",
  "/innovation",
];

// Minimal, brand-free page shown for any non-document path on olivea.ai.
// Served directly from the proxy so it inherits NO site layout, providers,
// favicon, or the LiveGarden button.
const OLIVEA_AI_PRIVATE_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>olivea.ai</title><style>html,body{margin:0;height:100%}body{background:#171717;display:grid;place-items:center}.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.18)}</style></head><body><div class="dot"></div></body></html>`;

export default function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // ── olivea.ai: a private, document-only domain ────────────────────────
  // Only the secure document routes (/d/<token>) and the two assets they need
  // are served. Everything else — including the homepage — returns a neutral
  // private page. The public marketing site stays exclusively on
  // oliveafarmtotable.com (unaffected by this branch).
  const isOliveaAi = hostname === "olivea.ai" || hostname === "www.olivea.ai";
  if (isOliveaAi) {
    // Block ALL search-engine crawling of olivea.ai — it must never be indexed
    // or appear in search results. (Pages are also noindex; this is belt+braces.)
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    const docAllowed =
      pathname === "/d" ||
      pathname.startsWith("/d/") ||
      pathname === "/pdf.worker.min.mjs" ||
      pathname === "/documento-lock.svg";
    if (docAllowed) return NextResponse.next();
    return new NextResponse(OLIVEA_AI_PRIVATE_HTML, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

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
    // Skip Next.js internals and static assets. NOTE: robots.txt & sitemap.xml
    // are intentionally NOT skipped so the proxy can serve a crawl-blocking
    // robots.txt on olivea.ai. On every other host the proxy just falls through
    // and the app's own robots.ts / sitemap.ts generators serve as before.
    "/((?!_next/static|_next/image|favicon|images|manifest|api).*)",
  ],
};
