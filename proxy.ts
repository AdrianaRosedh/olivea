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

/** Detect link preview scrapers (WhatsApp/Meta + common unfurl bots) */
function isPreviewScraper(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") || "";
  return /facebookexternalhit|Facebot|WhatsApp|Twitterbot|Slackbot|Discordbot|LinkedInBot|TelegramBot|SkypeUriPreview|Pinterest|BitlyBot|Google-InspectionTool/i.test(
    ua
  );
}

/** Paths that should bypass locale redirect / header munging */
function isStaticPath(path: string): boolean {
  return (
    path.startsWith("/j") ||
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/manifest.webmanifest" ||
    /\.[a-z0-9]+$/i.test(path)
  );
}

/** Build a CSP tuned to route needs */
function buildCsp({
  allowEmbeddingSelf,
  allowCloudbedsPage,
  allowLocatorPage,
}: {
  allowEmbeddingSelf: boolean;
  allowCloudbedsPage: boolean;
  allowLocatorPage: boolean;
}) {
  const scriptUnsafeEval = isDev ? " 'unsafe-eval'" : "";
  const wasmUnsafeEval = allowLocatorPage ? " 'wasm-unsafe-eval'" : "";
  const frameAncestors = allowEmbeddingSelf ? " 'self'" : " 'none'";

  const cloudbedsConnectExtra = allowCloudbedsPage
    ? " https://clientstream.launchdarkly.com https://events.launchdarkly.com https://tile.openstreetmap.org"
    : "";

  const cloudbedsImgExtra = allowCloudbedsPage
    ? " https://tile.openstreetmap.org https://*.cloudbeds.com https://lh3.googleusercontent.com"
    : "";

  // ✅ Add www.gstatic.com for locator
  const locatorScriptExtra = allowLocatorPage
    ? " https://ajax.googleapis.com https://maps.googleapis.com https://maps.gstatic.com https://www.gstatic.com"
    : "";

  // ✅ Add www.gstatic.com for locator
  const locatorConnectExtra = allowLocatorPage
    ? " https://maps.googleapis.com https://places.googleapis.com https://maps.gstatic.com https://www.gstatic.com"
    : "";

  // ✅ Add maps.googleapis.com + www.gstatic.com for locator images
  const locatorImgExtra = allowLocatorPage
    ? " https://maps.gstatic.com https://www.gstatic.com https://maps.googleapis.com https://lh3.googleusercontent.com"
    : "";

  const locatorFrameExtra = allowLocatorPage
    ? " https://www.google.com https://maps.google.com https://maps.gstatic.com"
    : "";

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `frame-ancestors${frameAncestors}`,
    "form-action 'self'",

    `connect-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://hotels.cloudbeds.com https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://*.execute-api.us-west-2.amazonaws.com https://www.canva.com https://*.canva.com${cloudbedsConnectExtra}${locatorConnectExtra}`,
    `script-src 'self' 'unsafe-inline'${scriptUnsafeEval}${wasmUnsafeEval} https://www.googletagmanager.com https://www.google-analytics.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx${locatorScriptExtra}`,

    // ✅ Allow Google Fonts stylesheet
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,

    `img-src 'self' data: blob: https://www.google-analytics.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com https://www.opentable.com.mx https://*.canva.com https://lh3.googleusercontent.com https://tile.openstreetmap.org${cloudbedsImgExtra}${locatorImgExtra}`,

    "media-src 'self' blob:",

    // ✅ Allow Google Fonts font files
    "font-src 'self' data: https://fonts.gstatic.com",

    `frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com${locatorFrameExtra}`,

    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];

  return directives.join("; ");
}

function applySecurityHeaders(
  res: NextResponse,
  opts: {
    allowEmbeddingSelf: boolean;
    allowCloudbedsPage: boolean;
    allowLocatorPage: boolean;
  }
) {
  res.headers.set("Content-Security-Policy", buildCsp(opts));
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

// ⬇️ renamed from `middleware` to `proxy`
export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const originalPath = url.pathname;
  const pathNoTrailing = originalPath.replace(/\/+$/, "") || "/";

  // 1) Cloudbeds immersive iframe page
  if (pathNoTrailing === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: true,
      allowCloudbedsPage: true,
      allowLocatorPage: false,
    });
  }

  // 1b) Locator route: must be embeddable by self + allow WASM/Google scripts
  if (pathNoTrailing === "/olivea-locator") {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: true,
      allowCloudbedsPage: false,
      allowLocatorPage: true,
    });
  }

  // 2) Bypass locale redirects for static/assets/api
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

    // ✅ KEY FIX:
    // Scrapers must get 200 HTML (rewrite) so they can read OG tags.
    // Humans keep redirect so canonical locale URLs stay consistent.
    if (isPreviewScraper(request)) {
      response = NextResponse.rewrite(new URL(target, request.url));
    } else {
      response = NextResponse.redirect(new URL(target, request.url));
    }
  } else {
    response = NextResponse.next();
  }

  // 4) Apply security headers to ALL app responses
  return applySecurityHeaders(response, {
    allowEmbeddingSelf: false,
    allowCloudbedsPage: true,
    allowLocatorPage: false,
  });
}

export const config = {
  matcher: "/:path*",
};