// app/[lang]/casa/page.tsx
import { getDictionary } from "../dictionaries"
import CasaClientPage from "./CasaClientPage"
import type { Metadata, Viewport } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
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

export default async function CasaPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <CasaClientPage lang={lang} dict={dict} />
}