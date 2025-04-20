import { supabase } from "@/lib/supabase"
import { getDictionary } from "../dictionaries"

export default async function CafePage({
  params,
}: {
  params: Promise<{ lang: "en" | "es" }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  const { data: menuItems, error } = await supabase.from("cafe_menu").select("*")

  return (
    <main className="p-10">
      <h1 className="text-3xl font-semibold">{dict.cafe.title}</h1>
      <p className="mt-2 text-muted-foreground mb-6">{dict.cafe.description}</p>

      {error && (
        <p className="text-red-500">
          {dict.cafe.error} {error.message}
        </p>
      )}

      <ul className="space-y-4">
        {menuItems?.map((item) => (
          <li key={item.id} className="flex justify-between border-b pb-2">
            <span>{item.name}</span>
            <span className="text-muted-foreground">${item.price}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}