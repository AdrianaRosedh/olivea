"use client";

import { Newspaper, ExternalLink, Plus, Trash2 } from "lucide-react";
import pressContent from "@/lib/content/data/press";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
} from "@/components/admin/visual-editor";

type Bilingual = { es: string; en: string };

function PressVisual() {
  const { get, set } = useEditor();
  const meta = get("meta") as { title?: Bilingual; description?: Bilingual } | undefined;

  // Description is an array of bilingual paragraphs
  const description = (get("description") ?? []) as Bilingual[];

  const updateParagraph = (idx: number, v: Bilingual) => {
    const updated = [...description];
    updated[idx] = v;
    set("description", updated);
  };

  const addParagraph = () => {
    set("description", [...description, { es: "", en: "" }]);
  };

  const removeParagraph = (idx: number) => {
    set("description", description.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual label="Meta Title" as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label="Meta Description" as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      {/* ── Page header ── */}
      <section className="rounded-2xl bg-white/60 ring-1 ring-black/5 p-6 md:p-8 space-y-4">
        <EditableBilingual label="Title" as="h1" value={(get("title") ?? { es: "", en: "" }) as Bilingual} onChange={(v) => set("title", v)} className="text-2xl font-serif text-stone-800" />
        <EditableBilingual label="Tagline" as="p" value={(get("tagline") ?? { es: "", en: "" }) as Bilingual} onChange={(v) => set("tagline", v)} className="text-base text-stone-600 italic" multiline />
      </section>

      {/* ── Description paragraphs ── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Description Paragraphs
          </span>
          <span className="text-[10px] text-stone-400">
            {description.length} {description.length === 1 ? "paragraph" : "paragraphs"}
          </span>
        </div>
        <div className="px-5 py-4 space-y-4">
          {description.map((para, idx) => (
            <div key={`p-${idx}-${para.es.slice(0, 20)}`} className="relative group rounded-xl bg-white/60 ring-1 ring-stone-200/80 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Paragraph {idx + 1}
                </span>
                <button
                  onClick={() => removeParagraph(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all"
                  title="Remove paragraph"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <EditableBilingual
                label={`Paragraph ${idx + 1}`}
                as="p"
                value={para}
                onChange={(v) => updateParagraph(idx, v)}
                className="text-sm text-stone-600 leading-relaxed"
                multiline
              />
            </div>
          ))}

          <button
            onClick={addParagraph}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-stone-300 text-stone-500 text-xs font-semibold uppercase tracking-wider hover:border-[var(--olivea-olive)] hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.03] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Paragraph
          </button>
        </div>
      </section>

      {/* ── View live ── */}
      <div className="flex justify-end">
        <a
          href="/es/press"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Live Page
        </a>
      </div>
    </div>
  );
}

export default function PressAdmin() {
  return (
    <VisualPageEditor title="Press" table="press_content" icon={<Newspaper className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={pressContent as unknown as Record<string, unknown>}>
      <PressVisual />
    </VisualPageEditor>
  );
}
