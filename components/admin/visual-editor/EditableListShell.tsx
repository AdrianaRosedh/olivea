"use client";

// Small shared shell for editing ordered lists in the visual editors:
// renders each item in a bordered row with move-up/move-down/remove
// controls and an "add" button. The caller renders the item's fields.

import type { ReactNode } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { useAdminLocale, resolveLabel, type MaybeB } from "@/lib/admin/i18n";

interface EditableListShellProps<T> {
  label: MaybeB;
  items: T[];
  onChange: (items: T[]) => void;
  /** Renders one item's editable fields */
  renderItem: (item: T, update: (patch: Partial<T> | T) => void, index: number) => ReactNode;
  /** Factory for a new empty item */
  makeItem: () => T;
  addLabel?: MaybeB;
}

export default function EditableListShell<T>({
  label,
  items,
  onChange,
  renderItem,
  makeItem,
  addLabel,
}: EditableListShellProps<T>) {
  const { locale, t } = useAdminLocale();
  const labelText = resolveLabel(label, locale);
  const addLabelText = resolveLabel(addLabel, locale) || t({ es: "Agregar elemento", en: "Add item" });
  const update = (i: number, patch: Partial<T> | T) => {
    const next = [...items];
    next[i] =
      patch && typeof patch === "object" && !Array.isArray(patch)
        ? { ...next[i], ...patch }
        : (patch as T);
    onChange(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full bg-[var(--olivea-olive)]" />
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{labelText}</span>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-stone-200/70 bg-white/70 p-3">
          <div className="flex gap-2">
            <div className="flex flex-col shrink-0 pt-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-0.5 text-stone-400 hover:text-[var(--olivea-olive)] disabled:opacity-30 transition-colors"
                title={t({ es: "Subir", en: "Move up" })}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-0.5 text-stone-400 hover:text-[var(--olivea-olive)] disabled:opacity-30 transition-colors"
                title={t({ es: "Bajar", en: "Move down" })}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              {renderItem(item, (patch) => update(i, patch), i)}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="self-start p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title={t({ es: "Quitar", en: "Remove" })}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, makeItem()])}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-stone-300 text-stone-500 text-xs font-medium hover:border-[var(--olivea-olive)]/40 hover:text-[var(--olivea-olive)] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabelText}
      </button>
    </div>
  );
}
