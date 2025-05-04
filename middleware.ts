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

  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|json|txt)$/);

  const hasLocalePrefix = locales.some(
    (locale) =>
      pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  const response = hasLocalePrefix || isStaticAsset
    ? NextResponse.next()
    : NextResponse.redirect(
        new URL(`/${getLocale(request)}${pathname}`, request.url)
      );

  // build a CSP that whitelists Cloudbeds & Tock
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com",
      // allow their external CSS + inline styles
      "style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com",
      "style-src-elem 'self' 'unsafe-inline' https://hotels.cloudbeds.com",
      "img-src 'self' data: blob: https://static1.cloudbeds.com",
      "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://www.exploretock.com",
      "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
    ].join("; ");

response.headers.set("Content-Security-Policy", csp);

  // inject CSP and other security headers
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next|api).*)"],
};