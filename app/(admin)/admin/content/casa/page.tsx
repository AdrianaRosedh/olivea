"use client";

import { Home, FileCode2, ExternalLink } from "lucide-react";
import { newFaqId } from "@/lib/seo/faq";
import SectionGuard from "@/components/admin/SectionGuard";
import casaContent from "@/lib/content/data/casa";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableImage,
  EditableSections,
  EditableJSON,
  EditableFAQ,
} from "@/components/admin/visual-editor";

interface SectionShape {
  id?: string;
  title?: { es: string; en: string };
  subtitle?: { es: string; en: string };
  body?: { es: string; en: string };
  description?: { es: string; en: string };
  image?: { src: string; alt?: { es: string; en: string } };
  [key: string]: unknown;
}

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


/** Section storage uses { q, a } per item. EditableFAQ uses { question, answer }.
    These adapters map between the two without losing other fields. */
type FaqEntry = {
  id?: string;
  question: { es: string; en: string };
  answer: { es: string; en: string };
};

function sectionItemsToFaqEntries(items: unknown): FaqEntry[] {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const item = it as Record<string, unknown>;
    return {
      id: typeof item.id === "string" ? item.id : newFaqId(),
      question: (item.q as { es: string; en: string }) ?? { es: "", en: "" },
      answer: (item.a as { es: string; en: string }) ?? { es: "", en: "" },
    };
  });
}

function faqEntriesToSectionItems(entries: FaqEntry[]) {
  // Carry the id through. Dropping it here is what made entries addressable
  // only by position: a saved list came back with fresh identities, so another
  // editor's in-flight reference pointed at whatever had moved into that slot.
  return entries.map((e) => ({ id: e.id ?? newFaqId(), q: e.question, a: e.answer }));
}

function CasaVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();

  const hero = get("hero") as {
    headline?: { es: string; en: string };
    subheadline?: { es: string; en: string };
    image?: { src: string; alt?: { es: string; en: string } };
  } | undefined;

  const meta = get("meta") as {
    title?: { es: string; en: string };
    description?: { es: string; en: string };
  } | undefined;

  const sections = (get("sections") as SectionShape[]) ?? [];

  // Casa's FAQ used to live in a separate casa_faq table with its own admin
  // page. The public page never rendered that table, so edits made there were
  // invisible to visitors. It is now the same sections[faq].items store the
  // café and restaurant editors use, and the page and markup both read it.
  const faqSection = sections.find((s) => s.id === "faq");
  const faqEntries = sectionItemsToFaqEntries(faqSection?.items);

  const updateFaqEntries = (entries: FaqEntry[]) => {
    const newItems = faqEntriesToSectionItems(entries);
    const idx = sections.findIndex((s) => s.id === "faq");
    const newSections = [...sections];
    if (idx >= 0) {
      newSections[idx] = { ...newSections[idx], items: newItems } as SectionShape;
    } else {
      newSections.push({ id: "faq", items: newItems } as SectionShape);
    }
    set("sections", newSections);
  };

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual label={{ es: "Título SEO", en: "Meta Title" }} as="small" value={meta?.title ?? { es: "", en: "" }} onChange={(v) => set("meta.title", v)} className="text-sm text-stone-600" />
        <EditableBilingual label={{ es: "Descripción SEO", en: "Meta Description" }} as="small" value={meta?.description ?? { es: "", en: "" }} onChange={(v) => set("meta.description", v)} className="text-sm text-stone-600" multiline />
      </MetaSection>

      <section className="relative rounded-2xl overflow-hidden">
        <EditableImage
          src={hero?.image?.src ?? ""} alt={hero?.image?.alt?.en ?? ""}
          onChange={(src) => set("hero.image.src", src)}
          className="rounded-2xl" aspect="hero" label={{ es: "Imagen principal", en: "Hero Image" }}
        />
      </section>

      <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-[var(--olivea-olive)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Texto principal", en: "Hero Text" })}</span>
        </div>
        <EditableBilingual label={{ es: "Título", en: "Headline" }} as="h1" value={hero?.headline ?? { es: "", en: "" }} onChange={(v) => set("hero.headline", v)} className="text-2xl font-serif font-medium text-stone-800" placeholder={t({ es: "Título de la página…", en: "Page headline..." })} />
        <EditableBilingual label={{ es: "Subtítulo", en: "Subheadline" }} as="p" value={hero?.subheadline ?? { es: "", en: "" }} onChange={(v) => set("hero.subheadline", v)} className="text-base text-stone-600 font-serif italic" placeholder={t({ es: "Texto del subtítulo…", en: "Subheadline text..." })} />
      </div>

      {/* Structured FAQ editor — Q&A pairs that appear in the FAQ section. */}
      <EditableFAQ
        label={{ es: "Preguntas frecuentes", en: "FAQ — Questions & Answers" }}
        value={faqEntries}
        onChange={updateFaqEntries}
        collapsed={false}
      />

      {/* Visual section editor — covers title/body/image for each section.
          When admin saves sections data, the public page reads from DB and
          overrides the MDX fallback. */}
      <EditableSections
        label={{ es: "Secciones de la página (edición visual)", en: "Page Sections (visual editing)" }}
        value={sections}
        onChange={(v) => set("sections", v)}
        fields={["title", "subtitle", "body", "description", "image"]}
        collapsed={false}
      />

      {/* Raw JSON access for advanced fields. */}
      <EditableJSON
        label={t({ es: "Secciones (JSON — cifras, campos personalizados, edición avanzada)", en: "Sections (raw JSON — for stats, custom fields, advanced editing)" })}
        value={sections}
        onChange={(v) => set("sections", v)}
        rows={20}
        collapsed
      />

      {/* MDX fallback reference */}
      <div className="rounded-2xl border border-stone-200/60 bg-white/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{t({ es: "Respaldo MDX (se usa cuando la base de datos está vacía)", en: "MDX Fallback (used when DB is empty)" })}</span>
            <span className="text-[10px] text-stone-400">({mdxSections.length} {t({ es: "secciones", en: "sections" })})</span>
          </div>
          <a href="/es/casa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold hover:bg-stone-200 transition-colors">
            <ExternalLink className="w-3 h-3" />
            {t(STR.viewLivePage)}
          </a>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          <p className="text-xs text-stone-500 leading-relaxed mb-3">
            {t({
              es: "Si no guardas ninguna sección arriba, la página pública usa estos archivos MDX del código. En cuanto guardes secciones desde este panel, tus cambios reemplazan el contenido MDX.",
              en: "If no sections are saved above, the public page falls back to these MDX files in the codebase. Once you save sections from this admin, your edits override the MDX content.",
            })}
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
    <SectionGuard sectionKey="pages.casa">
      <VisualPageEditor title="Casa" table="casa_content" icon={<Home className="w-5 h-5 text-[var(--olivea-olive)]" />} fallbackData={casaContent as unknown as Record<string, unknown>} livePath="/casa">
        <CasaVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
