"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/** Client-side HTML sanitizer for editor preview — strips script/event-handler XSS vectors */
function sanitizeEditorHtml(html: string): string {
  if (!html) return "";
  let s = html;
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  s = s.replace(/<\/?(?:iframe|object|embed|form|link|meta|base)\b[^>]*>/gi, "");
  s = s.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/(href|src|action)\s*=\s*(?:"[^"]*javascript:[^"]*"|'[^']*javascript:[^']*')/gi, '$1=""');
  return s;
}
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  X,
  Save,
  Eye,
  Send,
  ArrowLeft,
  Tag,
  Globe,
  Check,
  EyeOff,
  Plus,
  GripVertical,
  Trash2,
  Type,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Quote,
  Youtube,
  Code2,
  Minus,
  Images,
  ChevronDown,
  Columns2,
  UserPlus,
  Users,
} from "lucide-react";
import type { JournalPost, JournalPostAuthor, JournalPostGalleryImage } from "@/lib/content/types";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdminLocale, STR, type B } from "@/lib/admin/i18n";

/* ═══════════════════════════════════════════════════════════════════ */
/*  BLOCK TYPES                                                       */
/* ═══════════════════════════════════════════════════════════════════ */

type BlockType =
  | "paragraph"
  | "heading2"
  | "heading3"
  | "image"
  | "quote"
  | "youtube"
  | "embed"
  | "gallery"
  | "divider"
  | "html";

/** Image layout options matching the public site CSS */
type ImageLayout = "default" | "j-wide" | "float-left" | "float-right";

interface ContentBlock {
  id: string;
  type: BlockType;
  content: { es: string; en: string };
  /** Image src, YouTube URL, embed code, etc. */
  media?: string;
  /** Image caption, alt text, etc. */
  caption?: { es: string; en: string };
  /** Gallery images */
  gallery?: { src: string; alt: string }[];
  /** Image layout — controls CSS classes on the figure element */
  layout?: ImageLayout;
}

const BLOCK_LABELS: Record<BlockType, { label: B; icon: React.ElementType }> = {
  paragraph: { label: { es: "Párrafo", en: "Paragraph" }, icon: Type },
  heading2: { label: { es: "Encabezado 2", en: "Heading 2" }, icon: Heading2 },
  heading3: { label: { es: "Encabezado 3", en: "Heading 3" }, icon: Heading3 },
  image: { label: { es: "Imagen", en: "Image" }, icon: ImageIcon },
  quote: { label: { es: "Cita destacada", en: "Pull Quote" }, icon: Quote },
  youtube: { label: { es: "YouTube", en: "YouTube" }, icon: Youtube },
  embed: { label: { es: "Insertado", en: "Embed" }, icon: Code2 },
  gallery: { label: { es: "Galería", en: "Gallery" }, icon: Images },
  divider: { label: { es: "Separador", en: "Divider" }, icon: Minus },
  html: { label: { es: "HTML personalizado", en: "Custom HTML" }, icon: Code2 },
};

