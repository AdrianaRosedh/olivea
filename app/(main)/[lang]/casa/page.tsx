import { Suspense } from "react"
import type { Metadata, Viewport } from "next"
import { loadLocale } from "@/lib/i18n"
import Casa from "./content.mdx"

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const { lang: L, dict } = await loadLocale(params)
  return {
    title:       dict.casa.title,
    description: dict.casa.description,
    alternates:  {
      canonical: `https://oliveafarmtotable.com/${L}/casa`,
      languages: {
        en: `https://oliveafarmtotable.com/en/casa`,
        es: `https://oliveafarmtotable.com/es/casa`,
      },
    },
    openGraph: {
      title:       dict.casa.title,
      description: dict.casa.description,
      locale:      L,
      type:        "website",
      images: [
        {
          url:    "/images/casa-og.png",
          width:  1200,
          height: 630,
          alt:    dict.casa.title,
        },
      ],
    },
  }
}

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#65735b",
}

export default async function Page({
  params,
}: {
  params: { lang: string }
}) {
  const { dict } = await loadLocale(params)
  return (
    <div suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading…
          </div>
        }
      >
        <Casa dict={dict} />
      </Suspense>
    </div>
  )
}