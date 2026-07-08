"use client";

// Admin editor for the public roseiies page (/roseiies).
// Every text block on the page is editable here; saves write to
// roseiies_content in Supabase and go live within a minute.

import { Globe } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import roseiiesContent from "@/lib/content/data/roseiies";
import BilingualField from "@/components/admin/BilingualField";
import ImageUpload from "@/components/admin/ImageUpload";
import EditableListShell from "@/components/admin/visual-editor/EditableListShell";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
} from "@/components/admin/visual-editor";
import { useAdminLocale } from "@/lib/admin/i18n";
import type { Bilingual, RoseiiesSection } from "@/lib/content/types";

const EMPTY: Bilingual = { es: "", en: "" };
const bi = (v: unknown): Bilingual => {
  const o = (v ?? {}) as Partial<Bilingual>;
  return { es: o.es ?? "", en: o.en ?? "" };
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-5 rounded-full bg-[var(--olivea-olive)]" />
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{title}</span>
      </div>
      {children}
    </div>
  );
}

function RoseiiesVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();

  const meta = get("meta") as { title?: Bilingual; description?: Bilingual } | undefined;
  const hero = get("hero") as
    | { back?: Bilingual; eyebrow?: Bilingual; headline?: Bilingual; intro?: Bilingual }
    | undefined;
  const founder = get("founder") as
    | { eyebrow?: Bilingual; title?: Bilingual; paragraphs?: Bilingual[]; quote?: Bilingual; image?: string }
    | undefined;
  const sections = (get("sections") as RoseiiesSection[] | undefined) ?? [];
  const beliefs = (get("beliefs") as Bilingual[] | undefined) ?? [];
  const cta = get("cta") as
    | { kicker?: Bilingual; line?: Bilingual; primary?: Bilingual; secondary?: Bilingual }
    | undefined;

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual
          label={{ es: "Título SEO", en: "Meta Title" }} as="small"
          value={bi(meta?.title)}
          onChange={(v) => set("meta.title", v)}
          className="text-sm text-stone-600"
        />
        <EditableBilingual
          label={{ es: "Descripción SEO", en: "Meta Description" }} as="small"
          value={bi(meta?.description)}
          onChange={(v) => set("meta.description", v)}
          className="text-sm text-stone-600" multiline
        />
      </MetaSection>

      <Card title={t({ es: "Sección principal", en: "Hero" })}>
        <BilingualField label={t({ es: "Etiqueta del enlace de regreso", en: "Back link label" })} value={bi(hero?.back)} onChange={(v) => set("hero.back", v)} />
        <BilingualField label={t({ es: "Antetítulo", en: "Eyebrow" })} value={bi(hero?.eyebrow)} onChange={(v) => set("hero.eyebrow", v)} />
        <BilingualField label={t({ es: "Título", en: "Headline" })} value={bi(hero?.headline)} onChange={(v) => set("hero.headline", v)} />
        <BilingualField label={t({ es: "Introducción", en: "Intro" })} type="textarea" rows={4} value={bi(hero?.intro)} onChange={(v) => set("hero.intro", v)} />
      </Card>

      <Card title={t({ es: "Fundadora — Adriana", en: "Founder — Adriana" })}>
        <BilingualField label={t({ es: "Antetítulo", en: "Eyebrow" })} value={bi(founder?.eyebrow)} onChange={(v) => set("founder.eyebrow", v)} />
        <BilingualField label={t({ es: "Título", en: "Title" })} value={bi(founder?.title)} onChange={(v) => set("founder.title", v)} />
        <EditableListShell<Bilingual>
          label={{ es: "Párrafos", en: "Paragraphs" }}
          items={founder?.paragraphs ?? []}
          onChange={(items) => set("founder.paragraphs", items)}
          makeItem={() => ({ ...EMPTY })}
          addLabel={{ es: "Agregar párrafo", en: "Add paragraph" }}
          renderItem={(item, update) => (
            <BilingualField label={t({ es: "Párrafo", en: "Paragraph" })} type="textarea" rows={3} value={bi(item)} onChange={(v) => update(v)} />
          )}
        />
        <BilingualField label={t({ es: "Cita destacada", en: "Pull quote" })} value={bi(founder?.quote)} onChange={(v) => set("founder.quote", v)} />
        <ImageUpload
          label={t({ es: "Retrato", en: "Portrait" })}
          value={founder?.image ?? ""}
          onChange={(v) => set("founder.image", v)}
          folder="team"
        />
      </Card>

      <EditableListShell<RoseiiesSection>
        label={{ es: "Secciones editoriales", en: "Editorial sections" }}
        items={sections}
        onChange={(items) => set("sections", items)}
        makeItem={() => ({ eyebrow: { ...EMPTY }, title: { ...EMPTY }, body: [] })}
        addLabel={{ es: "Agregar sección", en: "Add section" }}
        renderItem={(section, update) => (
          <>
            <BilingualField label={t({ es: "Antetítulo", en: "Eyebrow" })} value={bi(section.eyebrow)} onChange={(v) => update({ eyebrow: v })} />
            <BilingualField label={t({ es: "Título", en: "Title" })} value={bi(section.title)} onChange={(v) => update({ title: v })} />
            <EditableListShell<Bilingual>
              label={{ es: "Párrafos", en: "Paragraphs" }}
              items={section.body ?? []}
              onChange={(body) => update({ body })}
              makeItem={() => ({ ...EMPTY })}
              addLabel={{ es: "Agregar párrafo", en: "Add paragraph" }}
              renderItem={(p, updateP) => (
                <BilingualField label={t({ es: "Párrafo", en: "Paragraph" })} type="textarea" rows={3} value={bi(p)} onChange={(v) => updateP(v)} />
              )}
            />
          </>
        )}
      />

      <Card title={t({ es: "Fichas de principios (se muestran bajo la última sección)", en: "Principle chips (shown under the last section)" })}>
        <EditableListShell<Bilingual>
          label={{ es: "Creencias", en: "Beliefs" }}
          items={beliefs}
          onChange={(items) => set("beliefs", items)}
          makeItem={() => ({ ...EMPTY })}
          addLabel={{ es: "Agregar creencia", en: "Add belief" }}
          renderItem={(item, update) => (
            <BilingualField label={t({ es: "Creencia", en: "Belief" })} type="textarea" rows={2} value={bi(item)} onChange={(v) => update(v)} />
          )}
        />
      </Card>

      <Card title={t({ es: "Llamado a la acción (abajo)", en: "Bottom CTA" })}>
        <BilingualField label={t({ es: "Antetítulo (junto al logo)", en: "Kicker (next to the logo)" })} value={bi(cta?.kicker)} onChange={(v) => set("cta.kicker", v)} />
        <BilingualField label={t({ es: "Línea", en: "Line" })} value={bi(cta?.line)} onChange={(v) => set("cta.line", v)} />
        <BilingualField label={t({ es: "Botón principal", en: "Primary button" })} value={bi(cta?.primary)} onChange={(v) => set("cta.primary", v)} />
        <BilingualField label={t({ es: "Botón secundario", en: "Secondary button" })} value={bi(cta?.secondary)} onChange={(v) => set("cta.secondary", v)} />
      </Card>
    </div>
  );
}

export default function RoseiiesAdmin() {
  return (
    <SectionGuard sectionKey="pages.roseiies">
      <VisualPageEditor
        title="roseiies"
        table="roseiies_content"
        icon={<Globe className="w-5 h-5 text-[var(--olivea-olive)]" />}
        fallbackData={roseiiesContent as unknown as Record<string, unknown>}
        livePath="/roseiies"
      >
        <RoseiiesVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
