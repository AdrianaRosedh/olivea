"use client";

// Admin editor for the public Innovation page (/innovation).
// Every text block on the page is editable here; saves write to
// innovation_content in Supabase and go live within a minute.

import { Sparkles } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import innovationContent from "@/lib/content/data/innovation";
import BilingualField from "@/components/admin/BilingualField";
import EditableListShell from "@/components/admin/visual-editor/EditableListShell";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
} from "@/components/admin/visual-editor";
import type { Bilingual, InnovationCraftItem } from "@/lib/content/types";

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

function InnovationVisual() {
  const { get, set } = useEditor();

  const meta = get("meta") as { title?: Bilingual; description?: Bilingual } | undefined;
  const hero = get("hero") as
    | { eyebrow?: Bilingual; headline?: Bilingual; intro?: Bilingual }
    | undefined;
  const craft = get("craft") as
    | { eyebrow?: Bilingual; title?: Bilingual; intro?: Bilingual; items?: InnovationCraftItem[] }
    | undefined;
  const technology = get("technology") as
    | { eyebrow?: Bilingual; intro?: Bilingual; items?: Bilingual[] }
    | undefined;
  const method = get("method") as
    | { eyebrow?: Bilingual; lead?: Bilingual; body?: Bilingual }
    | undefined;
  const closing = get("closing") as { line?: Bilingual } | undefined;

  return (
    <div className="space-y-6">
      <MetaSection>
        <EditableBilingual
          label="Meta Title" as="small"
          value={bi(meta?.title)}
          onChange={(v) => set("meta.title", v)}
          className="text-sm text-stone-600"
        />
        <EditableBilingual
          label="Meta Description" as="small"
          value={bi(meta?.description)}
          onChange={(v) => set("meta.description", v)}
          className="text-sm text-stone-600" multiline
        />
      </MetaSection>

      <Card title="Hero">
        <BilingualField label="Eyebrow" value={bi(hero?.eyebrow)} onChange={(v) => set("hero.eyebrow", v)} />
        <BilingualField label="Headline" value={bi(hero?.headline)} onChange={(v) => set("hero.headline", v)} />
        <BilingualField label="Intro" type="textarea" rows={4} value={bi(hero?.intro)} onChange={(v) => set("hero.intro", v)} />
      </Card>

      <Card title="The Craft — laboratory panel">
        <BilingualField label="Eyebrow" value={bi(craft?.eyebrow)} onChange={(v) => set("craft.eyebrow", v)} />
        <BilingualField label="Title" value={bi(craft?.title)} onChange={(v) => set("craft.title", v)} />
        <BilingualField label="Intro" type="textarea" rows={2} value={bi(craft?.intro)} onChange={(v) => set("craft.intro", v)} />
        <EditableListShell<InnovationCraftItem>
          label="Craft items (numbered 01, 02… by order)"
          items={craft?.items ?? []}
          onChange={(items) => set("craft.items", items)}
          makeItem={() => ({ title: { ...EMPTY }, line: { ...EMPTY } })}
          addLabel="Add craft item"
          renderItem={(item, update) => (
            <>
              <BilingualField label="Title" value={bi(item.title)} onChange={(v) => update({ title: v })} />
              <BilingualField label="Line" type="textarea" rows={2} value={bi(item.line)} onChange={(v) => update({ line: v })} />
            </>
          )}
        />
      </Card>

      <Card title="The Technology — roseiies panel">
        <BilingualField label="Eyebrow" value={bi(technology?.eyebrow)} onChange={(v) => set("technology.eyebrow", v)} />
        <BilingualField label="Intro" type="textarea" rows={3} value={bi(technology?.intro)} onChange={(v) => set("technology.intro", v)} />
        <EditableListShell<Bilingual>
          label="Quiet-work list"
          items={technology?.items ?? []}
          onChange={(items) => set("technology.items", items)}
          makeItem={() => ({ ...EMPTY })}
          addLabel="Add line"
          renderItem={(item, update) => (
            <BilingualField label="Line" value={bi(item)} onChange={(v) => update(v)} />
          )}
        />
      </Card>

      <Card title="Center quote">
        <BilingualField label="Quote" value={bi(get("quote"))} onChange={(v) => set("quote", v)} />
      </Card>

      <Card title="The Method">
        <BilingualField label="Eyebrow" value={bi(method?.eyebrow)} onChange={(v) => set("method.eyebrow", v)} />
        <BilingualField label="Lead paragraph" type="textarea" rows={3} value={bi(method?.lead)} onChange={(v) => set("method.lead", v)} />
        <BilingualField label="Body paragraph" type="textarea" rows={3} value={bi(method?.body)} onChange={(v) => set("method.body", v)} />
      </Card>

      <Card title="Closing line">
        <BilingualField label="Line" value={bi(closing?.line)} onChange={(v) => set("closing.line", v)} />
      </Card>
    </div>
  );
}

export default function InnovationAdmin() {
  return (
    <SectionGuard sectionKey="pages.innovation">
      <VisualPageEditor
        title="Innovation"
        table="innovation_content"
        icon={<Sparkles className="w-5 h-5 text-[var(--olivea-olive)]" />}
        fallbackData={innovationContent as unknown as Record<string, unknown>}
        livePath="/innovation"
      >
        <InnovationVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
