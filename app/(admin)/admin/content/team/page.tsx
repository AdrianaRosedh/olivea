"use client";

import { Users } from "lucide-react";
import teamContent from "@/lib/content/data/team";
import {
  VisualPageEditor,
  useEditor,
  MetaSection,
  EditableBilingual,
  EditableJSON,
} from "@/components/admin/visual-editor";

function TeamVisual() {
  const { get, set } = useEditor();
  const meta = get("meta") as
    | { title?: { es: string; en: string }; description?: { es: string; en: string } }
    | undefined;
  const members = (get("members") as unknown[]) ?? [];

  return (
    <div className="space-y-8">
      <MetaSection>
        <EditableBilingual
          label="Meta Title"
          as="small"
          value={meta?.title ?? { es: "", en: "" }}
          onChange={(v) => set("meta.title", v)}
          className="text-sm text-stone-600"
        />
        <EditableBilingual
          label="Meta Description"
          as="small"
          value={meta?.description ?? { es: "", en: "" }}
          onChange={(v) => set("meta.description", v)}
          className="text-sm text-stone-600"
          multiline
        />
      </MetaSection>

      <section className="rounded-3xl bg-white/60 ring-1 ring-black/5 p-8 md:p-12 text-center space-y-4">
        <Users className="w-8 h-8 text-[var(--olivea-olive)] mx-auto opacity-40" />
        <EditableBilingual
          label="Title"
          as="h1"
          value={(get("title") ?? { es: "", en: "" }) as { es: string; en: string }}
          onChange={(v) => set("title", v)}
          className="text-2xl md:text-3xl font-serif text-stone-800"
        />
        <EditableBilingual
          label="Description"
          as="p"
          value={(get("description") ?? { es: "", en: "" }) as { es: string; en: string }}
          onChange={(v) => set("description", v)}
          className="text-base text-stone-600 leading-relaxed max-w-2xl mx-auto"
          multiline
        />
      </section>

      {/* Roster — JSON-editable. Each entry mirrors LeaderProfile. */}
      <section className="rounded-2xl bg-white/40 ring-1 ring-black/5 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Roster ({members.length} members)
          </h3>
          <span className="text-[11px] text-stone-400">
            Leave empty to use the built-in fallback list
          </span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Each member entry is JSON with these fields:{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">id</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">name</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">role: {"{ es, en }"}</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">bio: {"{ es, en }"}</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">avatar</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">gallery: string[]</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">priority</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">tile: &quot;hero&quot; | &quot;md&quot;</code>,{" "}
          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px]">links</code>.
        </p>
        <EditableJSON
          label="Members"
          value={members}
          onChange={(v) => set("members", v)}
          rows={20}
        />
      </section>
    </div>
  );
}

export default function TeamContentAdmin() {
  return (
    <VisualPageEditor
      title="Team"
      table="team_content"
      icon={<Users className="w-5 h-5 text-[var(--olivea-olive)]" />}
      fallbackData={teamContent as unknown as Record<string, unknown>}
    livePath="/team"
      >
      <TeamVisual />
    </VisualPageEditor>
  );
}
