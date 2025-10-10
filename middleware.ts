import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "es";

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0].split("-")[0];
    if (locales.includes(preferred)) return preferred;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathNoTrailing = pathname.replace(/\/+$/, "");

  // ── Special case: allow Cloudbeds iframe page ──────────────────────────────
  if (pathNoTrailing === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    // Allow same-origin embedding for this one page only
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // ── Redirect locale-less routes to preferred locale ────────────────────────
  const isStatic =
    pathNoTrailing.startsWith("/_next") ||
    pathNoTrailing.startsWith("/api") ||
    pathNoTrailing === "/favicon.ico" ||
    pathNoTrailing === "/robots.txt" ||
    /\.[a-z0-9]+$/.test(pathNoTrailing);

  const hasPrefix = locales.some(
    (loc) => pathNoTrailing === `/${loc}` || pathNoTrailing.startsWith(`/${loc}/`)
  );

  const response =
    hasPrefix || isStatic
      ? NextResponse.next()
      : NextResponse.redirect(new URL(`/${getLocale(request)}${pathNoTrailing}`, request.url));

  // ── Security headers (single source of truth) ──────────────────────────────
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    "default-src 'self'",
    // Keep 'unsafe-eval' in dev only; drop in prod for tighter CSP
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://*.canva.com`,
    "style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com",
    "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com.mx https://www.opentable.com https://*.canva.com",
    "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://*.execute-api.us-west-2.amazonaws.com https://*.canva.com",
    "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY"); // global default; the iframe page returns early above
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

// Optional: restrict middleware surface if desired
// export const config = { matcher: ["/((en|es)/)?(.*)"] };
