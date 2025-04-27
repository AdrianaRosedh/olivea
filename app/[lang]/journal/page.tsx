import { Suspense } from "react"
import { getDictionary } from "../dictionaries"
import JournalEntries from "./journal-entries"

export default async function JournalPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-4xl font-semibold mb-4">{dict.journal.title}</h1>
      <p className="text-muted-foreground mb-10">{dict.journal.subtitle}</p>

      {/* Use Suspense for better loading experience */}
      <Suspense fallback={<JournalEntriesSkeleton />}>
        <JournalEntries lang={lang} />
      </Suspense>
    </main>
  )
}

function JournalEntriesSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-60 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}
