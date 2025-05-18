import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "es";

function getLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && locales.includes(cookie)) return cookie;
  const accept = request.headers.get("accept-language");
  if (accept) {
    const lang = accept.split(",")[0].split("-")[0];
    if (locales.includes(lang)) return lang;
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow cloudbeds immersive to frame itself
  if (pathname === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // bypass Next.js internals & static files
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    /\.\w+$/.test(pathname);

  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  const response = hasLocale || isStatic
    ? NextResponse.next()
    : NextResponse.redirect(
        new URL(`/${getLocale(request)}${pathname}`, request.url)
      );

  // inject the **same** strict CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "style-src-elem 'self' 'unsafe-inline' https://www.exploretock.com",
    "font-src 'self' data: https://www.exploretock.com",
    "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.exploretock.com",
    "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com https://*.execute-api.us-west-2.amazonaws.com",
    "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}