import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'es']
const defaultLocale = 'es'

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  const acceptLang = request.headers.get('accept-language')
  const preferred = acceptLang?.split(',')[0].split('-')[0]
  return locales.includes(preferred!) ? preferred! : defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔥 NEW: exclude known static file requests more strictly
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|json|txt)$/)

  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (isStaticAsset || hasLocalePrefix) return

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!.*\\..*|_next|api).*)'], // still needed for edge optimization
}