import { supabase } from "@/lib/supabase"
import { getDictionary } from "../dictionaries"
import { Suspense } from "react"

// Define the menu item type based on the actual database schema
interface MenuItem {
  id: number
  name: string
  price: number
  available: boolean
  category?: string
}

// Component to display a single menu item
async function MenuItemComponent({ item }: { item: MenuItem }) {
  // Artificial delay to demonstrate streaming (remove in production)
  // await new Promise((resolve) => setTimeout(resolve, 200 * Math.random()))

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

// Loading skeleton for a single menu item
function MenuItemSkeleton() {
  return (
    <li className="flex justify-between py-2 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40"></div>
      <div className="h-5 bg-gray-200 rounded w-12"></div>
    </li>
  )
}

// Component to display a category of menu items
async function MenuCategory({
  categoryName,
  items,
  lang,
}: {
  categoryName: string
  items: MenuItem[]
  lang: string
}) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-serif mb-3 border-b pb-2">{categoryName}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <Suspense key={item.id} fallback={<MenuItemSkeleton />}>
            <MenuItemComponent item={item} />
          </Suspense>
        ))}
      </ul>
    </div>
  )
}

// Main component to fetch and display all menu items
export default async function MenuItems({ lang }: { lang: string }) {
  const dict = await getDictionary(lang)

  try {
    // Use the existing supabase client and select only the columns that exist
    const { data: menuItems, error } = await supabase
      .from("cafe_menu")
      .select("id, name, price, available, category")
      .order("category")
      .order("name")

    if (error) {
      throw error
    }

    // If no menu items, show a message
    if (!menuItems || menuItems.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {lang === "es" ? "No hay elementos de menú disponibles." : "No menu items available yet."}
          </p>
        </div>
      )
    }

    // Filter to only show available items
    const availableItems = menuItems.filter((item) => item.available !== false)

    // Group items by category
    const itemsByCategory: Record<string, MenuItem[]> = {}

    availableItems.forEach((item) => {
      const category = item.category || (lang === "es" ? "Otros" : "Others")
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = []
      }
      itemsByCategory[category].push(item)
    })

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-serif mb-6 border-b pb-2">{lang === "es" ? "Menú del Café" : "Cafe Menu"}</h2>

          {Object.entries(itemsByCategory).map(([category, items]) => (
            <Suspense
              key={category}
              fallback={
                <div className="mb-8 animate-pulse">
                  <div className="h-7 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <MenuItemSkeleton key={i} />
                    ))}
                  </div>
                </div>
              }
            >
              <MenuCategory categoryName={category} items={items} lang={lang} />
            </Suspense>
          ))}
        </div>
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
