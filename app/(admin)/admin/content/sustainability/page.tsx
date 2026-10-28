"use client";

import { Leaf, ExternalLink } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import PhilosophySectionsEditor from "@/components/admin/PhilosophySectionsEditor";
import sustainabilityContent from "@/lib/content/data/sustainability";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableFAQ,
  storedToEditorFaq,
  editorToStoredFaq,
} from "@/components/admin/visual-editor";

/* ── Fallback for the page-level fields only ──
   `sections` deliberately absent. It used to be merged in here, which meant
   the page editor rendered chapters read from the static data file and then
   sent them back as a `sections` key on sustainability_content — a column
   that does not exist on that table, so the save failed on the unknown
   column and took the title, description and meta down with it. Chapters
   live in sustainability_sections and are edited by PhilosophySectionsEditor
   below, against that table. */
const fallback = sustainabilityContent as unknown as Record<string, unknown>;

function SustainabilityVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();
  const meta = get("meta") as { title?: { es: string; en: string }; description?: { es: string; en: string } } | undefined;

  return (
    <div className="space-y-8">
      <MetaSection>
        <EditableBilingual label={{ es: "Título SEO", en: "Meta Title" }} as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label={{ es: "Descripción SEO", en: "Meta Description" }} as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      {/* ── Page header ── */}
      <section className="rounded-3xl bg-[var(--olivea-olive)]/5 ring-1 ring-[var(--olivea-olive)]/10 p-8 md:p-12 text-center space-y-4">
        <Leaf className="w-8 h-8 text-[var(--olivea-olive)] mx-auto opacity-40" />
        <EditableBilingual label={{ es: "Título", en: "Title" }} as="h1" value={(get("title") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("title", v)} className="text-2xl md:text-3xl font-serif text-stone-800" />
        <EditableBilingual label={{ es: "Descripción", en: "Description" }} as="p" value={(get("description") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("description", v)} className="text-base text-stone-600 leading-relaxed max-w-2xl mx-auto" multiline />
      </section>

      {/* ── Questions (FAQ on the page and in its FAQPage markup) ── */}
      <EditableFAQ
        label={{ es: "Preguntas frecuentes", en: "FAQ" }}
        value={storedToEditorFaq(get("faq"))}
        onChange={(entries) => set("faq", editorToStoredFaq(entries))}
        collapsed={false}
      />

      {/* ── Philosophy chapters ──
          Separate editor with its own save, because these live in a different
          table from the page fields above. */}
      <PhilosophySectionsEditor />

      {/* ── View live ── */}
      <div className="flex justify-end">
        <a
          href="/es/sustainability"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          {t(STR.viewLivePage)}
        </a>
      </div>
    </div>
  );
}

export default function SustainabilityAdmin() {
  return (
    <SectionGuard sectionKey="pages.sustainability">
      <VisualPageEditor title="Sustainability" table="sustainability_content" icon={<Leaf className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={fallback} livePath="/sustainability">
        <SustainabilityVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
