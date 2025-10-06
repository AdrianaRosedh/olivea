import { dictionarySchema, type Dictionary as AppDictionary } from "@/types/dictionarySchema";
import en from "./en.json";
import es from "./es.json";

export type Lang = "en" | "es";
const _dicts: Record<Lang, unknown> = { en, es };

export function getDictionary(lang: Lang): AppDictionary {
  const raw = (lang in _dicts ? _dicts[lang as Lang] : _dicts.en) as unknown;

  // Try requested lang
  const req = dictionarySchema.safeParse(raw);
  if (req.success) return req.data as AppDictionary;

  console.warn(`[i18n] Validation failed for "${lang}"`, req.error.issues);

  // Try EN fallback safely too
  const fb = dictionarySchema.safeParse(_dicts.en);
  if (fb.success) return fb.data as AppDictionary;

  // Last resort: synthesize a minimal object to avoid hard crash
  throw new Error(`[i18n] EN dictionary is invalid; please add required keys (e.g., "notFound").`);
}

export async function loadLocale({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang);
  return { lang, dict };
}

export type { AppDictionary };