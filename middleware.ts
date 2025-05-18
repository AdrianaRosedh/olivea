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

  // Explicit exception for cloudbeds iframe page
  if (pathname === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // Locale-prefix redirect / static asset bypass
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

  // Build and inject strict CSP for other routes
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    // allow Tock CSS…
    "style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    // …and style elements from Tock
    "style-src-elem 'self' https://www.exploretock.com",
    // if they load fonts
    "font-src 'self' data: https://www.exploretock.com",
    // frames, connects, imgs…
    "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
    "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.exploretock.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY"); // DENY everywhere else
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/cloudbeds-immersive.html",
    "/((?!.*\\..*|_next|api).*)",
  ],
};