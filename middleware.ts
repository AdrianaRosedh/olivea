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
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0].split("-")[0];
    if (locales.includes(preferred)) {
      return preferred;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Cloudbeds iframe w/o redirection
  if (pathname === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // Skip locale-prefixing on assets, API, next, etc.
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    /\.([a-z0-9]+)$/.test(pathname);

  const hasLocalePrefix = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  const response =
    hasLocalePrefix || isStaticAsset
      ? NextResponse.next()
      : NextResponse.redirect(
          new URL(`/${getLocale(request)}${pathname}`, request.url)
        );

  // Strict CSP for everything else
  const csp = [
    "default-src 'self'",
    // scripts: your own + Cloudbeds + Whistle + Tock core
    "script-src    'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    // styles: your own + Whistle + Tock stylesheet
    "style-src     'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    // **CRITICAL**: allow Tock’s runtime-injected <style> blocks
    "style-src-elem 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    // fonts: Tock may load its own
    "font-src      'self' data: https://www.exploretock.com",
    // iframes (Cloudbeds, Whistle, Tock)
    "frame-src     'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    // XHR/websocket: Supabase + Cloudbeds + Whistle + Tock’s reservation & chat APIs
    "connect-src   'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com https://*.execute-api.us-west-2.amazonaws.com",
    // images: your own + Cloudbeds + Whistle + Tock
    "img-src       'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.exploretock.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/cloudbeds-immersive.html",
    "/((?!.*\\..*|_next|api).*)",
  ],
};