function newBlock(type: BlockType): ContentBlock {
  return {
    id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    content: { es: "", en: "" },
    ...(type === "image" && { media: "", caption: { es: "", en: "" }, layout: "j-wide" as ImageLayout }),
    ...(type === "gallery" && { gallery: [] }),
  };
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  BLOCK SERIALIZATION: blocks ↔ HTML                                */
/* ═══════════════════════════════════════════════════════════════════ */

function blocksToHtml(blocks: ContentBlock[], lang: "es" | "en"): string {
  return blocks
    .map((b) => {
      const text = b.content[lang];
      switch (b.type) {
        case "paragraph":
          return text ? `<p>${text}</p>` : "";
        case "heading2":
          return text ? `<h2>${text}</h2>` : "";
        case "heading3":
          return text ? `<h3>${text}</h3>` : "";
        case "image": {
          if (!b.media) return "";
          // Apply layout class to figure element — matches public site CSS
          const layout = b.layout ?? "j-wide";
          const figClass = layout === "default" ? "" : ` class="${layout}"`;
          const alt = b.caption?.[lang] ?? "";
          const caption = b.caption?.[lang] ? `\n  <figcaption>${b.caption[lang]}</figcaption>` : "";
          return `<figure${figClass}>\n  <img\n    src="${b.media}"\n    alt="${alt}"\n  />${caption}\n</figure>`;
        }
        case "quote":
          return text ? `<blockquote><p>${text}</p></blockquote>` : "";
        case "youtube": {
          const videoId = extractYouTubeId(b.media ?? "");
          return videoId
            ? `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
            : "";
        }
        case "embed":
          return b.media ? `<div class="embed-block">${b.media}</div>` : "";
        case "gallery":
          // Legacy block — no longer emitted into the body: the public page
          // has no styles for an in-body gallery div. The photo carousel
          // lives on post.gallery (article settings) and renders after the
          // body via PhotoCarousel. Legacy body galleries are migrated into
          // post.gallery when a post is opened (see extractLegacyGalleries).
          return "";
        case "divider":
          return "<hr />";
        case "html":
          return text || "";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function htmlToBlocks(html: string): ContentBlock[] {
  if (!html || !html.trim()) return [newBlock("paragraph")];

  const blocks: ContentBlock[] = [];
  // Simple regex-based parser for common patterns
  const parts = html.split(/\n\n+/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("<h2>")) {
      blocks.push({
        ...newBlock("heading2"),
        content: { es: stripTags(trimmed), en: "" },
      });
    } else if (trimmed.startsWith("<h3>")) {
      blocks.push({
        ...newBlock("heading3"),
        content: { es: stripTags(trimmed), en: "" },
      });
    } else if (trimmed.startsWith("<blockquote>")) {
      blocks.push({
        ...newBlock("quote"),
        content: { es: stripTags(trimmed), en: "" },
      });
    } else if (trimmed.startsWith("<figure")) {
      const srcMatch = trimmed.match(/src="([^"]*)"/);
      const altMatch = trimmed.match(/alt="([^"]*)"/);
      const capMatch = trimmed.match(/<figcaption>(.*?)<\/figcaption>/s);
      // Detect layout class from figure element
      const classMatch = trimmed.match(/<figure\s+class="([^"]*)"/);
      let layout: ImageLayout = "default";
      if (classMatch) {
        const cls = classMatch[1];
        if (cls.includes("j-wide")) layout = "j-wide";
        else if (cls.includes("float-left")) layout = "float-left";
        else if (cls.includes("float-right")) layout = "float-right";
      }
      blocks.push({
        ...newBlock("image"),
        media: srcMatch?.[1] ?? "",
        caption: { es: capMatch?.[1] ?? altMatch?.[1] ?? "", en: "" },
        content: { es: "", en: "" },
        layout,
      });
    } else if (trimmed === "<hr />" || trimmed === "<hr>") {
      blocks.push(newBlock("divider"));
    } else if (trimmed.startsWith("<div class=\"video-embed\">")) {
      const srcMatch = trimmed.match(/src="([^"]*)"/);
      blocks.push({
        ...newBlock("youtube"),
        media: srcMatch?.[1] ?? "",
        content: { es: "", en: "" },
      });
    } else if (trimmed.startsWith("<p>")) {
      blocks.push({
        ...newBlock("paragraph"),
        content: { es: trimmed.replace(/<\/?p>/g, ""), en: "" },
      });
    } else {
      // Preserve raw HTML (including inline links, formatted text)
      blocks.push({
        ...newBlock("paragraph"),
        content: { es: trimmed, en: "" },
      });
    }
  }

  return blocks.length > 0 ? blocks : [newBlock("paragraph")];
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Migrate legacy in-body `<div class="gallery">…</div>` markup (written by
 *  the old gallery block — unstyled on the public page) into carousel
 *  images. Returns the cleaned HTML and the extracted images so they can be
 *  merged into post.gallery, where PhotoCarousel actually reads them. */
function extractLegacyGalleries(html: string): {
  cleaned: string;
  images: JournalPostGalleryImage[];
} {
  if (!html || !html.includes('class="gallery"')) return { cleaned: html, images: [] };
  const images: JournalPostGalleryImage[] = [];
  const cleaned = html.replace(
    /<div class="gallery">([\s\S]*?)<\/div>/g,
    (_m, inner: string) => {
      for (const imgTag of inner.match(/<img[^>]*>/g) ?? []) {
        const src = imgTag.match(/src="([^"]*)"/)?.[1] ?? "";
        const alt = imgTag.match(/alt="([^"]*)"/)?.[1] ?? "";
        if (src) images.push({ src, alt });
      }
      return "";
    }
  );
  return { cleaned: cleaned.replace(/\n{3,}/g, "\n\n").trim(), images };
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  STYLING TOKENS                                                    */
/* ═══════════════════════════════════════════════════════════════════ */

const S = {
  input:
    "w-full px-4 py-2.5 rounded-xl bg-white/60 border border-[var(--olivea-olive)]/[0.08] text-sm text-[var(--olivea-ink)] placeholder:text-[var(--olivea-clay)]/40 focus:outline-none focus:border-[var(--olivea-olive)]/20 focus:bg-white/80 focus:shadow-[0_0_0_3px_rgba(94,118,88,0.06)] transition-all",
  textarea:
    "w-full px-4 py-3 rounded-xl bg-white/60 border border-[var(--olivea-olive)]/[0.08] text-sm text-[var(--olivea-ink)] placeholder:text-[var(--olivea-clay)]/40 focus:outline-none focus:border-[var(--olivea-olive)]/20 focus:bg-white/80 focus:shadow-[0_0_0_3px_rgba(94,118,88,0.06)] transition-all resize-none leading-relaxed",
  label:
    "text-[11px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]",
  langTag:
    "text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60 mb-1",
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  ADD BLOCK MENU                                                    */
/* ═══════════════════════════════════════════════════════════════════ */

function AddBlockMenu({
  onAdd,
}: {
  onAdd: (type: BlockType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useAdminLocale();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const groups = [
    { label: t({ es: "Texto", en: "Text" }), items: ["paragraph", "heading2", "heading3", "quote"] as BlockType[] },
    // NOTE: "gallery" was removed from this menu — in-body gallery divs have
    // no styling on the public page. The photo carousel is edited in the
    // article settings panel (post.gallery → PhotoCarousel after the body).
    { label: t({ es: "Medios", en: "Media" }), items: ["image", "youtube", "embed"] as BlockType[] },
    { label: t({ es: "Diseño", en: "Layout" }), items: ["divider", "html"] as BlockType[] },
  ];

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)] bg-white/50 hover:bg-white/80 ring-1 ring-black/5 hover:ring-black/10 transition-all"
      >
        <Plus size={14} />
        {t({ es: "Agregar bloque", en: "Add block" })}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 z-30 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-black/10 p-2 overflow-hidden"
          >
            {groups.map((g) => (
              <div key={g.label}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]/60">
                  {g.label}
                </div>
                {g.items.map((type) => {
                  const { label, icon: Icon } = BLOCK_LABELS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => { onAdd(type); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--olivea-ink)]/70 hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/40 transition-colors"
                    >
                      <Icon size={16} className="text-[var(--olivea-olive)]" />
                      {t(label)}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  SINGLE BLOCK EDITOR                                               */
/* ═══════════════════════════════════════════════════════════════════ */

function BlockEditor({
  block,
  onChange,
  onDelete,
  showBothLangs,
}: {
  block: ContentBlock;
  onChange: (updated: ContentBlock) => void;
  onDelete: () => void;
  showBothLangs: boolean;
}) {
  const { type } = block;
  const { t } = useAdminLocale();
  const { icon: Icon, label } = BLOCK_LABELS[type];

  const updateContent = (lang: "es" | "en", value: string) => {
    onChange({ ...block, content: { ...block.content, [lang]: value } });
  };

  const updateCaption = (lang: "es" | "en", value: string) => {
    onChange({
      ...block,
      caption: { ...block.caption, es: block.caption?.es ?? "", en: block.caption?.en ?? "", [lang]: value },
    });
  };

  const renderTextInput = (lang: "es" | "en", placeholder: string, rows = 3) => (
    <div className="flex-1 min-w-0">
      <div className={S.langTag}>{lang.toUpperCase()}</div>
      <textarea
        value={block.content[lang]}
        onChange={(e) => updateContent(lang, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={S.textarea}
      />
    </div>
  );

  const renderTitleInput = (lang: "es" | "en", placeholder: string) => (
    <div className="flex-1 min-w-0">
      <div className={S.langTag}>{lang.toUpperCase()}</div>
      <input
        type="text"
        value={block.content[lang]}
        onChange={(e) => updateContent(lang, e.target.value)}
        placeholder={placeholder}
        className={`${S.input} ${type === "heading2" ? "text-lg font-semibold" : "text-base font-medium"}`}
      />
    </div>
  );

  return (
    <div className="group relative rounded-2xl bg-white/50 ring-1 ring-black/5 hover:ring-black/10 transition-all">
      {/* Block header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-black/[0.03]">
        <div className="cursor-grab active:cursor-grabbing p-1 rounded text-[var(--olivea-clay)]/30 hover:text-[var(--olivea-clay)] transition-colors">
          <GripVertical size={14} />
        </div>
        <Icon size={14} className="text-[var(--olivea-olive)]/60" />
        <span className="text-[11px] font-medium text-[var(--olivea-clay)]/60 uppercase tracking-wider">
          {t(label)}
        </span>
        <div className="flex-1" />
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-[var(--olivea-clay)]/30 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Block content */}
      <div className="p-4">
        {/* PARAGRAPH */}
        {type === "paragraph" && (
          <div className={`flex gap-3 ${showBothLangs ? "" : ""}`}>
            {showBothLangs ? (
              <>
                {renderTextInput("es", t({ es: "Escribe aquí…", en: "Write here..." }), 4)}
                {renderTextInput("en", t({ es: "Escribe aquí…", en: "Write here..." }), 4)}
              </>
            ) : (
              renderTextInput("es", t({ es: "Escribe aquí…", en: "Write here..." }), 4)
            )}
          </div>
        )}

        {/* HEADING */}
        {(type === "heading2" || type === "heading3") && (
          <div className={`flex gap-3`}>
            {showBothLangs ? (
              <>
                {renderTitleInput("es", t({ es: "Título…", en: "Heading..." }))}
                {renderTitleInput("en", t({ es: "Título…", en: "Heading..." }))}
              </>
            ) : (
              renderTitleInput("es", t({ es: "Título…", en: "Heading..." }))
            )}
          </div>
        )}

        {/* QUOTE */}
        {type === "quote" && (
          <div className="border-l-3 border-[var(--olivea-olive)]/30 pl-4">
            <div className={`flex gap-3`}>
              {showBothLangs ? (
                <>
                  {renderTextInput("es", t({ es: "Cita…", en: "Quote..." }), 2)}
                  {renderTextInput("en", t({ es: "Cita…", en: "Quote..." }), 2)}
                </>
              ) : (
                renderTextInput("es", t({ es: "Cita…", en: "Quote..." }), 2)
              )}
            </div>
          </div>
        )}

        {/* IMAGE */}
        {type === "image" && (
          <div className="space-y-3">
            {/* Layout selector */}
            <div>
              <div className={S.label}>{t({ es: "Disposición", en: "Layout" })}</div>
              <div className="flex gap-1.5 mt-1.5">
                {([
                  { value: "j-wide" as ImageLayout, label: t({ es: "Ancha (editorial)", en: "Wide (editorial)" }) },
                  { value: "float-left" as ImageLayout, label: t({ es: "Flotante izquierda", en: "Float left" }) },
                  { value: "float-right" as ImageLayout, label: t({ es: "Flotante derecha", en: "Float right" }) },
                  { value: "default" as ImageLayout, label: t({ es: "En línea", en: "Inline" }) },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...block, layout: opt.value })}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                      (block.layout ?? "j-wide") === opt.value
                        ? "bg-[var(--olivea-olive)]/10 text-[var(--olivea-olive)] border-[var(--olivea-olive)]/20"
                        : "text-[var(--olivea-clay)] border-transparent hover:bg-white/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <ImageUpload
              label={t({ es: "Imagen", en: "Image" })}
              value={block.media ?? ""}
              onChange={(v) => onChange({ ...block, media: v })}
              folder="journal"
            />
            <div className={`flex gap-3`}>
              {showBothLangs ? (
                <>
                  <div className="flex-1">
                    <div className={S.langTag}>ES</div>
                    <input
                      type="text"
                      value={block.caption?.es ?? ""}
                      onChange={(e) => updateCaption("es", e.target.value)}
                      placeholder={t({ es: "Pie de foto…", en: "Caption..." })}
                      className={S.input}
                    />
                  </div>
                  <div className="flex-1">
                    <div className={S.langTag}>EN</div>
                    <input
                      type="text"
                      value={block.caption?.en ?? ""}
                      onChange={(e) => updateCaption("en", e.target.value)}
                      placeholder={t({ es: "Pie de foto…", en: "Caption..." })}
                      className={S.input}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1">
                  <div className={S.label}>{t({ es: "Pie de foto / Texto alternativo", en: "Caption / Alt text" })}</div>
                  <input
                    type="text"
                    value={block.caption?.es ?? ""}
                    onChange={(e) => updateCaption("es", e.target.value)}
                    placeholder={t({ es: "Pie de foto…", en: "Caption..." })}
                    className={`${S.input} mt-1`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* YOUTUBE */}
        {type === "youtube" && (
          <div className="space-y-3">
            <div>
              <div className={S.label}>{t({ es: "URL de YouTube", en: "YouTube URL" })}</div>
              <input
                type="text"
                value={block.media ?? ""}
                onChange={(e) => onChange({ ...block, media: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`${S.input} mt-1`}
              />
            </div>
            {block.media && extractYouTubeId(block.media) && (
              <div className="rounded-xl overflow-hidden aspect-video bg-black ring-1 ring-black/10">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(block.media)}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {/* EMBED (Instagram, etc.) */}
        {type === "embed" && (
          <div className="space-y-3">
            <div>
              <div className={S.label}>{t({ es: "Código para insertar / URL", en: "Embed Code / URL" })}</div>
              <textarea
                value={block.media ?? ""}
                onChange={(e) => onChange({ ...block, media: e.target.value })}
                placeholder={t({ es: "Pega el código para insertar (Instagram, Twitter, etc.)…", en: "Paste embed code (Instagram, Twitter, etc.)..." })}
                rows={3}
                className={`${S.textarea} mt-1 font-mono text-xs`}
              />
            </div>
          </div>
        )}

        {/* GALLERY */}
        {type === "gallery" && (
          <div className="space-y-3">
            <div className={S.label}>{t({ es: "Imágenes de la galería", en: "Gallery Images" })}</div>
            {(block.gallery ?? []).map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={img.src}
                  onChange={(e) => {
                    const g = [...(block.gallery ?? [])];
                    g[i] = { ...g[i], src: e.target.value };
                    onChange({ ...block, gallery: g });
                  }}
                  placeholder={t({ es: "URL de la imagen…", en: "Image URL..." })}
                  className={`${S.input} flex-1`}
                />
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => {
                    const g = [...(block.gallery ?? [])];
                    g[i] = { ...g[i], alt: e.target.value };
                    onChange({ ...block, gallery: g });
                  }}
                  placeholder={t({ es: "Texto alternativo…", en: "Alt text..." })}
                  className={`${S.input} w-40`}
                />
                <button
                  onClick={() => {
                    const g = (block.gallery ?? []).filter((_, idx) => idx !== i);
                    onChange({ ...block, gallery: g });
                  }}
                  className="p-1.5 rounded-lg text-[var(--olivea-clay)]/40 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const g = [...(block.gallery ?? []), { src: "", alt: "" }];
                onChange({ ...block, gallery: g });
              }}
              className="flex items-center gap-1.5 text-xs text-[var(--olivea-olive)] hover:text-[var(--olivea-ink)] transition-colors"
            >
              <Plus size={13} /> {t({ es: "Agregar imagen", en: "Add image" })}
            </button>
          </div>
        )}

        {/* DIVIDER */}
        {type === "divider" && (
          <div className="py-2">
            <hr className="border-[var(--olivea-olive)]/10" />
          </div>
        )}

        {/* HTML */}
        {type === "html" && (
          <div className="space-y-3">
            <div className={`flex gap-3`}>
              {showBothLangs ? (
                <>
                  <div className="flex-1">
                    <div className={S.langTag}>ES</div>
                    <textarea
                      value={block.content.es}
                      onChange={(e) => updateContent("es", e.target.value)}
                      placeholder={t({ es: "<div>HTML en español…</div>", en: "<div>Spanish HTML...</div>" })}
                      rows={4}
                      className={`${S.textarea} font-mono text-xs`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className={S.langTag}>EN</div>
                    <textarea
                      value={block.content.en}
                      onChange={(e) => updateContent("en", e.target.value)}
                      placeholder={t({ es: "<div>HTML en inglés…</div>", en: "<div>English HTML...</div>" })}
                      rows={4}
                      className={`${S.textarea} font-mono text-xs`}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1">
                  <textarea
                    value={block.content.es}
                    onChange={(e) => updateContent("es", e.target.value)}
                    placeholder={t({ es: "<div>HTML personalizado…</div>", en: "<div>Custom HTML...</div>" })}
                    rows={4}
                    className={`${S.textarea} font-mono text-xs`}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  LIVE PREVIEW PANEL                                                */
/* ═══════════════════════════════════════════════════════════════════ */

function LivePreview({
  post,
  blocks,
  previewLang,
}: {
  post: JournalPost;
  blocks: ContentBlock[];
  previewLang: "es" | "en";
}) {
  const html = useMemo(() => blocksToHtml(blocks, previewLang), [blocks, previewLang]);
  const { t } = useAdminLocale();

  return (
    <article className="max-w-2xl mx-auto px-8 py-10">
      {/* Cover */}
      {post.coverImage && (
        <div className="w-full h-56 rounded-2xl overflow-hidden mb-8 bg-[var(--olivea-cream)]/30 ring-1 ring-black/5">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${post.coverImage})` }}
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-serif font-medium text-[var(--olivea-ink)] mb-4 leading-tight">
        {post.title[previewLang] || t({ es: "Sin título", en: "Untitled" })}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-[var(--olivea-clay)] mb-8 pb-6 border-b border-black/5">
        <span>{post.authors?.length ? post.authors.map((a) => a.name).join(" & ") : post.author}</span>
        <span className="w-1 h-1 rounded-full bg-[var(--olivea-clay)]/30" />
        <span>
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString(previewLang === "es" ? "es-MX" : "en-US", { month: "long", day: "numeric", year: "numeric" })
            : t({ es: "Borrador", en: "Draft" })}
        </span>
        {post.tags.length > 0 && (
          <>
            <span className="w-1 h-1 rounded-full bg-[var(--olivea-clay)]/30" />
            <span>{post.tags.slice(0, 3).join(", ")}</span>
          </>
        )}
      </div>

      {/* Excerpt */}
      {post.excerpt[previewLang] && (
        <p className="text-lg text-[var(--olivea-ink)]/70 leading-relaxed mb-8 italic">
          {post.excerpt[previewLang]}
        </p>
      )}

      {/* Body */}
      <div
        className={[
          "prose prose-sm max-w-none",
          "text-[var(--olivea-ink)]/80 leading-[1.85]",
          "prose-headings:text-[var(--olivea-ink)] prose-headings:font-semibold",
          "prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4",
          "prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3",
          "prose-p:mb-5",
          "prose-blockquote:border-l-[var(--olivea-olive)]/30 prose-blockquote:text-[var(--olivea-ink)]/60 prose-blockquote:italic prose-blockquote:pl-5",
          "prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-black/5",
          "prose-figure:my-8",
          "prose-figcaption:text-center prose-figcaption:text-xs prose-figcaption:text-[var(--olivea-clay)]",
          "prose-hr:border-[var(--olivea-olive)]/10 prose-hr:my-10",
          "prose-a:text-[var(--olivea-olive)] prose-a:underline",
          /* j-wide editorial figure preview */
          "[&_figure.j-wide]:w-full [&_figure.j-wide]:mx-auto [&_figure.j-wide]:rounded-[20px] [&_figure.j-wide]:overflow-hidden",
          "[&_figure.j-wide]:bg-[var(--olivea-olive)]/40 [&_figure.j-wide]:p-1.5",
          "[&_figure.j-wide]:border [&_figure.j-wide]:border-[var(--olivea-olive)]/12",
          "[&_figure.j-wide]:shadow-[0_12px_30px_rgba(40,60,35,0.10)]",
          "[&_figure.j-wide_img]:rounded-[16px] [&_figure.j-wide_img]:w-full [&_figure.j-wide_img]:h-auto",
          /* float images */
          "[&_figure.float-left]:float-left [&_figure.float-left]:mr-4 [&_figure.float-left]:w-40 [&_figure.float-left]:h-40",
          "[&_figure.float-right]:float-right [&_figure.float-right]:ml-4 [&_figure.float-right]:w-40 [&_figure.float-right]:h-40",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: sanitizeEditorHtml(html || t({ es: "<p><em>Empieza a escribir para ver la vista previa aquí…</em></p>", en: "<p><em>Start writing to see the preview here...</em></p>" })) }}
      />
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  AUTHORS EDITOR                                                     */
/* ═══════════════════════════════════════════════════════════════════ */

function AuthorsEditor({
  authors,
  onChange,
}: {
  authors: JournalPostAuthor[];
  onChange: (a: JournalPostAuthor[]) => void;
}) {
  const { t } = useAdminLocale();
  const addAuthor = () => onChange([...authors, { id: "", name: "" }]);
  const removeAuthor = (idx: number) => {
    const next = authors.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : [{ name: "" }]);
  };
  const updateAuthor = (idx: number, field: "id" | "name", value: string) => {
    const next = [...authors];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]">
        <Users size={12} /> {t({ es: "Autores", en: "Authors" })}
      </label>
      <p className="text-[10px] text-[var(--olivea-clay)]/60 -mt-1">
        {t({
          es: "Agrega uno o más autores. Usa el ID para enlazar a las páginas de perfil del autor (p. ej. \"adrianarose\").",
          en: "Add one or more authors. Use the ID to link to author profile pages (e.g. \"adrianarose\").",
        })}
      </p>
      {authors.map((author, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={author.name}
            onChange={(e) => updateAuthor(i, "name", e.target.value)}
            placeholder={t({ es: "Nombre del autor…", en: "Author name..." })}
            className={`${S.input} flex-1`}
          />
          <input
            type="text"
            value={author.id ?? ""}
            onChange={(e) => updateAuthor(i, "id", e.target.value)}
            placeholder={t({ es: "ID (opcional)", en: "ID (optional)" })}
            className={`${S.input} w-32`}
          />
          <button
            onClick={() => removeAuthor(i)}
            className="p-1.5 rounded-lg text-[var(--olivea-clay)]/40 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={addAuthor}
        className="flex items-center gap-1.5 text-xs text-[var(--olivea-olive)] hover:text-[var(--olivea-ink)] transition-colors"
      >
        <UserPlus size={13} /> {t({ es: "Agregar autor", en: "Add author" })}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  GALLERY EDITOR (article-level, for PhotoCarousel)                  */
/* ═══════════════════════════════════════════════════════════════════ */

function ArticleGalleryEditor({
  gallery,
  onChange,
}: {
  gallery: JournalPostGalleryImage[];
  onChange: (g: JournalPostGalleryImage[]) => void;
}) {
  const { t } = useAdminLocale();
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= gallery.length) return;
    const g = [...gallery];
    [g[i], g[j]] = [g[j], g[i]];
    onChange(g);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]">
        <Images size={12} /> {t({ es: "Carrusel de fotos", en: "Photo carousel" })}
      </label>
      <p className="text-[10px] text-[var(--olivea-clay)]/60 -mt-1">
        {t({
          es: "El carrusel deslizable que se muestra después del cuerpo del artículo. El orden aquí = el orden en el carrusel.",
          en: "The swipeable carousel shown after the article body. Order here = order in the carousel.",
        })}
      </p>
      {gallery.map((img, i) => (
        <div key={i} className="flex items-center gap-2">
          {/* Reorder */}
          <div className="flex flex-col shrink-0">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="p-0.5 text-[var(--olivea-clay)]/40 hover:text-[var(--olivea-olive)] disabled:opacity-30 transition-colors"
              title={t(STR.moveUp)}
            >
              <ChevronDown size={12} className="rotate-180" />
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === gallery.length - 1}
              className="p-0.5 text-[var(--olivea-clay)]/40 hover:text-[var(--olivea-olive)] disabled:opacity-30 transition-colors"
              title={t(STR.moveDown)}
            >
              <ChevronDown size={12} />
            </button>
          </div>
          {/* Thumbnail */}
          {img.src ? (
            <div
              className="w-12 h-12 shrink-0 rounded-lg bg-cover bg-center ring-1 ring-black/5"
              style={{ backgroundImage: `url(${img.src})` }}
              title={img.src}
            />
          ) : (
            <div className="w-12 h-12 shrink-0 rounded-lg bg-[var(--olivea-cream)]/40 ring-1 ring-black/5" />
          )}
          <input
            type="text"
            value={img.src}
            onChange={(e) => {
              const g = [...gallery];
              g[i] = { ...g[i], src: e.target.value };
              onChange(g);
            }}
            placeholder="/images/journal/..."
            className={`${S.input} flex-1 font-mono text-xs`}
          />
          <input
            type="text"
            value={img.alt}
            onChange={(e) => {
              const g = [...gallery];
              g[i] = { ...g[i], alt: e.target.value };
              onChange(g);
            }}
            placeholder={t({ es: "Texto alternativo…", en: "Alt text..." })}
            className={`${S.input} w-36`}
          />
          <button
            onClick={() => onChange(gallery.filter((_, idx) => idx !== i))}
            className="p-1.5 rounded-lg text-[var(--olivea-clay)]/40 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {/* Upload a new image straight into the carousel */}
      <ImageUpload
        label={t({ es: "Agregar imagen (sube o elige de medios)", en: "Add image (upload or pick from media)" })}
        value=""
        onChange={(src) => {
          if (src) onChange([...gallery, { src, alt: "" }]);
        }}
        folder="journal"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  TAG INPUT                                                         */
/* ═══════════════════════════════════════════════════════════════════ */

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const { t } = useAdminLocale();
  const [input, setInput] = useState("");
  const addTag = () => {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]">
        <Tag size={12} /> {t({ es: "Etiquetas", en: "Tags" })}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--olivea-cream)]/60 text-[var(--olivea-ink)]/60 text-[11px] font-medium border border-[var(--olivea-olive)]/[0.06]"
          >
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))} className="hover:text-red-500 transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(); }
            if (e.key === "Backspace" && !input && tags.length > 0) onChange(tags.slice(0, -1));
          }}
          placeholder={t({ es: "Agregar etiqueta…", en: "Add tag..." })}
          className="flex-1 min-w-[80px] px-2 py-1 text-xs bg-transparent text-[var(--olivea-ink)] placeholder:text-[var(--olivea-clay)]/40 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN JOURNAL EDITOR                                               */
