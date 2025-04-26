import { getDictionary } from "../dictionaries"

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ lang: "en" | "es" }>
}) {
  // Await the params Promise before accessing its properties
  const resolvedParams = await params
  const lang = resolvedParams.lang
  const dict = await getDictionary(lang)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.reservations.title}</h1>
      <p className="mt-2 text-muted-foreground">{dict.reservations.description}</p>
    </main>
  )
}
