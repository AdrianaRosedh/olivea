import type { Metadata, Viewport } from "next"
import { getDictionary } from "../dictionaries"
import CasaClientPage from "./CasaClientPage"

// Define metadata for better SEO
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  // Await the params Promise before accessing its properties
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
          url: "/images/casa-og.jpg", // You can create this image later
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
        en: `https://olivea.com/en/casa`,
        es: `https://olivea.com/es/casa`,
      },
    },
  }
}

// Move viewport settings to a separate export
export const viewport: Viewport = {
  themeColor: "#65735b",
}

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return <CasaClientPage lang={lang} dict={dict} />
}
