"use client";

import { Newspaper, ExternalLink } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import pressContent from "@/lib/content/data/press";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
} from "@/components/admin/visual-editor";

type Bilingual = { es: string; en: string };

function PressVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();
  const meta = get("meta") as { title?: Bilingual; description?: Bilingual } | undefined;

  // Description is an array of bilingual paragraphs
  const band = (get("michelin_band") ?? {}) as Partial<Record<"guideLabel" | "heading" | "restaurant" | "hotel" | "linkLabel", Bilingual>>;

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual label={{ es: "Título SEO", en: "Meta Title" }} as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label={{ es: "Descripción SEO", en: "Meta Description" }} as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      {/* ── Page header ── */}
      <section className="rounded-2xl bg-white/60 ring-1 ring-black/5 p-6 md:p-8 space-y-4">
        <EditableBilingual label={{ es: "Título", en: "Title" }} as="h1" value={(get("title") ?? { es: "", en: "" }) as Bilingual} onChange={(v) => set("title", v)} className="text-2xl font-serif text-stone-800" />
        <EditableBilingual label={{ es: "Lema", en: "Tagline" }} as="p" value={(get("tagline") ?? { es: "", en: "" }) as Bilingual} onChange={(v) => set("tagline", v)} className="text-base text-stone-600 italic" multiline />
      </section>

      {/* ── MICHELIN band (top of the Press page) ── */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Banda MICHELIN", en: "MICHELIN band" })}</h3>
        <p className="text-xs text-stone-500">{t({ es: "Abre la página de prensa. Sin título, la banda no se muestra.", en: "Opens the Press page. Without a heading, the band is hidden." })}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableBilingual label={{ es: "Etiqueta", en: "Label" }} as="span" value={band.guideLabel ?? { es: "", en: "" }} onChange={(v) => set("michelin_band.guideLabel", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Título", en: "Heading" }} as="span" value={band.heading ?? { es: "", en: "" }} onChange={(v) => set("michelin_band.heading", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Línea del restaurante", en: "Restaurant line" }} as="span" value={band.restaurant ?? { es: "", en: "" }} onChange={(v) => set("michelin_band.restaurant", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Línea de Casa Olivea", en: "Casa Olivea line" }} as="span" value={band.hotel ?? { es: "", en: "" }} onChange={(v) => set("michelin_band.hotel", v)} className="text-sm text-stone-600" />
          <EditableBilingual label={{ es: "Texto del enlace", en: "Link text" }} as="span" value={band.linkLabel ?? { es: "", en: "" }} onChange={(v) => set("michelin_band.linkLabel", v)} className="text-sm text-stone-600" />
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
          {t(STR.viewLivePage)}
        </a>
      </div>
    </div>
  );
}

export default function PressAdmin() {
  return (
    <SectionGuard sectionKey="pages.press">
      <VisualPageEditor title="Press" table="press_content" icon={<Newspaper className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={pressContent as unknown as Record<string, unknown>} livePath="/press">
        <PressVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
