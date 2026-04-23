"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCasaFaq,
  saveCasaFaqItem,
  deleteCasaFaqItem,
} from "@/lib/supabase/actions";
import casaContent from "@/lib/content/data/casa";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Save,
  X,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BilingualText {
  es: string;
  en: string;
}

interface FaqItem {
  id: string;
  page: string;
  question: BilingualText;
  answer: BilingualText;
  sort_order: number;
}

type DraftFaq = Omit<FaqItem, "id"> & { id?: string };

const emptyDraft = (): DraftFaq => ({
  page: "casa",
  question: { es: "", en: "" },
  answer: { es: "", en: "" },
  sort_order: 0,
});

/* ------------------------------------------------------------------ */
/*  Shared styling tokens                                              */
/* ------------------------------------------------------------------ */

const cls = {
  card: "rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-6",
  heading: "text-lg font-semibold text-[var(--olivea-ink)]",
  input:
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full",
  textarea:
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full min-h-[80px] resize-y",
  btnPrimary:
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors disabled:opacity-50",
  btnGhost:
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors",
  btnIcon:
    "p-1.5 rounded-lg hover:bg-black/5 text-[var(--olivea-clay)] transition-colors disabled:opacity-40",
  label: "text-xs font-semibold uppercase tracking-wider text-[var(--olivea-clay)]",
};

/* ------------------------------------------------------------------ */
/*  Bilingual field pair                                               */
/* ------------------------------------------------------------------ */

