// Weather words for the page sign-off, from MET Norway's symbol codes
// (e.g. "clearsky_night", "partlycloudy_day", "lightrainshowers"). The
// day/night suffix is dropped and the codes are grouped into the few words
// that matter to a guest.

import type { Lang } from "@/lib/i18n";

const WORDS = {
  clear: { es: "despejado", en: "clear" },
  fair: { es: "poco nublado", en: "mostly clear" },
  partlyCloudy: { es: "parcialmente nublado", en: "partly cloudy" },
  cloudy: { es: "nublado", en: "overcast" },
  fog: { es: "con bruma", en: "misty" },
  lightRain: { es: "llovizna", en: "light rain" },
  rain: { es: "lluvia", en: "rain" },
  snow: { es: "nieve", en: "snow" },
  storm: { es: "tormenta", en: "storms" },
} as const;

function group(symbol: string): keyof typeof WORDS | null {
  const s = symbol.replace(/_(day|night|polartwilight)$/, "");
  if (s.includes("thunder")) return "storm";
  if (s.includes("snow") || s.includes("sleet")) return "snow";
  if (s.startsWith("light") && s.includes("rain")) return "lightRain";
  if (s.includes("rain")) return "rain";
  if (s === "fog") return "fog";
  if (s === "clearsky") return "clear";
  if (s === "fair") return "fair";
  if (s === "partlycloudy") return "partlyCloudy";
  if (s === "cloudy") return "cloudy";
  return null;
}

/** "17°C, clear" / "17°C, despejado"; just the temperature for unknown codes. */
export function describeWeather(tempC: number, symbol: string, lang: Lang): string {
  const g = group(symbol);
  return g ? `${tempC}°C, ${WORDS[g][lang]}` : `${tempC}°C`;
}
