import type { Metadata, Viewport } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { getDictionary } from "./dictionaries"
import "../globals.css"
import LayoutShell from "@/components/LayoutShell"
import { ReservationProvider } from "@/contexts/ReservationContext"
import { Suspense } from "react"
import ClientProviders from "@/components/ClientProviders"
import type React from "react"

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
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#65735b",
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
      {/* Client-side providers */}
      <ClientProviders />

      <ReservationProvider lang={lang}>
        <Suspense fallback={null}>
          <LayoutShell lang={lang}>{children}</LayoutShell>
        </Suspense>
      </ReservationProvider>
    </div>
  )
}