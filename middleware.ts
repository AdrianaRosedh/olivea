// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"] as const;
const defaultLocale = "es";
const isDev = process.env.NODE_ENV !== "production";

/** Try cookie, then Accept-Language, else default */
function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) return cookieLocale;

  const accept = request.headers.get("accept-language");
  if (accept) {
    const preferred = accept.split(",")[0]?.split("-")[0]?.toLowerCase();
    if (preferred && locales.includes(preferred as any)) return preferred;
  }
  return defaultLocale;
}

/** Paths that should bypass locale redirect / header munging */
function isStaticPath(path: string): boolean {
  return (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/manifest.webmanifest" ||
    /\.[a-z0-9]+$/i.test(path) // any file.ext
  );
}

/** Build a CSP tuned to route needs */
function buildCsp({ allowEmbeddingSelf, allowCloudbedsPage }: { allowEmbeddingSelf: boolean; allowCloudbedsPage: boolean }) {
  // NOTE:
  // - In dev we allow 'unsafe-eval' for React Fast Refresh, etc.
  // - We prefer frame control via frame-ancestors (modern) and avoid X-Frame-Options.
  // - Add domains you actually see in DevTools console if something is blocked by CSP.

  const scriptUnsafeEval = isDev ? " 'unsafe-eval'" : "";
  const frameAncestors = allowEmbeddingSelf
    ? "'self'"
    : " 'none'"; // block other sites from embedding (clickjacking protection)

  // For the one Cloudbeds host page, we still don't want others to embed OUR site.
  // What we need is to EMBED their iframes inside our page => that's controlled by frame-src below.

  const directives = [
    "default-src 'self'",
    `base-uri 'self'`,
    `object-src 'none'`,
    // Clickjacking protection (modern replacement for X-Frame-Options)
    `frame-ancestors${allowCloudbedsPage ? " 'self'" : frameAncestors}`,
    // Only send forms to ourselves
    `form-action 'self'`,

    // Where we can open network connections (XHR/fetch/websockets)
    `connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://*.execute-api.us-west-2.amazonaws.com https://www.canva.com https://*.canva.com`,

    // Scripts we execute (keep minimal; avoid wildcards)
    `script-src 'self' 'unsafe-inline'${scriptUnsafeEval} https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,

    // Inline styles for critical CSS + vendor styles
    `style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,

    // Images (add your CDNs as needed)
    `img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com https://www.opentable.com.mx https://*.canva.com`,

    // Media (your videos/posters, blobs)
    `media-src 'self' blob:`,

    // Fonts (self-hosted; add external only if you truly use them)
    `font-src 'self' data:`,

    // Iframes we embed (their pages appear inside ours)
    `frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com`,

    // Manifest & workers
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,

    // (Optional) upgrade insecure requests if you serve any http links
    // `upgrade-insecure-requests`,
  ];

  // OpenTable often serves static JS/CSS from cdn.otstatic.com; allow it if used
  // Add domains **only if** you see CSP errors in DevTools
  // directives.push(`script-src ... cdn.otstatic.com`, `style-src ... cdn.otstatic.com`)

  return directives.join("; ");
}

/** Apply a consistent set of security headers to a response */
function applySecurityHeaders(res: NextResponse, opts: { allowEmbeddingSelf: boolean; allowCloudbedsPage: boolean }) {
  res.headers.set("Content-Security-Policy", buildCsp(opts));
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions-Policy (modern syntax)
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), magnetometer=(), gyroscope=()");
  // HSTS only in production over HTTPS
  if (!isDev) {
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  // Prefer CSP frame-ancestors; do NOT set X-Frame-Options (legacy/overlapping)
  return res;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const originalPath = url.pathname;
  const pathNoTrailing = originalPath.replace(/\/+$/, ""); // "/about/" -> "/about", "/" -> ""

  // ---- 1) Special page for Cloudbeds immersive (served as a static HTML asset) ----
  if (pathNoTrailing === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    // We allow embedding of THEIR iframes into OUR page (via frame-src in CSP),
    // but we still prevent other sites from embedding OUR page (frame-ancestors 'self').
    return applySecurityHeaders(res, { allowEmbeddingSelf: false, allowCloudbedsPage: true });
  }

  // ---- 2) Bypass locale redirects for static/assets/api ----
  if (isStaticPath(pathNoTrailing || "/")) {
    const res = NextResponse.next();
    return applySecurityHeaders(res, { allowEmbeddingSelf: false, allowCloudbedsPage: false });
  }

  // ---- 3) Locale prefix check & redirect if missing ----
  const hasPrefix = locales.some(
    (loc) => pathNoTrailing === `/${loc}` || pathNoTrailing.startsWith(`/${loc}/`)
  );

  let response: NextResponse;
  if (!hasPrefix) {
    const target = `/${getLocale(request)}${pathNoTrailing || "/"}`;
    response = NextResponse.redirect(new URL(target, request.url));
  } else {
    response = NextResponse.next();
  }

  // ---- 4) Apply security headers to ALL responses (redirects included) ----
  return applySecurityHeaders(response, { allowEmbeddingSelf: false, allowCloudbedsPage: false });
}

export const config = {
  // Run on all paths (we handle our own static exemptions above)
  matcher: "/:path*",
};
