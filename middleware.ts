import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const locales = ["en", "es"]
const defaultLocale = "es"

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  const acceptLang = request.headers.get("accept-language")
  if (acceptLang) {
    const preferred = acceptLang.split(",")[0].split("-")[0]
    if (locales.includes(preferred)) {
      return preferred
    }
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔥 NEW: exclude known static file requests more strictly
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|json|txt)$/)

  const hasLocalePrefix = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))

  // Add Content Security Policy headers
  const response =
    hasLocalePrefix || isStaticAsset
      ? NextResponse.next()
      : NextResponse.redirect(new URL(`/${getLocale(request)}${pathname}`, request.url))

  // Add security headers
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "media-src 'self' blob:",
      "frame-src 'self'",
    ].join("; "),
  )

  // Add other security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  return response
}

export const config = {
  matcher: ["/((?!.*\\..*|_next|api).*)"], // still needed for edge optimization
}
