"use client";

import { Home, FileCode2, ExternalLink } from "lucide-react";
import casaContent from "@/lib/content/data/casa";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableImage,
} from "@/components/admin/visual-editor";

const mdxSections = [
  { name: "Hero",           file: "hero.es.mdx / hero.en.mdx" },
  { name: "Habitaciones",   file: "habitaciones.es.mdx / rooms.en.mdx" },
  { name: "Design",         file: "diseno.es.mdx / design.en.mdx" },
  { name: "Patio",          file: "patio.es.mdx / patio.en.mdx" },
  { name: "Mornings",       file: "mananas.es.mdx / mornings.en.mdx" },
  { name: "Practical Info", file: "practical-info.es.mdx / practical-info.en.mdx" },
  { name: "Gallery",        file: "gallery.es.mdx / gallery.en.mdx" },
  { name: "Services",       file: "servicios.es.mdx / services.en.mdx" },
  { name: "FAQ",            file: "faq.es.mdx / faq.en.mdx" },
];

function CasaVisual() {
  const { get, set } = useEditor();

  const hero = get("hero") as {
    headline?: { es: string; en: string };
    subheadline?: { es: string; en: string };
    image?: { src: string; alt?: { es: string; en: string } };
  } | undefined;

  const meta = get("meta") as {
    title?: { es: string; en: string };
    description?: { es: string; en: string };
  } | undefined;

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual label="Meta Title" as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label="Meta Description" as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      <section className="relative rounded-2xl overflow-hidden">
        <EditableImage
          src={hero?.image?.src ?? ""} alt={hero?.image?.alt?.en ?? ""}
          onChange={(src) => set("hero.image.src", src)}
          className="rounded-2xl" aspect="hero" label="Hero Image"
        />
      </section>

      <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-[var(--olivea-olive)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Hero Text</span>
        </div>
        <EditableBilingual label="Headline" as="h1" value={hero?.headline ?? { es: "", en: "" }} onChange={(v) => set("hero.headline", v)} className="text-2xl font-serif font-medium text-stone-800" placeholder="Page headline..." />
        <EditableBilingual label="Subheadline" as="p" value={hero?.subheadline ?? { es: "", en: "" }} onChange={(v) => set("hero.subheadline", v)} className="text-base text-stone-600 font-serif italic" placeholder="Subheadline text..." />
      </div>

      {/* MDX content reference */}
      <div className="rounded-2xl border border-stone-200/60 bg-white/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Page Content</span>
            <span className="text-[10px] text-stone-400">({mdxSections.length} sections)</span>
          </div>
          <a href="/es/casa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold hover:bg-stone-200 transition-colors">
            <ExternalLink className="w-3 h-3" />
            View Live Page
          </a>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          <p className="text-xs text-stone-500 leading-relaxed mb-3">
            This page&apos;s body content is built with interactive MDX components
            (parallax images, scroll animations, galleries). To edit section text or images,
            modify the MDX files directly in the codebase.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mdxSections.map((s) => (
              <div key={s.name} className="rounded-lg bg-stone-50 border border-stone-200/60 px-3 py-2">
                <div className="text-xs font-semibold text-stone-700">{s.name}</div>
                <div className="text-[10px] text-stone-400 font-mono truncate">{s.file}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CasaAdmin() {
  return (
    <VisualPageEditor title="Casa" table="casa_content" icon={<Home className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={casaContent as unknown as Record<string, unknown>}>
      <CasaVisual />
    </VisualPageEditor>
  );
}
