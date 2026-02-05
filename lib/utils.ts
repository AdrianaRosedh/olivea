// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names (Tailwind-aware) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date according to the user's locale */
export function formatDate(date: Date | string, locale = "en"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(dateObj);
}

/** Create a URL with the correct language prefix */
export function createLocalizedUrl(path: string, lang: string): string {
  const cleanPath = path.replace(/^\/(en|es)/, "");
  return `/${lang}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

/** Safely access nested object properties */
export function getNestedValue<T extends object, R = unknown>(
  obj: T,
  path: string,
  fallback?: R
): R | unknown {
  let acc: unknown = obj;
  for (const part of path.split(".")) {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      acc = (acc as Record<string, unknown>)[part];
    } else {
      return fallback as R;
    }
  }
  return acc as R | unknown;
}