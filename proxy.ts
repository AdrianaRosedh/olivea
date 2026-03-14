// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildCsp, type CspFlags } from "@/lib/csp";

const locales = ["en", "es"] as const;
const defaultLocale = "es";
const isDev = process.env.NODE_ENV !== "production";

/** Try cookie, then Accept-Language, else default */
type Locale = (typeof locales)[number];

function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const accept = request.headers.get("accept-language");
  if (accept) {
    const preferred = accept.split(",")[0]?.split("-")[0]?.toLowerCase();
    if (preferred && isLocale(preferred)) return preferred;
  }
  return defaultLocale;
}

/**
 * Detect link preview scrapers and AI crawlers.
 * These get rewritten (not redirected) so they see OG tags at the root URL.
 */
const BOT_UA_RE =
  /facebookexternalhit|Facebot|WhatsApp|Twitterbot|Slackbot|Discordbot|LinkedInBot|TelegramBot|SkypeUriPreview|Pinterest|BitlyBot|Google-InspectionTool|Googlebot|bingbot|GPTBot|ChatGPT-User|ClaudeBot|Claude-Web|Bytespider|Amazonbot|Applebot|PetalBot|YandexBot|Baiduspider|DuckDuckBot|Embedly|Quora Link Preview|Redditbot|Rogerbot|Showyoubot|vkShare|W3C_Validator/i;

function isPreviewScraper(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") || "";
  return BOT_UA_RE.test(ua);
}

/** Paths that should bypass locale redirect / header munging */
function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/j") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

function applySecurityHeaders(res: NextResponse, flags: CspFlags) {
  res.headers.set("Content-Security-Policy", buildCsp(flags));
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), magnetometer=(), gyroscope=()"
  );

  if (!isDev) {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return res;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const originalPath = url.pathname;
  const pathNoTrailing = originalPath.replace(/\/+$/, "") || "/";

  // 1) Special pages bypass locale redirect
  if (pathNoTrailing === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: true,
      allowCloudbedsPage: true,
      allowLocatorPage: false,
    });
  }

  if (pathNoTrailing === "/olivea-locator") {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: true,
      allowCloudbedsPage: false,
      allowLocatorPage: true,
    });
  }

  // 2) Static/public bypass locale logic
  if (isStaticPath(pathNoTrailing)) {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: false,
      allowCloudbedsPage: false,
      allowLocatorPage: false,
    });
  }

  // 3) Locale prefix check
  const hasPrefix = locales.some(
    (loc) => pathNoTrailing === `/${loc}` || pathNoTrailing.startsWith(`/${loc}/`)
  );

  let response: NextResponse;

  if (!hasPrefix) {
    const locale = getLocale(request);
    const target = `/${locale}${pathNoTrailing === "/" ? "" : pathNoTrailing}`;

    if (isPreviewScraper(request)) {
      response = NextResponse.rewrite(new URL(target, request.url));
    } else {
      response = NextResponse.redirect(new URL(target, request.url));
    }
  } else {
    response = NextResponse.next();
  }

  return applySecurityHeaders(response, {
    allowEmbeddingSelf: false,
    allowCloudbedsPage: true,
    allowLocatorPage: false,
  });
}

export const config = {
  matcher: "/:path*",
};
