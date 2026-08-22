"use client";

import { useState } from "react";
import { ImageIcon, Upload, X, ExternalLink } from "lucide-react";
import { useAdminLocale, resolveLabel, type MaybeB } from "@/lib/admin/i18n";
import ImageUpload from "@/components/admin/ImageUpload";

/* ── Types ────────────────────────────────────────────────────────── */

interface EditableImageProps {
  /** Current image src */
  src: string;
  /** Alt text (for display) */
  alt?: string;
  /** Called when src changes */
  onChange: (src: string) => void;
  /** Image display className (controls size, rounding, etc.) */
  className?: string;
  /** Label shown on hover (string or bilingual) */
  label?: MaybeB;
  /** Aspect ratio hint */
  aspect?: "hero" | "square" | "wide" | "auto";
  /** Max height in px — prevents hero from dominating the viewport */
  maxHeight?: number;
  /** Storage folder for uploads, e.g. "casa" or "heroes". */
  folder?: string;
}

/* ── Component ────────────────────────────────────────────────────── */

export default function EditableImage({
  src,
  alt = "",
  onChange,
  className = "",
  label,
  aspect = "auto",
  maxHeight,
  folder = "general",
}: EditableImageProps) {
  const { locale, t } = useAdminLocale();
  const labelText = resolveLabel(label, locale) || t({ es: "Imagen", en: "Image" });
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(src);
  const [imgError, setImgError] = useState(false);

  const aspectClass = {
    hero: "aspect-[2.8/1]",    // cinematic — shorter than 16/9
    square: "aspect-square",
    wide: "aspect-[21/9]",
    auto: "",
  }[aspect];

  const maxH = maxHeight
    ? { maxHeight: `${maxHeight}px` }
    : aspect === "hero"
      ? { maxHeight: "320px" }
      : {};

  const handleSave = () => {
    onChange(urlInput);
    setImgError(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setUrlInput(src);
    setEditing(false);
  };

  /* ── Edit mode ──────────────────────────────────────────── */

  if (editing) {
    return (
      <div className={`relative rounded-2xl border-2 border-[var(--olivea-olive)]/30 bg-white p-4 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--olivea-olive)]">
            {labelText}
          </span>
          <button onClick={handleCancel} className="p-1 rounded-md hover:bg-stone-100 text-stone-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preview */}
        {urlInput && (
          <div
            className={`relative overflow-hidden rounded-xl bg-stone-100 ${aspectClass || "aspect-video"}`}
            style={maxH}
          >
            {/* Use a regular <img> for reliable previews of local paths */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlInput}
              alt={alt}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            {imgError && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                <div className="text-center space-y-1">
                  <ImageIcon className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs text-stone-400">{t({ es: "Vista previa no disponible", en: "Preview unavailable" })}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload is the primary path. Typing a server path assumes the
            image is already on the server, which is the step people were
            actually stuck on. */}
        <ImageUpload
          value={urlInput}
          onChange={(url) => {
            setUrlInput(url);
            setImgError(false);
            onChange(url);
            setEditing(false);
          }}
          folder={folder}
          budget={aspect === "hero" ? "hero" : "card"}
          label={t({ es: "Subir imagen", en: "Upload image" })}
          hint={t({
            es: "Arrastra un archivo o haz clic para elegirlo. Se optimiza automáticamente.",
            en: "Drag a file here or click to choose one. It is optimised automatically.",
          })}
        />

        {/* Kept for images already on the site, and for pasting a URL. */}
        <details className="group">
          <summary className="cursor-pointer text-[10px] font-medium uppercase tracking-wide text-stone-400 hover:text-stone-600">
            {t({ es: "o usar una ruta existente", en: "or use an existing path" })}
          </summary>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setImgError(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none"
            placeholder="/images/..."
          />
        </details>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-[var(--olivea-olive)] text-white text-xs font-semibold hover:bg-[var(--olivea-clay)] transition-colors"
          >
            {t({ es: "Guardar", en: "Save" })}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
          >
            {t({ es: "Cancelar", en: "Cancel" })}
          </button>
        </div>
      </div>
    );
  }

  /* ── Display mode ──────────────────────────────────────────── */

  const hasImage = src && src.length > 0;

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden ${className}`}
      onClick={() => {
        setUrlInput(src);
        setEditing(true);
      }}
    >
      {hasImage && !imgError ? (
        <div className={`relative w-full ${aspectClass || "aspect-video"}`} style={maxH}>
          {/* Use <img> for reliable rendering of local /images/ paths */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className={`relative w-full ${aspectClass || "aspect-video"} bg-gradient-to-br from-stone-100 to-stone-200 flex flex-col items-center justify-center gap-2`}
          style={maxH}
        >
          <ImageIcon className="w-8 h-8 text-stone-300" />
          {hasImage && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-stone-200/60">
              <ExternalLink className="w-3 h-3 text-stone-400" />
              <span className="text-[11px] text-stone-500 font-mono truncate max-w-[240px]">{src}</span>
            </div>
          )}
          {!hasImage && (
            <span className="text-xs text-stone-400">{t({ es: "Sin imagen", en: "No image set" })}</span>
          )}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-stone-800 text-sm font-medium shadow-lg">
          <Upload className="w-4 h-4" />
          {t({ es: "Cambiar", en: "Change" })} {labelText}
        </div>
      </div>
    </div>
  );
}
