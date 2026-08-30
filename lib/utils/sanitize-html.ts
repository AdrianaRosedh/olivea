import sanitize from "sanitize-html";

/**
 * HTML emitted by the journal editor. Keep this allowlist deliberately small:
 * CMS HTML is untrusted at render time, even when it was authored by an admin.
 */
export const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "em", "b", "i", "u", "s", "del", "ins", "mark", "sub", "sup",
  "a", "img", "figure", "figcaption", "picture", "source",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "div", "span", "section", "article", "aside", "details", "summary",
  "video", "audio", "time", "abbr", "cite", "small",
  // The editor emits YouTube embeds. sanitize-html restricts their hosts below.
  "iframe",
] as const;

const ALLOWED_ATTRIBUTES: sanitize.IOptions["allowedAttributes"] = {
  "*": ["class", "id", "title"],
  a: ["href", "target", "rel"],
  img: [
    "src", "alt", "width", "height", "loading", "decoding",
    "fetchpriority", "srcset", "sizes",
  ],
  source: ["src", "type", "media", "srcset", "sizes"],
  th: ["colspan", "rowspan"],
  td: ["colspan", "rowspan"],
  time: ["datetime"],
  video: ["src", "controls", "poster", "preload", "width", "height"],
  audio: ["src", "controls", "preload"],
  iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
  details: ["open"],
};

const OPTIONS: sanitize.IOptions = {
  allowedTags: [...ALLOWED_TAGS],
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
    source: ["http", "https"],
    video: ["http", "https"],
    audio: ["http", "https"],
    iframe: ["https"],
  },
  allowProtocolRelative: false,
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
  disallowedTagsMode: "discard",
  exclusiveFilter: (frame) => {
    if (frame.tag === "iframe") return !frame.attribs.src;
    if (frame.tag === "img" || frame.tag === "source") {
      return !frame.attribs.src && !frame.attribs.srcset;
    }
    return false;
  },
  // Inline style is intentionally omitted. It can perform external requests and
  // is not needed by the structured journal blocks, which use CSS classes.
  parseStyleAttributes: false,
  transformTags: {
    a: (_tagName, attribs) => {
      if (attribs.target !== "_blank") return { tagName: "a", attribs };
      const rel = new Set((attribs.rel ?? "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      return { tagName: "a", attribs: { ...attribs, rel: [...rel].join(" ") } };
    },
  },
};

/** Parse and sanitize CMS-authored journal HTML before server-side rendering. */
export function sanitizeHtml(html: string): string {
  return html ? sanitize(html, OPTIONS) : "";
}
