import { getDictionary } from "../dictionaries"

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.sustainability.title}</h1>
      <p className="mt-2 text-muted-foreground">{dict.sustainability.description}</p>
    </main>
  )
}
