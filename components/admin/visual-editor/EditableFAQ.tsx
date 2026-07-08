"use client";

import { useState } from "react";
import {
  HelpCircle,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import EditableBilingual from "./EditableBilingual";
import { useAdminLocale, resolveLabel, type MaybeB } from "@/lib/admin/i18n";

/* ── Types ────────────────────────────────────────────────────────── */

interface FaqEntry {
  id?: string;
  question: { es: string; en: string };
  answer: { es: string; en: string };
  [key: string]: unknown;
}

interface EditableFAQProps {
  /** Current FAQ array */
  value: FaqEntry[];
  /** Called when FAQ changes */
  onChange: (v: FaqEntry[]) => void;
  /** Label (string or bilingual) */
  label?: MaybeB;
  /** Whether section starts collapsed */
  collapsed?: boolean;
}

/* ── Component ────────────────────────────────────────────────────── */

export default function EditableFAQ({
  value,
  onChange,
  label = "FAQ",
  collapsed: startCollapsed = true,
}: EditableFAQProps) {
  const { locale, t } = useAdminLocale();
  const labelText = resolveLabel(label, locale);
  const [open, setOpen] = useState(!startCollapsed);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const updateItem = (idx: number, patch: Partial<FaqEntry>) => {
    const updated = [...value];
    updated[idx] = { ...updated[idx], ...patch };
    onChange(updated);
  };

  const removeItem = (idx: number) => {
    const q = value[idx]?.question?.en || value[idx]?.question?.es || "this question";
    const preview = q.length > 60 ? q.slice(0, 60) + "…" : q;
    const msg = t({
      es: `¿Eliminar la pregunta "${preview}"? Necesitas guardar la página para que surta efecto.`,
      en: `Delete the FAQ "${preview}"? You'll need to save the page for this to take effect.`,
    });
    if (!window.confirm(msg)) return;
    onChange(value.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const addItem = () => {
    onChange([
      ...value,
      { question: { es: "", en: "" }, answer: { es: "", en: "" } },
    ]);
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

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white/50 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <HelpCircle className="w-3.5 h-3.5" />
          {labelText}
          <span className="text-[10px] font-normal text-stone-400">
            ({value.length} {value.length === 1 ? t({ es: "pregunta", en: "question" }) : t({ es: "preguntas", en: "questions" })})
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
              {t({ es: "Aún no hay preguntas", en: "No questions yet" })}
            </p>
          )}

          {value.map((item, idx) => {
            const isExpanded = expandedIdx === idx;
            const preview =
              item.question?.es || item.question?.en || t({ es: `Pregunta `, en: `Question ` });

            return (
              <div
                key={idx}
                className="rounded-lg border border-stone-200/80 bg-white overflow-hidden"
              >
                {/* Question header */}
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-stone-700 font-medium truncate flex-1">
                    {preview}
                  </span>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveItem(idx, -1); }}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 text-[10px]"
                      >
                        ↑
                      </button>
                    )}
                    {idx < value.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveItem(idx, 1); }}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 text-[10px]"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                      className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    <EditableBilingual
                      label={{ es: "Pregunta", en: "Question" }}
                      as="h4"
                      value={item.question}
                      onChange={(v) => updateItem(idx, { question: v })}
                      className="text-sm font-semibold text-stone-800"
                      placeholder={t({ es: "Escribe la pregunta…", en: "Enter question..." })}
                    />
                    <EditableBilingual
                      label={{ es: "Respuesta", en: "Answer" }}
                      as="p"
                      value={item.answer}
                      onChange={(v) => updateItem(idx, { answer: v })}
                      className="text-sm text-stone-600"
                      placeholder={t({ es: "Escribe la respuesta…", en: "Enter answer..." })}
                      multiline
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Add button */}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-stone-300 text-stone-500 text-xs font-semibold uppercase tracking-wider hover:border-[var(--olivea-olive)] hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.03] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t({ es: "Agregar pregunta", en: "Add Question" })}
          </button>
        </div>
      )}
    </div>
  );
}
