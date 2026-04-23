"use client";

import { Leaf, ExternalLink } from "lucide-react";
import sustainabilityContent from "@/lib/content/data/sustainability";
import sustainabilitySections from "@/lib/content/data/sustainabilitySections";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableSections,
} from "@/components/admin/visual-editor";

/* ── Build fallback data with sections included ── */
const fallback = {
  ...(sustainabilityContent as unknown as Record<string, unknown>),
  sections: sustainabilitySections.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    body: s.body,
  })),
};

function SustainabilityVisual() {
  const { get, set } = useEditor();
  const meta = get("meta") as { title?: { es: string; en: string }; description?: { es: string; en: string } } | undefined;

  const sections = (get("sections") ?? []) as Array<{
    id?: string;
    title?: { es: string; en: string };
    subtitle?: { es: string; en: string };
    body?: { es: string; en: string };
  }>;

  return (
    <div className="space-y-8">
      <MetaSection>
        <EditableBilingual label="Meta Title" as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label="Meta Description" as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      {/* ── Page header ── */}
      <section className="rounded-3xl bg-[var(--olivea-olive)]/5 ring-1 ring-[var(--olivea-olive)]/10 p-8 md:p-12 text-center space-y-4">
        <Leaf className="w-8 h-8 text-[var(--olivea-olive)] mx-auto opacity-40" />
        <EditableBilingual label="Title" as="h1" value={(get("title") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("title", v)} className="text-2xl md:text-3xl font-serif text-stone-800" />
        <EditableBilingual label="Description" as="p" value={(get("description") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("description", v)} className="text-base text-stone-600 leading-relaxed max-w-2xl mx-auto" multiline />
      </section>

      {/* ── Philosophy sections ── */}
      <EditableSections
        label="Philosophy Sections"
        value={sections}
        onChange={(v) => set("sections", v)}
        fields={["title", "subtitle", "body"]}
        allowAdd
        allowDelete
        allowReorder
      />

      {/* ── View live ── */}
      <div className="flex justify-end">
        <a
          href="/es/sustainability"
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

export default function SustainabilityAdmin() {
  return (
    <VisualPageEditor title="Sustainability" table="sustainability_content" icon={<Leaf className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={fallback}>
      <SustainabilityVisual />
    </VisualPageEditor>
  );
}
