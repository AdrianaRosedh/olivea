// proxy.ts
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
    /\.[a-z0-9]+$/i.test(path)
  );
}

/** Build a CSP tuned to route needs */
function buildCsp({
  allowEmbeddingSelf,
  allowCloudbedsPage,
}: {
  allowEmbeddingSelf: boolean;
  allowCloudbedsPage: boolean;
}) {
  const scriptUnsafeEval = isDev ? " 'unsafe-eval'" : "";
  const frameAncestors = allowEmbeddingSelf ? "'self'" : " 'none'";

  // Extra domains only for the Cloudbeds immersive HTML page OR
  // for any page that hosts the Cloudbeds widget
  const cloudbedsConnectExtra = allowCloudbedsPage
    ? " https://clientstream.launchdarkly.com https://events.launchdarkly.com https://tile.openstreetmap.org"
    : "";

  // For the immersive/widget pages, allow OpenStreetMap + ANY Cloudbeds image host + Google image CDN
  const cloudbedsImgExtra = allowCloudbedsPage
    ? " https://tile.openstreetmap.org https://*.cloudbeds.com https://lh3.googleusercontent.com"
    : "";

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    // If allowCloudbedsPage, always allow self to embed
    `frame-ancestors${allowCloudbedsPage ? " 'self'" : frameAncestors}`,
    "form-action 'self'",

    // connect-src
    `connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://*.execute-api.us-west-2.amazonaws.com https://www.canva.com https://*.canva.com${cloudbedsConnectExtra}`,

    // script-src
    `script-src 'self' 'unsafe-inline'${scriptUnsafeEval} https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,

    // style-src
    `style-src 'self' 'unsafe-inline' https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,

    // img-src (single line, no newlines)
    `img-src 'self' data: blob: https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com https://www.opentable.com.mx https://*.canva.com https://lh3.googleusercontent.com https://tile.openstreetmap.org${cloudbedsImgExtra}`,

    "media-src 'self' blob:",
    "font-src 'self' data:",

    // iframes we embed
    "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com",

    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];

  return directives.join("; ");
}

function applySecurityHeaders(
  res: NextResponse,
  opts: { allowEmbeddingSelf: boolean; allowCloudbedsPage: boolean }
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
  const pathNoTrailing = originalPath.replace(/\/+$/, "");

  // 1) Special case: immersive iframe page (kept for backward compatibility)
  if (pathNoTrailing === "/cloudbeds-immersive.html") {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: false,
      allowCloudbedsPage: true,
    });
  }

  // 2) Bypass locale redirects for static/assets/api
  if (isStaticPath(pathNoTrailing || "/")) {
    const res = NextResponse.next();
    return applySecurityHeaders(res, {
      allowEmbeddingSelf: false,
      allowCloudbedsPage: false,
    });
  }

  // 3) Locale prefix check & redirect if missing
  const hasPrefix = locales.some(
    (loc) =>
      pathNoTrailing === `/${loc}` || pathNoTrailing.startsWith(`/${loc}/`)
  );

  let response: NextResponse;
  if (!hasPrefix) {
    const target = `/${getLocale(request)}${pathNoTrailing || "/"}`;
    response = NextResponse.redirect(new URL(target, request.url));
  } else {
    response = NextResponse.next();
  }

  // 4) Apply security headers to ALL app responses
  //    ✅ Now treat normal app pages as "Cloudbeds pages" too,
  //    so Immersive widget images & extra domains are allowed.
  return applySecurityHeaders(response, {
    allowEmbeddingSelf: false,
    allowCloudbedsPage: true,
  });
}

export const config = {
  matcher: "/:path*",
};
