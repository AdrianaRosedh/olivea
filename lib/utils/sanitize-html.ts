// lib/utils/sanitize-html.ts
// ─────────────────────────────────────────────────────────────────────
// Lightweight HTML sanitizer for user-generated content.
// Strips script tags, event handlers, javascript: URLs, and other
// XSS vectors. Used where DOMPurify is unavailable (server-side SSR).
// ─────────────────────────────────────────────────────────────────────

/** Allowed HTML tags for article content (reference for future allowlist-based sanitizer) */
export const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "b", "i", "u", "s", "del", "ins", "mark", "sub", "sup",
  "a", "img", "figure", "figcaption", "picture", "source",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "div", "span", "section", "article", "aside", "details", "summary",
  "video", "audio",
  "time", "abbr", "cite", "small",
]);

/** Allowed attributes — tag-agnostic for simplicity (reference for future allowlist-based sanitizer) */
export const ALLOWED_ATTRS = new Set([
  "href", "src", "alt", "title", "width", "height",
  "class", "id", "style",
  "target", "rel",
  "loading", "decoding", "fetchpriority",
  "colspan", "rowspan",
  "datetime",
  "type", "media", "srcset", "sizes",
  "controls", "poster", "preload",
  "open",
]);

/**
 * Sanitize HTML string — removes script tags, event handlers, and
 * javascript: URLs. Not a full DOMPurify replacement, but covers
 * the OWASP top XSS vectors for rendered HTML content.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let result = html;

  // 1. Remove <script> tags and contents
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Remove <style> tags and contents (can be used for CSS injection)
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Remove <iframe>, <object>, <embed>, <form>, <input>, <textarea>, <select>
  result = result.replace(/<\/?(?:iframe|object|embed|form|input|textarea|select|button|link|meta|base)\b[^>]*>/gi, "");

  // 4. Remove event handler attributes (on*)
  result = result.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 5. Remove javascript: and data: URLs from href/src/action attributes
  result = result.replace(/(href|src|action)\s*=\s*(?:"[^"]*javascript:[^"]*"|'[^']*javascript:[^']*')/gi, '$1=""');
  result = result.replace(/(href|src|action)\s*=\s*(?:"[^"]*data:[^"]*"|'[^']*data:[^']*')/gi, '$1=""');

  // 6. Remove javascript: in style attribute (expression, url)
  result = result.replace(/style\s*=\s*"[^"]*(?:expression|javascript|behavior)\s*\([^"]*"/gi, "");
  result = result.replace(/style\s*=\s*'[^']*(?:expression|javascript|behavior)\s*\([^']*'/gi, "");

  return result;
}
