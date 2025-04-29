import { supabase } from "@/lib/supabase"
import { getDictionary } from "../dictionaries"
import { Suspense } from "react"

interface MenuItem {
  id: number
  name: string
  price: number
  available: boolean
  category?: string
}

async function MenuItemComponent({ item }: { item: MenuItem }) {
  return (
    <li key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <span className="font-medium">{item.name}</span>
      </div>
      <span className="text-muted-foreground font-medium">
        ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
      </span>
    </li>
  )
}

function MenuItemSkeleton() {
  return (
    <li className="flex justify-between py-2 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40"></div>
      <div className="h-5 bg-gray-200 rounded w-12"></div>
    </li>
  )
}

async function MenuCategory({
  categoryName,
  items,
  lang,
}: {
  categoryName: string
  items: MenuItem[]
  lang: string
}) {
  const headingId = `${categoryName.toLowerCase().replace(/\s+/g, "-")}-heading`

  return (
    <section
      id={categoryName}
      data-section-id={categoryName}
      className="min-h-screen w-full flex items-center justify-center px-6 scroll-mt-[120px]"
      aria-labelledby={headingId}
    >
      <div className="max-w-2xl w-full text-center">
        <h3 id={headingId} className="text-xl font-serif mb-6 border-b pb-2 italic text-muted-foreground">
          {categoryName}
        </h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <Suspense key={item.id} fallback={<MenuItemSkeleton />}>
              <MenuItemComponent item={item} />
            </Suspense>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default async function MenuItems({ lang }: { lang: string }) {
  const dict = await getDictionary(lang)

  try {
    const { data: menuItems, error } = await supabase
      .from("cafe_menu")
      .select("id, name, price, available, category")
      .order("category")
      .order("name")

    if (error) throw error

    if (!menuItems || menuItems.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {lang === "es" ? "No hay elementos de menú disponibles." : "No menu items available yet."}
          </p>
        </div>
      )
    }

    const availableItems = menuItems.filter((item) => item.available !== false)

    const itemsByCategory: Record<string, MenuItem[]> = {}
    availableItems.forEach((item) => {
      const category = item.category || (lang === "es" ? "Otros" : "Others")
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = []
      }
      itemsByCategory[category].push(item)
    })

    return (
      <div className="space-y-24"> {/* Adds vertical spacing between sections */}
        <div className="text-center">
          <h2 className="text-3xl font-serif mb-4 border-b pb-2">{lang === "es" ? "Menú del Café" : "Cafe Menu"}</h2>
          <p className="text-muted-foreground">{dict.cafe.description}</p>
        </div>

        {Object.entries(itemsByCategory).map(([category, items]) => (
          <Suspense
            key={category}
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="mb-8 animate-pulse w-full max-w-2xl">
                  <div className="h-7 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <MenuItemSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <MenuCategory categoryName={category} items={items} lang={lang} />
          </Suspense>
        ))}
      </div>
    )
  } catch (error) {
    console.error(`${dict.cafe.error}`, error)
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
        {dict.cafe.error} {error instanceof Error ? error.message : String(error)}
      </div>
    )
  }
}