import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/
const locales = ['en', 'es']
const defaultLocale = 'es'

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get('accept-language')
  if (!acceptLang) return defaultLocale
  const preferred = acceptLang.split(',')[0].split('-')[0]
  return locales.includes(preferred) ? preferred : defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    // ignore files like /favicon.ico, /robots.txt
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.includes('/api') ||
    locales.some((locale) => pathname.startsWith(`/${locale}`))
  ) {
    return
  }

  const locale = getLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt).*)'],
}