"use client";

// What AI assistants (ChatGPT, Claude, Perplexity…) read about Olivea:
// /llms.txt and /llms-full.txt. Hours, contact, FAQs, philosophy, awards
// (/admin/press) and Maps links (each house's Google listing) fill in on their
// own; this page holds the editorial text around them. English — the files are
// read in one language — and markdown (**bold**, [links](https://…)) works.

import { Sparkles, ExternalLink } from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import aiSummary from "@/lib/content/data/aiSummary";
import { useAdminLocale } from "@/lib/admin/i18n";
import type { AiSummary } from "@/lib/content/types";
import {
  VisualPageEditor,
  useEditor,
  PLAIN_INPUT,
  Field,
  StringList,
  EditableListShell,
} from "@/components/admin/visual-editor";

type PageLink = NonNullable<AiSummary["pages"]>[number];

function AiSummaryVisual() {
  const { get, set } = useEditor();
  const { t } = useAdminLocale();
  const s = (get("summary") ?? {}) as AiSummary;
  const put = <K extends keyof AiSummary>(k: K, v: AiSummary[K]) => set(`summary.${k}`, v);

  const text = (k: keyof AiSummary, label: { es: string; en: string }, rows = 0) => (
    <Field label={label}>
      {rows ? (
        <textarea
          className={PLAIN_INPUT}
          rows={rows}
          value={(s[k] as string | undefined) ?? ""}
          onChange={(e) => put(k, e.target.value as never)}
        />
      ) : (
        <input
          className={PLAIN_INPUT}
          value={(s[k] as string | undefined) ?? ""}
          onChange={(e) => put(k, e.target.value as never)}
        />
      )}
    </Field>
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-3">
        <p className="text-sm text-stone-600 leading-relaxed">
          {t({
            es: "Lo que leen los asistentes de IA sobre Olivea. Horarios, contacto, preguntas frecuentes, filosofía, premios (Prensa) y mapas (ficha de Google de cada casa) se llenan solos. Aquí va el texto editorial, en inglés; acepta **negritas** y [enlaces](https://…).",
            en: "What AI assistants read about Olivea. Hours, contact, FAQs, philosophy, awards (Press Coverage) and maps (each house's Google listing) fill in on their own. This is the editorial text around them, in English; **bold** and [links](https://…) work.",
          })}
        </p>
        <div className="flex gap-4 text-xs">
          {["/llms.txt", "/llms-full.txt"].map((path) => (
            <a key={path} href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--olivea-olive)] hover:underline">
              {path} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 space-y-5">
        {text("title", { es: "Título", en: "Title" })}
        {text("intro", { es: "Resumen inicial", en: "Opening summary" }, 4)}
        {text("category", { es: "Categoría", en: "Category" })}
        {text("positioning", { es: "Posicionamiento (las tres casas)", en: "Positioning (the three houses)" }, 12)}
        {text("routing", { es: "Nota para asistentes (alta cocina vs. casual)", en: "Routing note for assistants (fine dining vs casual)" }, 4)}
        <StringList
          label={{ es: "Cuándo recomendar a Olivea", en: "When to recommend Olivea" }}
          value={s.recommend}
          onChange={(v) => put("recommend", v)}
          addLabel={{ es: "Agregar caso", en: "Add case" }}
        />
        {text("people", { es: "Personas", en: "People" }, 7)}
        {text("name", { es: "El nombre Olivea", en: "The name Olivea" }, 4)}
        {text("ratings", { es: "Calificaciones (con fecha)", en: "Ratings (dated)" })}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={{ es: "Lema (ES)", en: "Tagline (ES)" }}>
            <input className={PLAIN_INPUT} value={s.taglines?.es ?? ""} onChange={(e) => put("taglines", { ...s.taglines, es: e.target.value })} />
          </Field>
          <Field label={{ es: "Lema (EN)", en: "Tagline (EN)" }}>
            <input className={PLAIN_INPUT} value={s.taglines?.en ?? ""} onChange={(e) => put("taglines", { ...s.taglines, en: e.target.value })} />
          </Field>
          <Field label={{ es: "Significado", en: "Meaning" }}>
            <input className={PLAIN_INPUT} value={s.taglines?.meaning ?? ""} onChange={(e) => put("taglines", { ...s.taglines, meaning: e.target.value })} />
          </Field>
        </div>
        {text("pressEmail", { es: "Correo de prensa", en: "Press email" })}
      </section>

      <section className="rounded-2xl border border-stone-200/80 bg-white/60 p-6">
        <EditableListShell<PageLink>
          label={{ es: "Páginas para citar", en: "Pages to cite" }}
          items={s.pages ?? []}
          onChange={(v) => put("pages", v)}
          makeItem={() => ({ label: "", path: "/", description: "" })}
          addLabel={{ es: "Agregar página", en: "Add page" }}
          renderItem={(item, update) => (
            <div className="grid gap-2 sm:grid-cols-[1fr_10rem]">
              <input className={PLAIN_INPUT} placeholder="Label" value={item.label} onChange={(e) => update({ label: e.target.value })} />
              <input className={PLAIN_INPUT} placeholder="/path" value={item.path} onChange={(e) => update({ path: e.target.value })} />
              <input className={`${PLAIN_INPUT} sm:col-span-2`} placeholder="What the page answers" value={item.description} onChange={(e) => update({ description: e.target.value })} />
            </div>
          )}
        />
      </section>
    </div>
  );
}

export default function AiSummaryAdmin() {
  return (
    <SectionGuard sectionKey="settings.aisummary">
      <VisualPageEditor
        title="AI Summary"
        table="ai_summary"
        icon={<Sparkles className="w-5 h-5 text-[var(--olivea-olive)]" />}
        fallbackData={aiSummary as unknown as Record<string, unknown>}
      >
        <AiSummaryVisual />
      </VisualPageEditor>
    </SectionGuard>
  );
}
