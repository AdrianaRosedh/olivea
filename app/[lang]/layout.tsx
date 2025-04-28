import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { getDictionary } from "./dictionaries"
import "../globals.css"
import LayoutShell from "@/components/LayoutShell"
import { ReservationProvider } from "@/contexts/ReservationContext"
import { Suspense } from "react"
import ClientProviders from "@/components/ClientProviders"
import type React from "react"
import StructuredData from "@/components/StructuredData"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

// Define fonts with display: 'swap' for better performance
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
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return {
    title: {
      template: "%s | Olivea",
      default: "Olivea",
    },
    description: dict.metadata?.description || "A farm-to-table sanctuary where nature, nourishment, and design meet.",
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: "Olivea",
      description:
        dict.metadata?.description || "A farm-to-table sanctuary where nature, nourishment, and design meet.",
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
        dict.metadata?.description || "A farm-to-table sanctuary where nature, nourishment, and design meet.",
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

// Loading component for the layout
function LayoutLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  return (
    <div className={`${inter.variable} ${cormorant.variable}`}>
      <StructuredData lang={lang} />

      {/* Client-side providers */}
      <ClientProviders />

      <ReservationProvider lang={lang}>
        <Suspense fallback={<LayoutLoading />}>
          <LayoutShell lang={lang}>
            {/* Wrap children in Suspense to enable streaming */}
            <Suspense fallback={<LayoutLoading />}>{children}</Suspense>
          </LayoutShell>
        </Suspense>
      </ReservationProvider>
    </div>
  )
}
