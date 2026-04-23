"use client";

import { AlertCircle } from "lucide-react";
import notFoundContent from "@/lib/content/data/notFound";
import { VisualPageEditor, useEditor, MetaSection, EditableBilingual } from "@/components/admin/visual-editor";

function NotFoundVisual() {
  const { get, set } = useEditor();
  const meta = get("meta") as { title?: { es: string; en: string }; description?: { es: string; en: string } } | undefined;

  return (
    <div className="space-y-8">
      <MetaSection>
        <EditableBilingual label="Meta Title" as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label="Meta Description" as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      <section className="rounded-3xl bg-stone-100/80 ring-1 ring-black/5 p-8 md:p-16 text-center space-y-6">
        <div className="text-6xl font-serif text-stone-300 font-bold">404</div>
        <EditableBilingual label="Message" as="h2" value={(get("message") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("message", v)} className="text-xl font-serif text-stone-700" placeholder="Not found message..." />
        <div className="inline-block rounded-full bg-[var(--olivea-olive)]/10 px-6 py-2">
          <EditableBilingual label="CTA Button" as="span" value={(get("cta") ?? { es: "", en: "" }) as { es: string; en: string }} onChange={(v) => set("cta", v)} className="text-sm font-semibold text-[var(--olivea-olive)]" placeholder="CTA text..." />
        </div>
      </section>
    </div>
  );
}

export default function NotFoundAdmin() {
  return (
    <VisualPageEditor title="404 Page" table="not_found_content" icon={<AlertCircle className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={notFoundContent as unknown as Record<string, unknown>}>
      <NotFoundVisual />
    </VisualPageEditor>
  );
}
