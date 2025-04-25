import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * This allows for conditional classes and proper handling of Tailwind CSS conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date according to the user's locale
 */
export function formatDate(date: Date | string, locale = "en"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)
}

/**
 * Creates a URL with the correct language prefix
 */
export function createLocalizedUrl(path: string, lang: string): string {
  // Remove any existing language prefix
  const cleanPath = path.replace(/^\/(en|es)/, "")

  // Add the new language prefix
  return `/${lang}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`
}

/**
 * Safely access nested object properties
 */
export function getNestedValue(obj: any, path: string, fallback: any = undefined): any {
  return path.split(".").reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : fallback
  }, obj)
}