function BilingualInput({
  label,
  esValue,
  enValue,
  onChangeEs,
  onChangeEn,
  multiline = false,
}: {
  label: string;
  esValue: string;
  enValue: string;
  onChangeEs: (v: string) => void;
  onChangeEn: (v: string) => void;
  multiline?: boolean;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="space-y-2">
      <p className={cls.label}>{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">
            ES
          </span>
          <Tag
            className={multiline ? cls.textarea : cls.input}
            value={esValue}
            onChange={(e) => onChangeEs(e.target.value)}
            placeholder={`${label} (Espa\u00f1ol)`}
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60">
            EN
          </span>
          <Tag
            className={multiline ? cls.textarea : cls.input}
            value={enValue}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder={`${label} (English)`}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ card                                                           */
/* ------------------------------------------------------------------ */

function FaqCard({
  item,
  index,
  total,
  onSave,
  onDelete,
  onMove,
}: {
  item: FaqItem;
  index: number;
  total: number;
  onSave: (updated: FaqItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMove: (id: string, direction: "up" | "down") => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FaqItem>(item);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync draft when item prop changes (e.g. after reorder)
  useEffect(() => {
    if (!editing) setDraft(item);
  }, [item, editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(item);
    setEditing(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete(item.id);
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  const patchQuestion = (lang: "es" | "en", v: string) =>
    setDraft((d) => ({ ...d, question: { ...d.question, [lang]: v } }));
  const patchAnswer = (lang: "es" | "en", v: string) =>
    setDraft((d) => ({ ...d, answer: { ...d.answer, [lang]: v } }));

  return (
    <div className={`${cls.card} transition-all`}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Grip + arrows */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
          <GripVertical size={16} className="text-[var(--olivea-clay)]/40" />
          <button
            className={cls.btnIcon}
            disabled={index === 0}
            onClick={() => onMove(item.id, "up")}
            title="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            className={cls.btnIcon}
            disabled={index === total - 1}
            onClick={() => onMove(item.id, "down")}
            title="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Question preview */}
        <button
          className="flex-1 text-left"
          onClick={() => {
            if (!editing) setExpanded((e) => !e);
          }}
        >
          <p className="text-sm font-semibold text-[var(--olivea-ink)] leading-snug">
            {item.question.es || <span className="italic text-[var(--olivea-clay)]">(sin pregunta)</span>}
          </p>
          <p className="text-xs text-[var(--olivea-clay)] mt-0.5 leading-snug">
            {item.question.en || <span className="italic">(no question)</span>}
          </p>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <button
              className={cls.btnIcon}
              onClick={() => {
                setExpanded(true);
                setEditing(true);
              }}
              title="Edit"
            >
              <Pencil size={15} />
            </button>
          )}
          <button
            className={`${cls.btnIcon} hover:text-red-600`}
            onClick={() => setConfirmDelete(true)}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50/80 ring-1 ring-red-200 px-4 py-3">
          <p className="text-sm text-red-700 flex-1">
            Delete this FAQ item? This cannot be undone.
          </p>
          <button
            className="rounded-full px-4 py-1.5 text-xs tracking-widest uppercase font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
          </button>
          <button
            className={cls.btnGhost}
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Expanded view (read-only or editing) */}
      {expanded && !confirmDelete && (
        <div className="mt-5 space-y-4 border-t border-black/5 pt-5">
          {editing ? (
            <>
              <BilingualInput
                label="Question"
                esValue={draft.question.es}
                enValue={draft.question.en}
                onChangeEs={(v) => patchQuestion("es", v)}
                onChangeEn={(v) => patchQuestion("en", v)}
              />
              <BilingualInput
                label="Answer"
                esValue={draft.answer.es}
                enValue={draft.answer.en}
                onChangeEs={(v) => patchAnswer("es", v)}
                onChangeEn={(v) => patchAnswer("en", v)}
                multiline
              />
              <div className="flex gap-2 pt-2">
                <button
                  className={cls.btnPrimary}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin inline mr-1" />
                  ) : (
                    <Save size={14} className="inline mr-1" />
                  )}
                  Save
                </button>
                <button className={cls.btnGhost} onClick={handleCancel}>
                  <X size={14} className="inline mr-1" />
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className={cls.label}>Answer (ES)</p>
                <p className="text-sm text-[var(--olivea-ink)] whitespace-pre-wrap leading-relaxed">
                  {item.answer.es || "\u2014"}
                </p>
              </div>
              <div className="space-y-2">
                <p className={cls.label}>Answer (EN)</p>
                <p className="text-sm text-[var(--olivea-ink)] whitespace-pre-wrap leading-relaxed">
                  {item.answer.en || "\u2014"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function CasaFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newDraft, setNewDraft] = useState<DraftFaq>(emptyDraft());
  const [savingNew, setSavingNew] = useState(false);

  /* Load items */
  const load = useCallback(async () => {
    try {
      const data = (await getCasaFaq()) as unknown as FaqItem[];
      if (data && data.length > 0) {
        setItems(data.sort((a, b) => a.sort_order - b.sort_order));
      } else {
        // Fall back to static FAQ items from content data
        const staticItems: FaqItem[] = casaContent.faq.map((f) => ({
          id: f.id,
          page: f.page ?? "casa",
          question: f.question,
          answer: f.answer,
          sort_order: f.sortOrder,
        }));
        setItems(staticItems);
      }
    } catch (err) {
      console.error("Failed to load FAQ items:", err);
      // Fall back to static FAQ items on error
      const staticItems: FaqItem[] = casaContent.faq.map((f) => ({
        id: f.id,
        page: f.page ?? "casa",
        question: f.question,
        answer: f.answer,
        sort_order: f.sortOrder,
      }));
      setItems(staticItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* Save existing */
  const handleSave = async (updated: FaqItem) => {
    await saveCasaFaqItem({
      id: updated.id,
      page: updated.page,
      question: updated.question,
      answer: updated.answer,
      sort_order: updated.sort_order,
    });
    await load();
  };

  /* Delete */
  const handleDelete = async (id: string) => {
    await deleteCasaFaqItem(id);
    await load();
  };

  /* Reorder */
  const handleMove = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= items.length) return;

    const a = items[idx];
    const b = items[swapIdx];

    // Swap sort_order values
    await saveCasaFaqItem({
      id: a.id,
      page: a.page,
      question: a.question,
      answer: a.answer,
      sort_order: b.sort_order,
    });
    await saveCasaFaqItem({
      id: b.id,
      page: b.page,
      question: b.question,
      answer: b.answer,
      sort_order: a.sort_order,
    });
    await load();
  };

  /* Add new */
  const handleAddNew = async () => {
    const maxOrder = items.length > 0
      ? Math.max(...items.map((i) => i.sort_order))
      : -1;
    setSavingNew(true);
    try {
      await saveCasaFaqItem({
        page: newDraft.page,
        question: newDraft.question,
        answer: newDraft.answer,
        sort_order: maxOrder + 1,
      });
      setNewDraft(emptyDraft());
      setShowNew(false);
      await load();
    } finally {
      setSavingNew(false);
    }
  };

  const patchNewQuestion = (lang: "es" | "en", v: string) =>
    setNewDraft((d) => ({ ...d, question: { ...d.question, [lang]: v } }));
  const patchNewAnswer = (lang: "es" | "en", v: string) =>
    setNewDraft((d) => ({ ...d, answer: { ...d.answer, [lang]: v } }));

  const canSaveNew =
    newDraft.question.es.trim() !== "" || newDraft.question.en.trim() !== "";

  /* ---------------------------------------------------------------- */

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--olivea-olive)]/10 p-2.5">
            <HelpCircle size={22} className="text-[var(--olivea-olive)]" />
          </div>
          <div>
            <h1 className={cls.heading}>Casa FAQ</h1>
            <p className="text-xs text-[var(--olivea-clay)] mt-0.5">
              Manage frequently asked questions for the Casa page
            </p>
          </div>
        </div>
        <button
          className={cls.btnPrimary}
          onClick={() => setShowNew((s) => !s)}
        >
          <Plus size={14} className="inline mr-1 -ml-0.5" />
          Add Item
        </button>
      </div>

      {/* New item form */}
      {showNew && (
        <div className={`${cls.card} ring-[var(--olivea-olive)]/20 ring-2`}>
          <h2 className={`${cls.heading} mb-4`}>New FAQ Item</h2>
          <div className="space-y-4">
            <BilingualInput
              label="Question"
              esValue={newDraft.question.es}
              enValue={newDraft.question.en}
              onChangeEs={(v) => patchNewQuestion("es", v)}
              onChangeEn={(v) => patchNewQuestion("en", v)}
            />
            <BilingualInput
              label="Answer"
              esValue={newDraft.answer.es}
              enValue={newDraft.answer.en}
              onChangeEs={(v) => patchNewAnswer("es", v)}
              onChangeEn={(v) => patchNewAnswer("en", v)}
              multiline
            />
            <div className="flex gap-2 pt-2">
              <button
                className={cls.btnPrimary}
                onClick={handleAddNew}
                disabled={savingNew || !canSaveNew}
              >
                {savingNew ? (
                  <Loader2 size={14} className="animate-spin inline mr-1" />
                ) : (
                  <Save size={14} className="inline mr-1" />
                )}
                Save
              </button>
              <button
                className={cls.btnGhost}
                onClick={() => {
                  setShowNew(false);
                  setNewDraft(emptyDraft());
                }}
              >
                <X size={14} className="inline mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[var(--olivea-olive)]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className={`${cls.card} text-center py-16`}>
          <HelpCircle
            size={40}
            className="mx-auto text-[var(--olivea-clay)]/30 mb-3"
          />
          <p className="text-sm text-[var(--olivea-clay)]">
            No FAQ items yet. Click <strong>Add Item</strong> to create one.
          </p>
        </div>
      )}

      {/* FAQ list */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <FaqCard
              key={item.id}
              item={item}
              index={idx}
              total={items.length}
              onSave={handleSave}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
