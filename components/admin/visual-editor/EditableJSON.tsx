"use client";

import { useState, useEffect, useRef } from "react";
import { Code2, ChevronDown, ChevronRight, Check, X } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

interface EditableJSONProps {
  /** Current value (any JSON-serializable data) */
  value: unknown;
  /** Called on change */
  onChange: (v: unknown) => void;
  /** Label shown in the header */
  label: string;
  /** Number of textarea rows */
  rows?: number;
  /** Whether section starts collapsed */
  collapsed?: boolean;
}

/* ── Component ────────────────────────────────────────────────────── */

export default function EditableJSON({
  value,
  onChange,
  label,
  rows = 8,
  collapsed: startCollapsed = true,
}: EditableJSONProps) {
  const [open, setOpen] = useState(!startCollapsed);
  const [text, setText] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync text from value
  useEffect(() => {
    setText(value !== undefined ? JSON.stringify(value, null, 2) : "");
    setIsValid(true);
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    try {
      const parsed = JSON.parse(raw);
      onChange(parsed);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };

  const itemCount = Array.isArray(value) ? value.length : typeof value === "object" && value ? Object.keys(value).length : 0;

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white/50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <Code2 className="w-3.5 h-3.5" />
          {label}
          {itemCount > 0 && (
            <span className="text-[10px] font-normal text-stone-400">
              ({itemCount} {itemCount === 1 ? "item" : "items"})
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {!isValid && (
            <span className="text-[10px] font-medium text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" /> Invalid JSON
            </span>
          )}
          {isValid && editing && (
            <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Valid
            </span>
          )}
          {open ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-stone-200/60">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              handleChange(e.target.value);
              setEditing(true);
            }}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            rows={rows}
            className={`w-full text-xs font-mono px-3 py-2.5 rounded-lg border bg-stone-50/70 text-stone-800 focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none transition-colors resize-y ${
              isValid ? "border-stone-200" : "border-red-400 focus:ring-red-200"
            }`}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
