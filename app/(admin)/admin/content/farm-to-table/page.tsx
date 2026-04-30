"use client";

import { Utensils, FileCode2, ExternalLink } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import farmtotableContent from "@/lib/content/data/farmtotable";
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

/** Section storage uses { q, a } per item. EditableFAQ uses { question, answer }. */
function sectionItemsToFaqEntries(items: unknown): { question: { es: string; en: string }; answer: { es: string; en: string } }[] {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const item = it as Record<string, unknown>;
    return {
      question: (item.q as { es: string; en: string }) ?? { es: "", en: "" },
      answer: (item.a as { es: string; en: string }) ?? { es: "", en: "" },
    };
  });
}

function faqEntriesToSectionItems(entries: { question: { es: string; en: string }; answer: { es: string; en: string } }[]) {
  return entries.map((e) => ({ q: e.question, a: e.answer }));
}

interface SectionShape {
  id?: string;
  title?: { es: string; en: string };
  subtitle?: { es: string; en: string };
  body?: { es: string; en: string };
  description?: { es: string; en: string };
  image?: { src: string; alt?: { es: string; en: string } };
  [key: string]: unknown;
}

/* ── MDX content sections rendered on the live page ───────────────── */

const mdxSections = [
  { name: "Hero",       file: "hero.es.mdx / hero.en.mdx" },
  { name: "Experience", file: "experience.es.mdx / experience.en.mdx" },
  { name: "Kitchen",    file: "kitchen.es.mdx / kitchen.en.mdx" },
  { name: "Table",      file: "table.es.mdx / table.en.mdx" },
  { name: "Pantry",     file: "pantry.es.mdx / pantry.en.mdx" },
  { name: "Gallery",    file: "gallery.es.mdx / gallery.en.mdx" },
  { name: "Menu",       file: "menu.es.mdx / menu.en.mdx" },
  { name: "FAQ",        file: "faq.es.mdx / faq.en.mdx" },
];

/* ── Visual editor ────────────────────────────────────────────────── */

function FarmToTableVisual() {
  const { get, set } = useEditor();

  const hero = get("hero") as {
    headline?: { es: string; en: string };
    subheadline?: { es: string; en: string };
    image?: { src: string; alt?: { es: string; en: string } };
  } | undefined;

  const meta = get("meta") as {
    title?: { es: string; en: string };
    description?: { es: string; en: string };
    ogImage?: string;
  } | undefined;

  const sections = (get("sections") as SectionShape[]) ?? [];

  const faqSection = sections.find((s) => s.id === "faq");
  const faqEntries = sectionItemsToFaqEntries(faqSection?.items);

  const updateFaqEntries = (entries: { question: { es: string; en: string }; answer: { es: string; en: string } }[]) => {
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
      {/* ── SEO / Meta ──────────────────────────────────────── */}
      <MetaSection>
        <EditableBilingual
          label="Meta Title" as="small"
          value={meta?.title ?? { es: "", en: "" }}
          onChange={(v) => set("meta.title", v)}
          className="text-sm text-stone-600"
        />
        <EditableBilingual
          label="Meta Description" as="small"
          value={meta?.description ?? { es: "", en: "" }}
          onChange={(v) => set("meta.description", v)}
          className="text-sm text-stone-600" multiline
        />
      </MetaSection>

      {/* ── Hero image ──────────────────────────────────────── */}
      <section className="relative rounded-2xl overflow-hidden">
        <EditableImage
          src={hero?.image?.src ?? ""}
          alt={hero?.image?.alt?.en ?? "Hero image"}
          onChange={(src) => set("hero.image.src", src)}
          className="rounded-2xl"
          aspect="hero"
          label="Hero Image"
        />
      </section>

      {/* ── Hero text ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 rounded-full bg-[var(--olivea-olive)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Hero Text
          </span>
        </div>
        <EditableBilingual
          label="Headline" as="h1"
          value={hero?.headline ?? { es: "", en: "" }}
          onChange={(v) => set("hero.headline", v)}
          className="text-2xl font-serif font-medium text-stone-800"
          placeholder="Page headline..."
        />
        <EditableBilingual
          label="Subheadline" as="p"
          value={hero?.subheadline ?? { es: "", en: "" }}
          onChange={(v) => set("hero.subheadline", v)}
          className="text-base text-stone-600 font-serif italic"
          placeholder="Subheadline text..."
        />
      </div>

      {/* Structured FAQ editor — Q&A pairs that appear in the FAQ section. */}
      <EditableFAQ
        label="FAQ — Questions & Answers"
        value={faqEntries}
        onChange={updateFaqEntries}
        collapsed={false}
      />

      {/* ── Visual section editor ──────────────────────────────
          Edits are saved to farmtotable_content.sections and override
          the MDX fallback files when the live page renders. */}
      <EditableSections
        label="Page Sections (visual editing)"
        value={sections}
        onChange={(v) => set("sections", v)}
        fields={["title", "subtitle", "body", "description", "image"]}
        collapsed={false}
      />

      {/* Raw JSON access for FAQ items, stats, custom fields. */}
      <EditableJSON
        label="Sections (raw JSON — for FAQ items, stats, custom fields)"
        value={sections}
        onChange={(v) => set("sections", v)}
        rows={20}
        collapsed
      />

      {/* ── MDX Fallback (read-only reference) ──────────── */}
      <div className="rounded-2xl border border-stone-200/60 bg-white/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              MDX Fallback (used when DB is empty)
            </span>
            <span className="text-[10px] text-stone-400">
              ({mdxSections.length} sections)
            </span>
          </div>
          <a
            href="/es/farmtotable"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold hover:bg-stone-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Live Page
          </a>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          <p className="text-xs text-stone-500 leading-relaxed mb-3">
            If no sections are saved above, the public page falls back to these MDX files in the codebase.
            Once you save sections from this admin, your edits override the MDX content.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {mdxSections.map((s) => (
              <div
                key={s.name}
                className="rounded-lg bg-stone-50 border border-stone-200/60 px-3 py-2"
              >
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

/* ── Page export ──────────────────────────────────────────────────── */

export default function FarmToTableAdmin() {
  return (
    <SectionGuard sectionKey="pages.farmtotable">
      <VisualPageEditor
        title="Farm to Table"
        table="farmtotable_content"
        icon={<Utensils className="w-5 h-5 text-[var(--olivea-olive)]" />}
        fallbackData={farmtotableContent as unknown as Record<string, unknown>}
      livePath="/farmtotable"
      >
        <FarmToTableVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
