"use client";

/**
 * Reusable bilingual input (ES + EN side by side).
 * Used across all admin content editors for consistent UX.
 */

interface BilingualFieldProps {
  label: string;
  value: { es: string; en: string };
  onChange: (val: { es: string; en: string }) => void;
  /** "input" (default) or "textarea" for longer text */
  type?: "input" | "textarea";
  /** Textarea rows (default 3) */
  rows?: number;
  /** Optional placeholder */
  placeholder?: string;
  disabled?: boolean;
}

export default function BilingualField({
  label,
  value,
  onChange,
  type = "input",
  rows = 3,
  placeholder,
  disabled = false,
}: BilingualFieldProps) {
  const inputCls =
    "w-full text-sm px-3 py-2 rounded-md border border-stone-300 bg-white/70 text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-olive-500 focus:border-olive-500 outline-none disabled:opacity-50";

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] font-semibold text-stone-400 uppercase">ES</span>
          {type === "textarea" ? (
            <textarea
              value={value.es}
              onChange={(e) => onChange({ ...value, es: e.target.value })}
              rows={rows}
              placeholder={placeholder ? `${placeholder} (ES)` : undefined}
              className={inputCls}
              disabled={disabled}
            />
          ) : (
            <input
              type="text"
              value={value.es}
              onChange={(e) => onChange({ ...value, es: e.target.value })}
              placeholder={placeholder ? `${placeholder} (ES)` : undefined}
              className={inputCls}
              disabled={disabled}
            />
          )}
        </div>
        <div>
          <span className="text-[10px] font-semibold text-stone-400 uppercase">EN</span>
          {type === "textarea" ? (
            <textarea
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              rows={rows}
              placeholder={placeholder ? `${placeholder} (EN)` : undefined}
              className={inputCls}
              disabled={disabled}
            />
          ) : (
            <input
              type="text"
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder ? `${placeholder} (EN)` : undefined}
              className={inputCls}
              disabled={disabled}
            />
          )}
        </div>
      </div>
    </div>
  );
}
