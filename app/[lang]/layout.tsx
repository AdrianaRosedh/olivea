import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { getDictionary } from "./dictionaries"
import "../globals.css"
import LayoutShell from "@/components/layout/LayoutShell"
import { ReservationProvider } from "@/contexts/ReservationContext"
import { Suspense } from "react"
import AnimationManager from "@/components/animations/AnimationManager"
import StructuredData from "@/components/StructuredData"
import { headers } from "next/headers"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  preload: true,
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
  preload: true,
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return {
    title: { template: "%s | Olivea", default: "Olivea" },
    description:
      dict.metadata?.description ||
      "A farm-to-table sanctuary where nature, nourishment, and design meet.",
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: "Olivea",
      description:
        dict.metadata?.description ||
        "A farm-to-table sanctuary where nature, nourishment, and design meet.",
      images: [`/images/og-${lang}.jpg`],
      url: `https://olivea.com/${lang}`,
      type: "website",
      locale: lang,
      siteName: "Olivea",
    },
    twitter: {
      card: "summary_large_image",
      title: "Olivea",
      description:
        dict.metadata?.description ||
        "A farm-to-table sanctuary where nature, nourishment, and design meet.",
      images: [`/images/twitter-${lang}.jpg`],
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
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const hdr = await headers()
  const currentPath = new URL(
    hdr.get("x-nextjs-pathname") || `/`,
    "https://olivea.com"
  ).pathname
  const isHome = currentPath === `/${lang}`

  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <StructuredData lang={lang} />

        <ReservationProvider lang={lang}>
          <AnimationManager>
            <Suspense>
              {isHome ? (
                children
              ) : (
                <LayoutShell lang={lang}>{children}</LayoutShell>
              )}
            </Suspense>
          </AnimationManager>
        </ReservationProvider>
      </body>
    </html>
  )
}