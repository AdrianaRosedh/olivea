// app/[lang]/legal/page.tsx
import type { Metadata, Viewport } from "next"
import { getDictionary, type Lang } from "../dictionaries"

export async function generateStaticParams(): Promise<{ lang: string }[]> {
  // we only support en & es
  return [{ lang: "en" }, { lang: "es" }]
}

export async function generateMetadata({
  params,
}: {
  // Next.js now passes params as a Promise
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // 1️⃣ Await the promise
  const { lang: raw } = await params
  // 2️⃣ Narrow into your Lang union
  const lang: Lang = raw === "es" ? "es" : "en"
  // 3️⃣ Load your translations
  const dict = await getDictionary(lang)

  return {
    title:       `${dict.legal.title} | Olivea`,
    description: dict.legal.description,
  }
}

// If you want to control the viewport meta here:
export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#5e7658",
}

export default async function LegalPage({
  params,
}: {
  // And here, too: params is still a Promise
  params: Promise<{ lang: string }>
}) {
  // 1️⃣ Await it
  const { lang: raw } = await params
  // 2️⃣ Narrow
  const lang: Lang = raw === "es" ? "es" : "en"
  // 3️⃣ Fetch copy
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.legal.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {dict.legal.description}
      </p>
    </main>
  )
}