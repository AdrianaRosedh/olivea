// app/[lang]/journal/page.tsx
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import type { Metadata } from "next"
import { getDictionary, type Lang } from "../dictionaries"
import JournalEntries, { EntryLoading } from "./journal-entries"

function JournalEntriesSkeleton() {
  return (
    <ul className="space-y-8">
      {[1, 2, 3].map((i) => (
        <EntryLoading key={i} />
      ))}
    </ul>
  )
}

export async function generateStaticParams() {
  return (["en", "es"] as const).map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang: raw } = await params
  const lang: Lang = raw === "es" ? "es" : "en"
  const dict = await getDictionary(lang)
  return {
    title:       dict.journal.title,
    description: dict.journal.subtitle,
  }
}

export default async function JournalPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: raw } = await params
  const lang: Lang = raw === "es" ? "es" : "en"
  const dict = await getDictionary(lang)

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-4">{dict.journal.title}</h1>
      <p className="text-muted-foreground mb-10">{dict.journal.subtitle}</p>

      <Suspense fallback={<JournalEntriesSkeleton />}>
        <JournalEntries lang={lang} />
      </Suspense>
    </main>
  )
}