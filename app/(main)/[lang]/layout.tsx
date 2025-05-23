// app/(main)/[lang]/layout.tsx
"use client"

import { Suspense, useState, useEffect, type ReactNode } from "react"
import StructuredData from "@/components/seo/StructuredData"
import LayoutShell from "@/components/layout/LayoutShell"
import { AppProviders } from "@/app/providers"
import { loadLocale } from "@/lib/i18n"
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries"

interface LangLayoutProps {
  children: ReactNode
  /**
   * In a client component layout, Next now passes `params` 
   * as a Promise of the actual object.
   */
  params: Promise<{ lang: string }>
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  // state will hold exactly what loadLocale returns
  const [langData, setLangData] = useState<{
    lang: Lang
    dict: AppDictionary
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      // 1️⃣ Await the params promise to extract the raw lang
      const { lang: rawLang } = await params

      // 2️⃣ Call your existing loadLocale helper
      const { lang, dict } = await loadLocale({ lang: rawLang })

      // 3️⃣ Now set state with the properly typed result
      setLangData({ lang, dict })
    })()
  }, [params])

  // still showing a client‐side loading state while we hydrate
  if (!langData) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  const { lang, dict } = langData

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading…
        </div>
      }
    >
      {/* 4️⃣ SEO JSON-LD */}
      <StructuredData lang={lang} />

      {/* 5️⃣ Wrap everything in your global providers + shell */}
      <AppProviders>
        <LayoutShell lang={lang} dictionary={dict}>
          {children}
        </LayoutShell>
      </AppProviders>
    </Suspense>
  )
}