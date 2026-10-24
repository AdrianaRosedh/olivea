// lib/content/rich-text.ts
//
// Shared between the philosophy loader and the admin editor for that page.
// The loader needs it to turn stored HTML into the plain paragraphs the
// client renders; the editor needs the same conversion so what an editor
// types is what the page shows, rather than asking them to write HTML.

/**
 * Flatten stored rich text to plain paragraphs separated by blank lines.
 *
 * `<br />` collapses to a space on purpose — the page renders soft breaks
 * that way, so preserving them in the editor would promise a line break the
 * visitor never sees.
 */
export function htmlToPlainParagraphs(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ") // intra-paragraph breaks collapse, same as MDX soft breaks
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(?!\n)/g, "$1 ") // soft breaks → spaces, keep \n\n
    .replace(/[ \t]+/g, " ")
    .trim();
}
