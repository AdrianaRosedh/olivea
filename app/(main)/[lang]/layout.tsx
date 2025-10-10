// app/(main)/[lang]/layout.tsx
"use client"

import { Suspense, useState, useEffect, type ReactNode } from "react"
import Head from "next/head"
import StructuredData from "@/components/seo/StructuredData"
import LayoutShell from "@/components/layout/LayoutShell"
import { AppProviders } from "@/app/providers"
import { loadLocale } from "@/lib/i18n"
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries"

interface LangLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  const [langData, setLangData] = useState<{ lang: Lang; dict: AppDictionary } | null>(null)

  useEffect(() => {
    ;(async () => {
      const { lang: rawLang } = await params
      const { lang, dict } = await loadLocale({ lang: rawLang })
      setLangData({ lang, dict })
    })()
  }, [params])

  // JS fallback prewarm (optional)
  useEffect(() => {
    const urls = ["/images/farm/hero.jpg", "/images/casa/hero.jpg", "/images/cafe/hero.jpg"]
    urls.forEach((src) => {
      const img = new Image()
      img.decoding = "async"
      img.src = src
    })
  }, [])

  if (!langData) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  const { lang, dict } = langData

  return (
    <>
      <Head>
        {/* 🔹 Preload hero images (Farm / Casa / Café) */}
        <link
          rel="preload"
          as="image"
          href="/images/farm/hero.jpg"
          type="image/jpeg"
          imageSrcSet="/images/farm/hero.jpg 1600w"
          imageSizes="(max-width: 768px) 100vw, min(1600px, calc(100vw - var(--dock-left,220px) - var(--dock-right,96px) - 48px))"
        />
        <link
          rel="preload"
          as="image"
          href="/images/casa/hero.jpg"
          type="image/jpeg"
          imageSrcSet="/images/casa/hero.jpg 1600w"
          imageSizes="(max-width: 768px) 100vw, min(1600px, calc(100vw - var(--dock-left,220px) - var(--dock-right,96px) - 48px))"
        />
        <link
          rel="preload"
          as="image"
          href="/images/cafe/hero.jpg"
          type="image/jpeg"
          imageSrcSet="/images/cafe/hero.jpg 1600w"
          imageSizes="(max-width: 768px) 100vw, min(1600px, calc(100vw - var(--dock-left,220px) - var(--dock-right,96px) - 48px))"
        />
      </Head>

      <Suspense
        fallback={<div className="h-screen flex items-center justify-center">Loading…</div>}
      >
        <StructuredData />
        <AppProviders>
          <LayoutShell lang={lang} dictionary={dict}>
            {children}
          </LayoutShell>
        </AppProviders>
      </Suspense>
    </>
  )
}