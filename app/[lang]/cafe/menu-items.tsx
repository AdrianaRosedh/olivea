import { supabase } from "@/lib/supabase"
import { getDictionary } from "../dictionaries"

// Define the menu item type based on the actual database schema
interface MenuItem {
  id: number
  name: string
  price: number
  available: boolean
}

export default async function MenuItems({ lang }: { lang: string }) {
  const dict = await getDictionary(lang)

  try {
    // Use the existing supabase client and select only the columns that exist
    const { data: menuItems, error } = await supabase
      .from("cafe_menu")
      .select("id, name, price, available")
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

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-serif mb-4 border-b pb-2">{lang === "es" ? "Menú del Café" : "Cafe Menu"}</h2>
          <ul className="space-y-4">
            {availableItems.map((item) => (
              <li key={item.id} className="flex justify-between">
                <div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-muted-foreground font-medium">
                  ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                </span>
              </li>
            ))}
          </ul>
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
