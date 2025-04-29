import { getDictionary } from "../dictionaries"
import RestaurantClientPage from "./RestaurantClientPage"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return {
    title: `${dict.restaurant.title} | Olivea`,
    description: dict.restaurant.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title: `${dict.restaurant.title} | Olivea`,
      description: dict.restaurant.description,
      images: [
        {
          url: "/images/restaurant.png",
          width: 1200,
          height: 630,
          alt: "Olivea Restaurant",
        },
      ],
      locale: lang,
      type: "website",
    },
    alternates: {
      canonical: `https://olivea.com/${lang}/restaurant`,
      languages: {
        en: "https://olivea.com/en/restaurant",
        es: "https://olivea.com/es/restaurant",
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

export default async function RestaurantPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  const sections = dict?.restaurant?.sections ?? {
    story: { title: "", description: "" },
    garden: { title: "", description: "" },
    menu: { title: "", description: "" },
    wines: { title: "", description: "" },
  }

  return (
    <div suppressHydrationWarning>
      <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
        <RestaurantClientPage lang={lang} sections={sections} />
      </Suspense>
    </div>
  )
}
