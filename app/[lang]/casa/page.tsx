// app/[lang]/casa/page.tsx
import type { Metadata, Viewport } from "next"
import { getDictionary, type Lang } from "../dictionaries"
import CasaClientPage               from "./CasaClientPage"

export async function generateMetadata({
  params,
}: {
  // Next.js now passes params as a Promise
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // 1️⃣ Await the params promise
  const { lang: rawLang } = await params
  // 2️⃣ Narrow to your Lang union
  const lang: Lang = rawLang === "es" ? "es" : "en"
  // 3️⃣ Load translations
  const dict = await getDictionary(lang)

  return {
    title:       `${dict.casa.title} | Olivea`,
    description: dict.casa.description,
    metadataBase: new URL("https://olivea.com"),
    openGraph: {
      title:       `${dict.casa.title} | Olivea`,
      description: dict.casa.description,
      images: [
        {
          url:    "/images/casa.png",
          width:  1200,
          height: 630,
          alt:    "Casa Olivea",
        },
      ],
      locale: lang,
      type:   "website",
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

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#65735b",
}

export default async function CasaPage({
  params,
}: {
  // And here too: params is a Promise
  params: Promise<{ lang: string }>
}) {
  // 1️⃣ Await it
  const { lang: rawLang } = await params
  // 2️⃣ Narrow to your union
  const lang: Lang = rawLang === "es" ? "es" : "en"
  // 3️⃣ Load translations
  const dict = await getDictionary(lang)

  // 4️⃣ Finally, hand off to your client component
  return <CasaClientPage lang={lang} dict={dict} />
}