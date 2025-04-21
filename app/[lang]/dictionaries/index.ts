import type { Dictionary } from "@/types"

type Locale = "en" | "es";

// Import the dictionary objects directly
import en from "./en.json";
import es from "./es.json";

// This maps the locale to the dictionary object
const dictionaries: Record<Locale, Dictionary> = {
  en,
  es,
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const dictionary = dictionaries[locale];

  if (!dictionary) {
    throw new Error(`No dictionary found for locale: ${locale}`);
  }

  return dictionary;
};