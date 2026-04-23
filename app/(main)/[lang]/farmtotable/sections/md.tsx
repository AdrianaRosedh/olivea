import { Fragment, type ReactNode } from "react";

/** Convert **bold** markdown to <strong> JSX */
export function md(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Get bilingual text by lang */
export function t(
  obj: { en: string; es: string } | undefined,
  lang: string
): string {
  if (!obj) return "";
  return lang === "es" ? obj.es : obj.en;
}

/** Get bilingual text and render markdown bold */
export function tm(
  obj: { en: string; es: string } | undefined,
  lang: string
): ReactNode {
  return md(t(obj, lang));
}
