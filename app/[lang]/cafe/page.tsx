import { Suspense } from "react"
import { getDictionary } from "../dictionaries"
import CafeClientPage from "./CafeClientPage"
import type { Metadata, Viewport } from "next"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return {
    title: `${dict.cafe.title} | Olivea`,
    description: dict.cafe.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: `${dict.cafe.title} | Olivea`,
      description: dict.cafe.description,
      images: [
        {
          url: "/images/cafe.png",
          width: 1200,
          height: 630,
          alt: "Olivea Café",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}/cafe`,
      languages: {
        en: "https://olivea.com/en/cafe",
        es: "https://olivea.com/es/cafe",
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

export default async function CafePage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  const sections = dict?.cafe?.sections ?? {
    about: { title: "", description: "" },
    coffee: { title: "", description: "" },
    pastries: { title: "", description: "" },
    menu: { title: "", description: "" },
  }

  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"></div>}>
        <CafeClientPage lang={lang} sections={sections} />
      </Suspense>
    </div>
  )
}