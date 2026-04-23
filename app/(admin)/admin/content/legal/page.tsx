"use client";

import { Scale } from "lucide-react";
import legalContent from "@/lib/content/data/legal";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableSections,
} from "@/components/admin/visual-editor";

function LegalVisual() {
  const { get, set } = useEditor();
  const meta = get("meta") as { title?: { es: string; en: string }; description?: { es: string; en: string } } | undefined;

  const sections = (get("sections") ?? []) as Array<{
    title?: { es: string; en: string };
    body?: { es: string; en: string };
  }>;

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual label="Meta Title" as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label="Meta Description" as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      <section className="rounded-2xl bg-white/60 ring-1 ring-black/5 p-6 md:p-8 space-y-4">
        <EditableBilingual label="Title" as="h1" value={(get("title") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("title", v)} className="text-2xl font-serif text-stone-800" />
        <EditableBilingual label="Description" as="p" value={(get("description") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("description", v)} className="text-base text-stone-600 leading-relaxed" multiline />
      </section>

      <EditableSections
        label="Legal Sections"
        value={sections}
        onChange={(v) => set("sections", v)}
        fields={["title", "body"]}
        collapsed
      />
    </div>
  );
}

export default function LegalAdmin() {
  return (
    <VisualPageEditor title="Legal" table="legal_content" icon={<Scale className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={legalContent as unknown as Record<string, unknown>}>
      <LegalVisual />
    </VisualPageEditor>
  );
}
