import { Suspense } from "react"
import type { Metadata, Viewport } from "next"
import { loadLocale } from "@/lib/i18n"
import Cafe from "./content.mdx"

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
    title:       dict.cafe.title,
    description: dict.cafe.description,
    alternates:  {
      canonical: `https://oliveafarmtotable.com/${L}/cafe`,
      languages: {
        en: `https://oliveafarmtotable.com/en/cafe`,
        es: `https://oliveafarmtotable.com/es/cafe`,
      },
    },
    openGraph: {
      title:       dict.cafe.title,
      description: dict.cafe.description,
      locale:      L,
      type:        "website",
      images: [
        {
          url:    "/images/cafe-og.png",
          width:  1200,
          height: 630,
          alt:    dict.cafe.title,
        },
      ],
    },
    other: {
      preload: [
        '<link rel="preload" href="/videos/cafe.webm" as="video" type="video/webm" />',
        '<link rel="preload" href="/videos/cafe.mp4"  as="video" type="video/mp4"  />',
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
        <Cafe dict={dict} />
      </Suspense>
    </div>
  )
}
