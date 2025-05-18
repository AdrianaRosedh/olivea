// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "es";

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }
  const accept = request.headers.get("accept-language");
  if (accept) {
    const preferred = accept.split(",")[0].split("-")[0];
    if (locales.includes(preferred)) return preferred;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Cloudbeds iframe to be framed
  if (pathname === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // Exempt _next, api, and static assets from redirect
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.([a-z0-9]+)$/.test(pathname) ||
    ["/favicon.ico", "/robots.txt"].includes(pathname);

  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  const response = hasLocale || isStatic
    ? NextResponse.next()
    : NextResponse.redirect(
        new URL(`/${getLocale(request)}${pathname}`, request.url)
      );

  // Inject the exact same CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "style-src 'self' 'unsafe-inline' https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "style-src-elem 'self' https://www.exploretock.com",
    "font-src 'self' data: https://www.exploretock.com",
    "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.exploretock.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options",    "nosniff");
  response.headers.set("X-Frame-Options",            "DENY");
  response.headers.set("X-XSS-Protection",           "1; mode=block");
  response.headers.set("Referrer-Policy",            "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy",         "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/cloudbeds-immersive.html",
    "/((?!.*\\..*|_next|api).*)",
  ],
};