/* ═══════════════════════════════════════════════════════════════════ */

export default function JournalEditor({
  post,
  open,
  onClose,
  onSave,
  onPublish,
  onUnpublish,
}: {
  post: JournalPost | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: JournalPost) => void | Promise<void>;
  onPublish: (post: JournalPost) => void | Promise<void>;
  onUnpublish: (post: JournalPost) => void | Promise<void>;
}) {
  const [previewLang, setPreviewLang] = useState<"es" | "en">("es");
  const [title, setTitle] = useState<{ es: string; en: string }>({ es: "", en: "" });
  const [excerpt, setExcerpt] = useState<{ es: string; en: string }>({ es: "", en: "" });
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [coverAlt, setCoverAlt] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [authors, setAuthors] = useState<JournalPostAuthor[]>([{ name: "Adriana Rose", id: "adrianarose" }]);
  const [articleGallery, setArticleGallery] = useState<JournalPostGalleryImage[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([newBlock("paragraph")]);
  const [saved, setSaved] = useState(false);
  // Bilingual so the message re-translates if the admin switches locale.
  const [saveError, setSaveError] = useState<B | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showBothLangs, setShowBothLangs] = useState(true);
  const [showMeta, setShowMeta] = useState(false);
  const { t } = useAdminLocale();

  // Sync state when post changes
  useEffect(() => {
    if (post) {
      setTitle({ ...post.title });
      setExcerpt({ ...post.excerpt });
      setSlug(post.slug);
      setCoverImage(post.coverImage);
      setCoverAlt(post.coverAlt);
      setTags([...post.tags]);
      // Load authors — fall back to single author string
      if (post.authors?.length) {
        setAuthors([...post.authors]);
      } else if (post.author) {
        setAuthors([{ name: post.author }]);
      } else {
        setAuthors([{ name: "Adriana Rose", id: "adrianarose" }]);
      }
      // Load gallery — and migrate any legacy in-body gallery divs into it
      // (the old gallery block wrote unstyled <div class="gallery"> markup
      // into the body; the carousel actually reads post.gallery).
      const esLegacy = extractLegacyGalleries(post.body.es);
      const enLegacy = extractLegacyGalleries(post.body.en);
      const gallery = post.gallery ? [...post.gallery] : [];
      for (const img of [...esLegacy.images, ...enLegacy.images]) {
        if (!gallery.some((g) => g.src === img.src)) gallery.push(img);
      }
      setArticleGallery(gallery);
      setSaved(false);
      setSaveError(null);
      // Convert existing HTML body to blocks
      const parsed = htmlToBlocks(esLegacy.cleaned);
      // Fill in EN content where blocks exist
      if (enLegacy.cleaned) {
        const enParts = enLegacy.cleaned.split(/\n\n+/).filter(Boolean);
        parsed.forEach((block, i) => {
          if (enParts[i]) {
            block.content.en = enParts[i].replace(/<\/?p>/g, "");
          }
        });
      }
      setBlocks(parsed.length > 0 ? parsed : [newBlock("paragraph")]);
    }
  }, [post]);

  // Auto-generate slug from the Spanish title, falling back to English so an
  // English-only draft still gets a slug (the column is UNIQUE and NOT NULL).
  useEffect(() => {
    const source = title.es || title.en;
    if (post && !post.slug && source) {
      const generated = source
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);
      setSlug(generated);
    }
  }, [title.es, title.en, post]);

  const getCurrentPost = useCallback((): JournalPost | null => {
    if (!post) return null;
    // Derive legacy author string from authors array
    const authorStr = authors.filter((a) => a.name).map((a) => a.name).join(", ") || "Olivea";
    return {
      ...post,
      title,
      excerpt,
      body: {
        es: blocksToHtml(blocks, "es"),
        en: blocksToHtml(blocks, "en"),
      },
      slug,
      coverImage,
      coverAlt,
      author: authorStr,
      authors: authors.filter((a) => a.name.trim()),
      gallery: articleGallery.filter((g) => g.src.trim()),
      tags,
      updatedAt: new Date().toISOString(),
    };
  }, [post, title, excerpt, blocks, slug, coverImage, coverAlt, tags, authors, articleGallery]);

  const handleSave = async () => {
    const updated = getCurrentPost();
    if (!updated) return;

    // journal_posts.slug is UNIQUE and NOT NULL. An untitled draft would
    // save with an empty slug and the next one would violate the constraint,
    // so require a title rather than letting the save fail downstream.
    if (!updated.slug.trim()) {
      setSaveError({
        es: "Agrega un título antes de guardar.",
        en: "Add a title before saving.",
      });
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      // Must await: onSave persists to Supabase and rolls back on failure.
      // Reporting "Saved" without awaiting is how a failed create looked
      // like the post erasing itself.
      await onSave(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setSaveError(
        msg
          ? { es: msg, en: msg }
          : { es: "No se pudo guardar.", en: "Could not save." }
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const updated = getCurrentPost();
    if (!updated) return;
    setSaveError(null);
    try {
      await onPublish(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setSaveError(
        msg
          ? { es: msg, en: msg }
          : { es: "No se pudo publicar.", en: "Could not publish." }
      );
    }
  };

  const handleUnpublish = async () => {
    const updated = getCurrentPost();
    if (!updated) return;
    setSaveError(null);
    try {
      await onUnpublish(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setSaveError(
        msg
          ? { es: msg, en: msg }
          : { es: "No se pudo despublicar.", en: "Could not unpublish." }
      );
    }
  };

  const addBlock = (type: BlockType, afterIndex?: number) => {
    const block = newBlock(type);
    setBlocks((prev) => {
      const idx = afterIndex !== undefined ? afterIndex + 1 : prev.length;
      const next = [...prev];
      next.splice(idx, 0, block);
      return next;
    });
  };

  const updateBlock = (id: string, updated: ContentBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      return next.length > 0 ? next : [newBlock("paragraph")];
    });
  };

  const isNew = post ? post.title.es === "" && post.title.en === "" : true;
  const canPublish = title.es.length > 0 && blocks.some((b) => b.content.es.length > 0 || b.media);
  const wordCount = blocks.reduce((sum, b) => sum + (b.content.es || "").split(/\s+/).filter(Boolean).length, 0);

  return (
    <AnimatePresence>
      {open && post && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[3px] z-[60]"
          />

          {/* Full-screen editor */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed inset-3 z-[61] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl ring-1 ring-black/10 flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 h-13 border-b border-black/5 flex-shrink-0 bg-white/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/50 transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-sm font-semibold text-[var(--olivea-ink)]">
                  {isNew ? t({ es: "Nuevo artículo", en: "New Article" }) : t({ es: "Editar artículo", en: "Edit Article" })}
                </h2>
                {post.status === "published" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-medium border border-emerald-200/60">
                    <Check size={10} /> {t({ es: "En vivo", en: "Live" })}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle side-by-side langs */}
                <button
                  onClick={() => setShowBothLangs(!showBothLangs)}
                  title={showBothLangs ? t({ es: "Un solo idioma", en: "Single language" }) : t({ es: "ES/EN lado a lado", en: "Side-by-side ES/EN" })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    showBothLangs
                      ? "bg-[var(--olivea-cream)]/60 text-[var(--olivea-olive)] border-[var(--olivea-olive)]/10"
                      : "text-[var(--olivea-clay)] border-transparent hover:bg-white/60"
                  }`}
                >
                  <Columns2 size={13} />
                  ES / EN
                </button>

                {/* Toggle preview */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    showPreview
                      ? "bg-[var(--olivea-cream)]/60 text-[var(--olivea-olive)] border-[var(--olivea-olive)]/10"
                      : "text-[var(--olivea-clay)] border-transparent hover:bg-white/60"
                  }`}
                >
                  <Eye size={13} />
                  {t({ es: "Vista previa", en: "Preview" })}
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border disabled:opacity-60 ${
                    saveError
                      ? "bg-red-50 text-red-600 border-red-200/60"
                      : saved
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                        : "text-[var(--olivea-ink)]/60 hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/50 border-[var(--olivea-olive)]/[0.06]"
                  }`}
                >
                  {saved && !saveError ? <Check size={13} /> : <Save size={13} />}
                  {saving
                    ? t({ es: "Guardando…", en: "Saving…" })
                    : saved && !saveError
                      ? t({ es: "Guardado", en: "Saved" })
                      : t(STR.save)}
                </button>

                {/* Publish / Unpublish */}
                {post.status === "published" ? (
                  <button
                    onClick={handleUnpublish}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200/60 hover:bg-amber-100/60 transition-all"
                  >
                    <EyeOff size={13} /> {t({ es: "Despublicar", en: "Unpublish" })}
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={!canPublish}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      canPublish
                        ? "bg-[var(--olivea-olive)] text-white shadow-[0_2px_8px_rgba(94,118,88,0.2)] hover:shadow-[0_4px_16px_rgba(94,118,88,0.25)]"
                        : "bg-[var(--olivea-cream)]/60 text-[var(--olivea-clay)] cursor-not-allowed"
                    }`}
                  >
                    <Send size={13} /> {t({ es: "Publicar", en: "Publish" })}
                  </button>
                )}
              </div>
            </div>

            {/* Save failed — the post was rolled back, so say so instead of
                letting it silently disappear from the list. */}
            {saveError && (
              <div
                role="alert"
                className="mx-6 mt-3 rounded-lg border border-red-200/70 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {t(saveError)}
              </div>
            )}

            {/* ── Body: Editor + Preview ── */}
            <div className="flex-1 flex overflow-hidden">
              {/* Editor column */}
              <div className={`flex-1 overflow-y-auto ${showPreview ? "border-r border-black/5" : ""}`}>
                <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
                  {/* Metadata section (collapsible) */}
                  <div className="rounded-2xl bg-[var(--olivea-cream)]/20 ring-1 ring-black/5 overflow-hidden">
                    <button
                      onClick={() => setShowMeta(!showMeta)}
                      className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-[var(--olivea-ink)]/70 hover:text-[var(--olivea-ink)] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Globe size={14} className="text-[var(--olivea-olive)]" />
                        {t({ es: "Configuración del artículo", en: "Article Settings" })}
                      </span>
                      <ChevronDown size={14} className={`transition-transform ${showMeta ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showMeta && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-black/[0.03]">
                            {/* Authors */}
                            <div className="pt-4">
                              <AuthorsEditor authors={authors} onChange={setAuthors} />
                            </div>

                            {/* Cover image */}
                            <div className="space-y-2">
                              <label className={S.label}>{t({ es: "Imagen de portada", en: "Cover Image" })}</label>
                              {coverImage ? (
                                <div className="relative rounded-xl overflow-hidden h-32 bg-[var(--olivea-cream)]/30 ring-1 ring-black/5 group">
                                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }} />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <button
                                      onClick={() => setCoverImage(undefined)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-white/90 text-xs font-medium text-[var(--olivea-ink)]"
                                    >
                                      {t(STR.remove)}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value=""
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder={t({ es: "Ingresa la URL de la imagen o súbela…", en: "Enter image URL or upload..." })}
                                    className={S.input}
                                    onBlur={(e) => { if (e.target.value) setCoverImage(e.target.value); }}
                                  />
                                </div>
                              )}
                              {coverImage && (
                                <div>
                                  <label className={S.label}>{t({ es: "Texto alternativo de portada", en: "Cover Alt Text" })}</label>
                                  <input
                                    type="text"
                                    value={coverAlt ?? ""}
                                    onChange={(e) => setCoverAlt(e.target.value || undefined)}
                                    placeholder={t({ es: "Describe la imagen de portada para accesibilidad…", en: "Describe the cover image for accessibility..." })}
                                    className={`${S.input} mt-1`}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-1.5">
                              <label className={S.label}>{t({ es: "Slug de URL", en: "URL Slug" })}</label>
                              <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-[var(--olivea-olive)]/[0.08] bg-white/60">
                                <span className="px-3 py-2.5 text-xs text-[var(--olivea-clay)]/50 bg-[var(--olivea-cream)]/30 border-r border-[var(--olivea-olive)]/[0.06] whitespace-nowrap">
                                  /journal/
                                </span>
                                <input
                                  type="text"
                                  value={slug}
                                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                                  className="flex-1 px-3 py-2.5 bg-transparent text-sm text-[var(--olivea-ink)] focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Tags */}
                            <TagInput tags={tags} onChange={setTags} />

                            {/* Photo Gallery (article-level) */}
                            <ArticleGalleryEditor gallery={articleGallery} onChange={setArticleGallery} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Title — always visible, prominent */}
                  <div className={`flex gap-4`}>
                    {showBothLangs ? (
                      <>
                        <div className="flex-1">
                          <div className={S.langTag}>ES</div>
                          <input
                            type="text"
                            value={title.es}
                            onChange={(e) => setTitle({ ...title, es: e.target.value })}
                            placeholder={t({ es: "Título del artículo…", en: "Article title..." })}
                            className={`${S.input} text-xl font-serif !py-3`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className={S.langTag}>EN</div>
                          <input
                            type="text"
                            value={title.en}
                            onChange={(e) => setTitle({ ...title, en: e.target.value })}
                            placeholder={t({ es: "Título del artículo…", en: "Article title..." })}
                            className={`${S.input} text-xl font-serif !py-3`}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={title.es}
                          onChange={(e) => setTitle({ ...title, es: e.target.value })}
                          placeholder={t({ es: "Título del artículo…", en: "Article title..." })}
                          className={`${S.input} text-xl font-serif !py-3`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className={`flex gap-4`}>
                    {showBothLangs ? (
                      <>
                        <div className="flex-1">
                          <div className={S.langTag}>ES</div>
                          <textarea
                            value={excerpt.es}
                            onChange={(e) => setExcerpt({ ...excerpt, es: e.target.value })}
                            placeholder={t({ es: "Breve descripción…", en: "Brief description..." })}
                            rows={2}
                            className={`${S.textarea}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className={S.langTag}>EN</div>
                          <textarea
                            value={excerpt.en}
                            onChange={(e) => setExcerpt({ ...excerpt, en: e.target.value })}
                            placeholder={t({ es: "Breve descripción…", en: "Brief description..." })}
                            rows={2}
                            className={`${S.textarea}`}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex-1">
                        <textarea
                          value={excerpt.es}
                          onChange={(e) => setExcerpt({ ...excerpt, es: e.target.value })}
                          placeholder={t({ es: "Breve descripción…", en: "Brief description..." })}
                          rows={2}
                          className={S.textarea}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Content blocks ── */}
                  <div className="space-y-3">
                    <Reorder.Group
                      axis="y"
                      values={blocks}
                      onReorder={setBlocks}
                      className="space-y-3"
                    >
                      {blocks.map((block) => (
                        <Reorder.Item
                          key={block.id}
                          value={block}
                          className="list-none"
                        >
                          <BlockEditor
                            block={block}
                            onChange={(updated) => updateBlock(block.id, updated)}
                            onDelete={() => deleteBlock(block.id)}
                            showBothLangs={showBothLangs}
                          />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>

                    {/* Add block button */}
                    <div className="py-2">
                      <AddBlockMenu onAdd={(type) => addBlock(type)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview column */}
              {showPreview && (
                <div className="w-[45%] min-w-[380px] flex flex-col bg-[var(--olivea-cream)]/10 overflow-hidden">
                  {/* Preview lang toggle */}
                  <div className="flex items-center gap-2 px-5 py-2.5 border-b border-black/[0.03] bg-white/40 flex-shrink-0">
                    <Eye size={13} className="text-[var(--olivea-clay)]/50" />
                    <span className="text-[11px] font-medium text-[var(--olivea-clay)]/60 uppercase tracking-wider">{t({ es: "Vista previa", en: "Preview" })}</span>
                    <div className="flex-1" />
                    {(["es", "en"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setPreviewLang(l)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          previewLang === l
                            ? "bg-white text-[var(--olivea-ink)] shadow-sm ring-1 ring-black/5"
                            : "text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)]"
                        }`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <LivePreview
                      post={getCurrentPost() ?? post}
                      blocks={blocks}
                      previewLang={previewLang}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-2.5 border-t border-black/[0.03] flex items-center justify-between text-[10px] text-[var(--olivea-clay)]/50 flex-shrink-0 bg-white/60">
              <span>{blocks.length} {t({ es: "bloques", en: "blocks" })} · {wordCount} {t({ es: "palabras", en: "words" })}</span>
              <span>{t({ es: "Último guardado:", en: "Last saved:" })} {post ? new Date(post.updatedAt).toLocaleString() : t({ es: "Nunca", en: "Never" })}</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
