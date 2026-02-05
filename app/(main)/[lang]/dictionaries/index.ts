// app/(main)/[lang]/dictionaries/index.ts
import {
  dictionarySchema,
  type Dictionary as AppDictionary,
} from "@/types/dictionarySchema";
import en from "./en.json";
import es from "./es.json";

export type Lang = "en" | "es";

// Store raw unvalidated dicts
const _dicts: Record<Lang, unknown> = { en, es };

/**
 * Normalize any incoming value to a valid Lang.
 * Anything that's not "es" becomes "en".
 */
export function normalizeLang(raw: string | Lang): Lang {
  return raw === "es" ? "es" : "en";
}

/**
 * Return a validated dictionary for a given language.
 * Falls back to EN if the target dict fails validation.
 */
export function getDictionary(lang: Lang): AppDictionary {
  const raw = _dicts[lang];

  const parsed = dictionarySchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data as AppDictionary;
  }

  console.warn(`[i18n] Validation failed for "${lang}"`, parsed.error.issues);

  // Try EN as a safe fallback
  const fallbackParsed = dictionarySchema.safeParse(_dicts.en);
  if (fallbackParsed.success) {
    return fallbackParsed.data as AppDictionary;
  }

  // Last resort: throw a clear error
  throw new Error(
    '[i18n] EN dictionary is invalid; please add required keys (e.g., "notFound").',
  );
}

/**
 * Main locale loader used by (main)/[lang] layout & pages.
 * Accepts either a string or Lang, returns normalized Lang + dict.
 */
export async function loadLocale(
  opts: { lang: string | Lang },
): Promise<{ lang: Lang; dict: AppDictionary }> {
  const safe = normalizeLang(opts.lang);
  const dict = getDictionary(safe);
  return { lang: safe, dict };
}

export type { AppDictionary };