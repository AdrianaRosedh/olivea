"use client";

// components/admin/PhilosophySectionsEditor.tsx
//
// Editor for the philosophy chapters on /sustainability.
//
// These live in the `sustainability_sections` table, which is NOT the table
// behind the rest of that admin page. The page editor used to render an
// EditableSections block for them, reading the chapters out of the static
// data file and writing them back as a `sections` key on
// `sustainability_content` — a column that does not exist there, so the whole
// page save failed on the unknown column. Meanwhile the live page rendered
// from `sustainability_sections`, which nothing in the admin ever wrote to.
//
// So this stands apart from VisualPageEditor with its own load and save,
// talking to the table the page actually reads, through the server actions
// that already existed for it.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Leaf, Loader2, Save } from "lucide-react";
import EditableListShell from "@/components/admin/visual-editor/EditableListShell";
import EditableBilingual from "@/components/admin/visual-editor/EditableBilingual";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import { htmlToPlainParagraphs } from "@/lib/content/rich-text";
import {
  getSustainabilitySections,
  saveSustainabilitySection,
  deleteSustainabilitySection,
} from "@/lib/supabase/actions";

type B = { es: string; en: string };

type Chapter = {
  id: string;
  title: B;
  subtitle: B;
  body: B;
  signals: B[];
  practices: B[];
  /** False for rows loaded from the database; true until first saved. */
  isNew?: boolean;
};

const emptyB = (): B => ({ es: "", en: "" });

/** Rows arrive snake_cased from PostgREST with possibly-null jsonb columns. */
type Row = {
  id?: unknown;
  title?: unknown;
  subtitle?: unknown;
  body?: unknown;
  signals?: unknown;
  practices?: unknown;
  sort_order?: unknown;
};

function asB(v: unknown): B {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return {
      es: typeof o.es === "string" ? o.es : "",
      en: typeof o.en === "string" ? o.en : "",
    };
  }
  return emptyB();
}

function asBList(v: unknown): B[] {
  return Array.isArray(v) ? v.map(asB) : [];
}

/**
 * Bodies are stored as HTML but render as plain paragraphs, and the renderer
 * already collapses <br /> to a space — so showing plain text here promises
 * exactly what the page will show. Saving plain text back is lossless for
 * anything a visitor sees.
 */
function bodyForEditing(v: unknown): B {
  const raw = asB(v);
  return {
    es: htmlToPlainParagraphs(raw.es),
    en: htmlToPlainParagraphs(raw.en),
  };
}

