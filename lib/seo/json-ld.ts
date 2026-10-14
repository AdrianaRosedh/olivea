// lib/seo/json-ld.ts
// Structured data goes inside <script type="application/ld+json"> as raw HTML.
// Plain JSON.stringify leaves "<" as is, so admin-edited text containing
// "</script>" would close the tag and the rest would run as page code. "<" as
// < is the same character to every JSON parser (Google included) and can
// never end the script element.

export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
