// proxy.ts — Next.js 16 proxy (replaces deprecated middleware.ts)
// Handles: subdomain routing for admin portal, locale-less short URLs, and the
// strict (nonce-based) Content-Security-Policy for the admin portal and the
// secure-document viewer. Auth protection is handled server-side in the admin
// layout.
import { NextRequest, NextResponse } from "next/server";
import { strictCsp } from "@/lib/csp";

/**
 * Admin and secure-document pages get a per-request nonce and the strict CSP
 * (lib/csp.ts). Next.js reads the policy from the *request* headers while it
 * renders and stamps the nonce on its own scripts; the same policy goes back on
 * the response for the browser to enforce. These routes are rendered per
 * request (the admin layouts read headers, /d mints a grant), which a nonce
 * requires; public pages stay static and keep STATIC_CSP from next.config.ts.
 */
function strictCspHeaders(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = strictCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  return { requestHeaders, policy };
}

function withPolicy(res: NextResponse, policy: string): NextResponse {
  res.headers.set("Content-Security-Policy", policy);
  return res;
}

/** Pages served under the strict policy (on any host). */
function isStrictPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/d" || pathname.startsWith("/d/");
}

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
  "/mesa-invitada",
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
    if (docAllowed) {
      if (!isStrictPath(pathname)) return NextResponse.next();
      const { requestHeaders, policy } = strictCspHeaders(request);
      return withPolicy(NextResponse.next({ request: { headers: requestHeaders } }), policy);
    }
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

  // API routes are shared by every host and must not be rewritten.
  if (isAdminSubdomain && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    const { requestHeaders, policy } = strictCspHeaders(request);
    return withPolicy(NextResponse.rewrite(url, { request: { headers: requestHeaders } }), policy);
  }

  if (isStrictPath(pathname)) {
    const { requestHeaders, policy } = strictCspHeaders(request);
    return withPolicy(NextResponse.next({ request: { headers: requestHeaders } }), policy);
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
    // Skip Next.js internals and static assets. NOTE: robots.txt, sitemap.xml
    // and /api are intentionally NOT skipped: on olivea.ai the proxy serves a
    // crawl-blocking robots.txt and keeps the document-only domain from
    // answering the site's APIs. On every other host the proxy just falls
    // through for them.
    "/((?!_next/static|_next/image|favicon|images|brand|manifest).*)",
  ],
};
