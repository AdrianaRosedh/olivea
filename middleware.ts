import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "es";

const CANVA_MENU =
  "https://www.canva.com/design/DAGWHOCI6cA/jwypGtVSSJMK3ra1ZZqfRg/view?utm_content=DAGWHOCI6cA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h053dea589d&success=true&continue_in_browser=true";

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
  const pathNoTrailing = pathname.replace(/\/+$/, ""); // normalize "/menu/"

  // --- MENU REDIRECT (runs before any other logic) ---------------------------
  if (
    pathNoTrailing === "/menu" ||
    pathNoTrailing === "/en/menu" ||
    pathNoTrailing === "/es/menu"
  ) {
    return NextResponse.redirect(CANVA_MENU, { status: 308 });
  }
  // --------------------------------------------------------------------------

  // allow Cloudbeds iframe
  if (pathNoTrailing === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    return res;
  }

  // skip assets & api
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

  // inject CSP + security headers (unchanged)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://*.canva.com",
    "style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com",
    "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com.mx https://www.opentable.com https://*.canva.com",
    "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://*.execute-api.us-west-2.amazonaws.com https://*.canva.com",
    "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

// (optional) limit middleware to relevant paths:
// export const config = { matcher: ["/((en|es)/)?menu", "/:path*"] };