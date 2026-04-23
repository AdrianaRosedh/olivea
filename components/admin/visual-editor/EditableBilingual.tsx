"use client";

import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

interface EditableBilingualProps {
  /** Current bilingual value */
  value: { es: string; en: string };
  /** Called on change */
  onChange: (v: { es: string; en: string }) => void;
  /** Visual tag to render as (determines styling) */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "small";
  /** Extra className applied to the display text */
  className?: string;
  /** Whether to render as multiline textarea when editing */
  multiline?: boolean;
  /** Placeholder when content is empty */
  placeholder?: string;
  /** Label shown in the editing tooltip */
  label?: string;
}

/* ── Component ────────────────────────────────────────────────────── */

export default function EditableBilingual({
  value,
  onChange,
  as: Tag = "p",
  className = "",
  multiline = false,
  placeholder = "Click to edit...",
  label,
}: EditableBilingualProps) {
  const [editing, setEditing] = useState(false);
  const [lang, setLang] = useState<"es" | "en">("es");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Focus the input when entering edit mode */
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at end
      const el = inputRef.current;
      if ("setSelectionRange" in el) {
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }
  }, [editing, lang]);

  /* Close on click outside */
  useEffect(() => {
    if (!editing) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editing]);

  /* Handle keyboard */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setEditing(false);
    }
    if (e.key === "Enter" && !multiline) {
      setEditing(false);
    }
  };

  const handleChange = (text: string) => {
    onChange({ ...value, [lang]: text });
  };

  const displayText = value[lang] || "";
  const isEmpty = !value.es && !value.en;

  /* ── Display mode ──────────────────────────────────────────── */

  if (!editing) {
    return (
      <div
        className="group relative cursor-pointer"
        onClick={() => setEditing(true)}
      >
        {/* Hover highlight */}
        <div className="absolute -inset-2 rounded-lg border-2 border-transparent group-hover:border-[var(--olivea-olive)]/25 group-hover:bg-[var(--olivea-olive)]/[0.04] transition-all pointer-events-none" />

        {/* Edit hint */}
        <div className="absolute -top-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--olivea-olive)] text-white text-[10px] font-semibold uppercase tracking-wider shadow-sm">
            {label || Tag}
            <Languages className="w-2.5 h-2.5" />
          </span>
        </div>

        <Tag className={`${className} ${isEmpty ? "text-stone-400 italic" : ""}`}>
          {isEmpty ? placeholder : displayText}
        </Tag>
      </div>
    );
  }

  /* ── Edit mode ─────────────────────────────────────────────── */

  const inputClassName = multiline
    ? "w-full min-h-[80px] resize-y rounded-lg border-2 border-[var(--olivea-olive)]/40 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none transition-colors"
    : "w-full rounded-lg border-2 border-[var(--olivea-olive)]/40 bg-white px-3 py-1.5 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none transition-colors";

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {/* Label + lang toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--olivea-olive)]">
          {label || Tag}
        </span>
        <div className="flex items-center rounded-md bg-stone-100 p-0.5">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                lang === l
                  ? "bg-white text-[var(--olivea-olive)] shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value[lang]}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value[lang]}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          placeholder={placeholder}
        />
      )}

      {/* Other language preview */}
      <div className="text-[11px] text-stone-400 italic pl-1">
        {lang === "es" ? "EN" : "ES"}: {value[lang === "es" ? "en" : "es"] || "(empty)"}
      </div>
    </div>
  );
}
