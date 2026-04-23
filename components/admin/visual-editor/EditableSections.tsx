"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Type,
  Layers,
} from "lucide-react";
import EditableBilingual from "./EditableBilingual";

/* ── Types ────────────────────────────────────────────────────────── */

interface SectionItem {
  id?: string;
  title?: { es: string; en: string };
  subtitle?: { es: string; en: string };
  body?: { es: string; en: string };
  description?: { es: string; en: string };
  image?: { src: string; alt?: { es: string; en: string } };
  [key: string]: unknown;
}

interface EditableSectionsProps {
  /** Current sections array */
  value: SectionItem[];
  /** Called when sections change */
  onChange: (v: SectionItem[]) => void;
  /** Label for the section group */
  label: string;
  /** Which fields to show per section — defaults to title + body */
  fields?: ("title" | "subtitle" | "body" | "description" | "image")[];
  /** Whether new items can be added */
  allowAdd?: boolean;
  /** Whether items can be deleted */
  allowDelete?: boolean;
  /** Whether items can be reordered */
  allowReorder?: boolean;
  /** Whether section starts collapsed */
  collapsed?: boolean;
}

/* ── Component ────────────────────────────────────────────────────── */

export default function EditableSections({
  value,
  onChange,
  label,
  fields = ["title", "body"],
  allowAdd = true,
  allowDelete = true,
  allowReorder = true,
  collapsed: startCollapsed = true,
}: EditableSectionsProps) {
  const [open, setOpen] = useState(!startCollapsed);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const updateItem = (idx: number, patch: Partial<SectionItem>) => {
    const updated = [...value];
    updated[idx] = { ...updated[idx], ...patch };
    onChange(updated);
  };

  const removeItem = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    const newItem: SectionItem = {};
    if (fields.includes("title")) newItem.title = { es: "", en: "" };
    if (fields.includes("subtitle")) newItem.subtitle = { es: "", en: "" };
    if (fields.includes("body")) newItem.body = { es: "", en: "" };
    if (fields.includes("description")) newItem.description = { es: "", en: "" };
    if (fields.includes("image")) newItem.image = { src: "" };
    onChange([...value, newItem]);
    setExpandedIdx(value.length);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const updated = [...value];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    onChange(updated);
    setExpandedIdx(target);
  };

  const getPreviewLabel = (item: SectionItem, idx: number) => {
    const title = item.title?.es || item.title?.en;
    if (title) return title;
    const desc = item.description?.es || item.description?.en;
    if (desc) return desc.slice(0, 50) + (desc.length > 50 ? "…" : "");
    return `Section ${idx + 1}`;
  };

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white/50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <Layers className="w-3.5 h-3.5" />
          {label}
          <span className="text-[10px] font-normal text-stone-400">
            ({value.length} {value.length === 1 ? "item" : "items"})
          </span>
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        )}
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-stone-200/60 space-y-2">
          {value.length === 0 && (
            <p className="text-sm text-stone-400 italic py-4 text-center">
              No sections yet
            </p>
          )}

          {value.map((item, idx) => {
            const isExpanded = expandedIdx === idx;

            return (
              <div
                key={idx}
                className="rounded-lg border border-stone-200/80 bg-white overflow-hidden"
              >
                {/* Section header bar */}
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                >
                  {allowReorder && (
                    <GripVertical className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />
                  )}

                  {/* Icon based on content */}
                  {item.image?.src ? (
                    <ImageIcon className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  ) : (
                    <Type className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  )}

                  <span className="text-sm text-stone-700 font-medium truncate flex-1">
                    {getPreviewLabel(item, idx)}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {allowReorder && idx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveItem(idx, -1); }}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 text-[10px]"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {allowReorder && idx < value.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveItem(idx, 1); }}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 text-[10px]"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    {allowDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                        className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </div>
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-100 space-y-4">
                    {fields.includes("title") && (
                      <EditableBilingual
                        label="Title"
                        as="h3"
                        value={item.title ?? { es: "", en: "" }}
                        onChange={(v) => updateItem(idx, { title: v })}
                        className="text-base font-semibold text-stone-800"
                        placeholder="Section title..."
                      />
                    )}

                    {fields.includes("subtitle") && (
                      <EditableBilingual
                        label="Subtitle"
                        as="p"
                        value={item.subtitle ?? { es: "", en: "" }}
                        onChange={(v) => updateItem(idx, { subtitle: v })}
                        className="text-sm text-stone-600"
                        placeholder="Subtitle..."
                      />
                    )}

                    {fields.includes("body") && (
                      <EditableBilingual
                        label="Body"
                        as="p"
                        value={item.body ?? { es: "", en: "" }}
                        onChange={(v) => updateItem(idx, { body: v })}
                        className="text-sm text-stone-600"
                        placeholder="Body text..."
                        multiline
                      />
                    )}

                    {fields.includes("description") && (
                      <EditableBilingual
                        label="Description"
                        as="p"
                        value={item.description ?? { es: "", en: "" }}
                        onChange={(v) => updateItem(idx, { description: v })}
                        className="text-sm text-stone-600"
                        placeholder="Description..."
                        multiline
                      />
                    )}

                    {fields.includes("image") && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          Image
                        </span>
                        <input
                          type="text"
                          value={item.image?.src ?? ""}
                          onChange={(e) =>
                            updateItem(idx, {
                              image: { ...item.image, src: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none"
                          placeholder="/images/..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add button */}
          {allowAdd && (
            <button
              onClick={addItem}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-stone-300 text-stone-500 text-xs font-semibold uppercase tracking-wider hover:border-[var(--olivea-olive)] hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.03] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Section
            </button>
          )}
        </div>
      )}
    </div>
  );
}