/** A readable anchor id — chapters are linked to by id from the page nav. */
function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function PhilosophySectionsEditor() {
  const { t } = useAdminLocale();

  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [loadedIds, setLoadedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Snapshot of what came out of the database, so saving can write only the
  // chapters that actually changed rather than rewriting all of them.
  const [original, setOriginal] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = (await getSustainabilitySections()) as Row[];
      const list: Chapter[] = (rows ?? []).map((r) => ({
        id: String(r.id ?? ""),
        title: asB(r.title),
        subtitle: asB(r.subtitle),
        body: bodyForEditing(r.body),
        signals: asBList(r.signals),
        practices: asBList(r.practices),
      }));
      setChapters(list);
      setLoadedIds(list.map((c) => c.id));
      setOriginal(Object.fromEntries(list.map((c) => [c.id, JSON.stringify(c)])));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setChapters([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!chapters) return false;
    if (chapters.length !== loadedIds.length) return true;
    return chapters.some((c) => original[c.id] !== JSON.stringify({ ...c, isNew: undefined }));
  }, [chapters, loadedIds, original]);

  async function handleSave() {
    if (!chapters) return;
    setSaving(true);
    setError(null);
    try {
      // Order is taken from position, so dragging a chapter is the only way
      // ordering is expressed — no hidden number to keep in sync.
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        const id = c.id || slugify(c.title.en || c.title.es) || `chapter-${i + 1}`;
        const snapshot = JSON.stringify({ ...c, id, isNew: undefined });
        const positionChanged = loadedIds[i] !== id;
        if (!positionChanged && original[id] === snapshot) continue;

        await saveSustainabilitySection({
          id,
          title: c.title,
          subtitle: c.subtitle,
          body: c.body,
          signals: c.signals,
          practices: c.practices,
          sort_order: i + 1,
        });
      }

      // Anything present when we loaded but gone now.
      const keptIds = new Set(
        chapters.map((c, i) => c.id || slugify(c.title.en || c.title.es) || `chapter-${i + 1}`)
      );
      for (const id of loadedIds) {
        if (!keptIds.has(id)) await deleteSustainabilitySection(id);
      }

      await load();
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (chapters === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-stone-500 p-6">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t({ es: "Cargando capítulos…", en: "Loading chapters…" })}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-[var(--olivea-olive)] opacity-60" />
          <h3 className="text-sm font-semibold text-[var(--olivea-ink)]">
            {t({ es: "Capítulos de la filosofía", en: "Philosophy chapters" })}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && !dirty && (
            <span className="text-[11px] text-stone-500">
              {t({ es: "Guardado", en: "Saved" })} {savedAt}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold bg-[var(--olivea-olive)] text-white disabled:opacity-40 transition"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {t(STR.save)}
          </button>
        </div>
      </header>

      <p className="text-[11px] leading-relaxed text-stone-500">
        {t({
          es: "Estos capítulos son los que arma la página. Añade, elimina o reordena y así aparecerán. El cuerpo se escribe como texto normal: una línea en blanco separa párrafos.",
          en: "These chapters are what the page is built from. Add, delete or reorder them and that is how they appear. Bodies are plain text: a blank line separates paragraphs.",
        })}
      </p>

      {error && (
        <p className="rounded-xl bg-red-50 ring-1 ring-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <EditableListShell<Chapter>
        label={{ es: "Capítulos", en: "Chapters" }}
        addLabel={{ es: "Añadir capítulo", en: "Add chapter" }}
        items={chapters}
        onChange={setChapters}
        makeItem={() => ({
          id: "",
          title: emptyB(),
          subtitle: emptyB(),
          body: emptyB(),
          signals: [],
          practices: [],
          isNew: true,
        })}
        renderItem={(item, update) => (
          <div className="space-y-3">
            <EditableBilingual
              label={{ es: "Título", en: "Title" }}
              value={item.title}
              onChange={(v) => update({ title: v as B })}
              className="text-sm font-semibold text-stone-800"
            />
            <EditableBilingual
              label={{ es: "Subtítulo", en: "Subtitle" }}
              value={item.subtitle}
              onChange={(v) => update({ subtitle: v as B })}
              className="text-xs text-stone-600"
            />
            <EditableBilingual
              label={{ es: "Cuerpo", en: "Body" }}
              value={item.body}
              onChange={(v) => update({ body: v as B })}
              className="text-xs text-stone-600 leading-relaxed"
              multiline
            />

            <EditableListShell<B>
              label={{ es: "Señales", en: "Signals" }}
              addLabel={{ es: "Añadir señal", en: "Add signal" }}
              items={item.signals}
              onChange={(v) => update({ signals: v })}
              makeItem={emptyB}
              renderItem={(sig, upd) => (
                <EditableBilingual
                  label={{ es: "Señal", en: "Signal" }}
                  value={sig}
                  onChange={(v) => upd(v as B)}
                  className="text-xs text-stone-600"
                />
              )}
            />

            <EditableListShell<B>
              label={{ es: "Prácticas", en: "Practices" }}
              addLabel={{ es: "Añadir práctica", en: "Add practice" }}
              items={item.practices}
              onChange={(v) => update({ practices: v })}
              makeItem={emptyB}
              renderItem={(prac, upd) => (
                <EditableBilingual
                  label={{ es: "Práctica", en: "Practice" }}
                  value={prac}
                  onChange={(v) => upd(v as B)}
                  className="text-xs text-stone-600"
                />
              )}
            />

            {/* The id is the anchor the page nav links to, so renaming one
                would break an existing link. New chapters get a slug from the
                English title on first save. */}
            <p className="text-[10px] text-stone-400">
              {item.id
                ? `id: ${item.id}`
                : t({ es: "id: se generará del título", en: "id: generated from the title" })}
            </p>
          </div>
        )}
      />

      {!chapters.length && (
        <p className="text-[11px] text-stone-500">
          {t({
            es: "Sin capítulos, la página vuelve al contenido de respaldo incluido en el código.",
            en: "With no chapters, the page falls back to the seed content shipped in the code.",
          })}
        </p>
      )}
    </section>
  );
}
