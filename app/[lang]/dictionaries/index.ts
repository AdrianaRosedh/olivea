import type { Dictionary } from "@/types"

type Locale = "en" | "es"

// Import the dictionary objects directly
import en from "./en.json"
import es from "./es.json"

// This maps the locale to the dictionary object
const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
}

// Change the param to `string` to safely validate unknown input
export const getDictionary = async (locale: string): Promise<Dictionary> => {
  if (!["en", "es"].includes(locale)) {
    throw new Error(`No dictionary found for locale: ${locale}`)
  }

  return dictionaries[locale as Locale]
}