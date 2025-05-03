// app/[lang]/layout.tsx
import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { getDictionary, type Lang, type AppDictionary } from "./dictionaries"

import StructuredData      from "@/components/seo/StructuredData"
import LayoutShell         from "@/components/layout/LayoutShell"
import { ReservationProvider } from "@/contexts/ReservationContext"

import { ScrollProvider }  from "@/components/providers/ScrollProvider"
import ClientProviders     from "@/components/providers/ClientProviders"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang: rawLang } = await params
  const lang: Lang = rawLang === "es" ? "es" : "en"
  const dict: AppDictionary = await getDictionary(lang)

  return {
    title: { template: "%s | Olivea", default: "Olivea" },
    description: dict.metadata?.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title:       "Olivea",
      description: dict.metadata?.description,
      images:      [`/images/og-${lang}.jpg`],
      url:         `https://olivea.com/${lang}`,
      type:        "website",
      locale:      lang,
      siteName:    "Olivea",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}`,
      languages: {
        en: `https://olivea.com/en`,
        es: `https://olivea.com/es`,
      },
    },
  }
}

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#65735b",
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Lang = rawLang === "es" ? "es" : "en"
  const dict: AppDictionary = await getDictionary(lang)

  return (
    <>
      {/* 1) SEO + JSON-LD */}
      <StructuredData lang={lang} />

      {/* 2) Reservation context + modal */}
      <ReservationProvider lang={lang}>
        {/* 3) Scroll context */}
        <ScrollProvider>
          {/* 4) Client-only providers (background animation, audio, etc.) */}
          <ClientProviders>
            {/* 5) App shell (Navbar, Footer, etc.) */}
            <LayoutShell lang={lang} dictionary={dict}>
              {children}
            </LayoutShell>
          </ClientProviders>
        </ScrollProvider>
      </ReservationProvider>
    </>
  )
}