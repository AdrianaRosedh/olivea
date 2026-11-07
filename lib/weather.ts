// Weather words for the page sign-off, from WMO weather codes (the scheme
// Open-Meteo reports). Grouped into the few words that matter to a guest.

import type { Lang } from "@/lib/i18n";

const WORDS = {
  clear: { es: "despejado", en: "clear" },
  mostlyClear: { es: "poco nublado", en: "mostly clear" },
  overcast: { es: "nublado", en: "overcast" },
  mist: { es: "con bruma", en: "misty" },
  drizzle: { es: "llovizna", en: "light drizzle" },
  rain: { es: "lluvia", en: "rain" },
  snow: { es: "nieve", en: "snow" },
  storm: { es: "tormenta", en: "storms" },
} as const;

function group(code: number): keyof typeof WORDS | null {
  if (code === 0) return "clear";
  if (code <= 2) return "mostlyClear";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "mist";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "storm";
  return null;
}

/** "17°C, clear" / "17°C, despejado"; just the temperature for unknown codes. */
export function describeWeather(tempC: number, code: number, lang: Lang): string {
  const g = group(code);
  return g ? `${tempC}°C, ${WORDS[g][lang]}` : `${tempC}°C`;
}
