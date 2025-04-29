import { Suspense } from "react"
import { getDictionary } from "../dictionaries"
import CasaClientPage from "./CasaClientPage"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import type { Metadata, Viewport } from "next"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return {
    title: `${dict.casa.title} | Olivea`,
    description: dict.casa.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: `${dict.casa.title} | Olivea`,
      description: dict.casa.description,
      images: [
        {
          url: "/images/casa.png",
          width: 1200,
          height: 630,
          alt: "Casa Olivea",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}/casa`,
      languages: {
        en: "https://olivea.com/en/casa",
        es: "https://olivea.com/es/casa",
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

function CasaLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default async function CasaPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <Suspense fallback={<CasaLoading />}>
      <CasaClientPage lang={lang} dict={dict} />
    </Suspense>
  )
}