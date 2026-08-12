"use client";

// Press Coverage — manage the awards & mentions shown on /press.
// Rows live in Supabase press_items (the page's primary source; the
// legacy MDX files only serve if this table is empty/unreachable).

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Newspaper,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Star,
  ExternalLink,
  X,
  Save,
} from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import BilingualField from "@/components/admin/BilingualField";
import ImageUpload from "@/components/admin/ImageUpload";
import EditableListShell from "@/components/admin/visual-editor/EditableListShell";
import { useAuth } from "@/components/admin/AuthProvider";
import {
  getPressItemsAdmin,
  savePressItem,
  togglePressItem,
  deletePressItem,
} from "@/lib/supabase/actions";
import type { Bilingual } from "@/lib/content/types";
import { useAdminLocale, STR, type B } from "@/lib/admin/i18n";
import { useConfirm } from "@/components/admin/ConfirmDialog";

/* ── Types (mirror the press_items table) ── */

type PressLinkDraft = { label: Bilingual; href: string };

interface PressRow {
  id: string;
  kind: "award" | "mention";
  published_at: string;
  issuer: string;
  target: "olivea" | "hotel" | "restaurant" | "cafe";
  title: Bilingual;
  section?: Bilingual | null;
  tags?: string[] | null;
  links: { label: string | Bilingual; href: string }[];
  blurb: Bilingual;
  cover?: { src?: string; alt?: string } | null;
  starred?: boolean | null;
  enabled?: boolean | null;
}

const EMPTY_BI: Bilingual = { es: "", en: "" };
const bi = (v: unknown): Bilingual => {
  const o = (v ?? {}) as Partial<Bilingual>;
  return { es: o.es ?? "", en: o.en ?? "" };
};

const VENUES: { value: PressRow["target"]; label: B }[] = [
  { value: "olivea", label: { es: "Olivea (todos)", en: "Olivea (all)" } },
  { value: "restaurant", label: { es: "Farm To Table", en: "Farm To Table" } },
  { value: "hotel", label: { es: "Casa Olivea", en: "Casa Olivea" } },
  { value: "cafe", label: { es: "Café", en: "Café" } },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function newDraft(): PressRow {
  return {
    id: "",
    kind: "mention",
    published_at: "",
    issuer: "",
    target: "olivea",
    title: { ...EMPTY_BI },
    section: { ...EMPTY_BI },
    tags: [],
    links: [],
    blurb: { ...EMPTY_BI },
    cover: null,
    starred: false,
    enabled: true,
  };
}

const inputCls =
  "w-full text-sm px-3 py-2 rounded-md border border-stone-300 bg-white/70 text-stone-800 placeholder:text-stone-400 focus:ring-1 focus:ring-olive-500 focus:border-olive-500 outline-none disabled:opacity-50";
const labelCls = "block text-xs font-medium text-stone-500 uppercase tracking-wide";

/* ── Editor form ── */

function PressItemForm({
  initial,
  isNew,
  onCancel,
  onSaved,
}: {
  initial: PressRow;
  isNew: boolean;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<PressRow>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<B | null>(null);
  const { t } = useAdminLocale();

  const patch = (p: Partial<PressRow>) => setDraft((d) => ({ ...d, ...p }));

  // Links normalized to bilingual labels for editing
  const linkDrafts: PressLinkDraft[] = useMemo(
    () =>
      (draft.links ?? []).map((l) => ({
        label:
          typeof l.label === "string" ? { es: l.label, en: l.label } : bi(l.label),
        href: l.href ?? "",
      })),
    [draft.links]
  );

  const idValid = /^[a-z0-9][a-z0-9-]{1,80}$/i.test(draft.id);
  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(draft.published_at);
  const linksValid =
    linkDrafts.length > 0 &&
    linkDrafts.every(
      (l) => (l.label.es || l.label.en) && /^https?:\/\//i.test(l.href)
    );
  const valid =
    idValid && dateValid && draft.issuer.trim() && (draft.title.es || draft.title.en) && linksValid;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      const section = bi(draft.section);
      await savePressItem({
        id: draft.id,
        kind: draft.kind,
        published_at: draft.published_at,
        issuer: draft.issuer.trim(),
        target: draft.target,
        title: bi(draft.title),
        section: section.es || section.en ? section : {},
        tags: (draft.tags ?? []).filter(Boolean),
        links: linkDrafts,
        blurb: bi(draft.blurb),
        cover: draft.cover?.src ? draft.cover : null,
        starred: draft.kind === "award" && !!draft.starred,
        enabled: draft.enabled !== false,
      });
      onSaved();
    } catch (err) {
      console.error("Save failed:", err);
      setError({
        es: "No se pudo guardar — revisa los campos e inténtalo de nuevo.",
        en: "Save failed — check the fields and try again.",
      });
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--olivea-olive)]/[0.2] bg-white/80 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-800">
          {isNew
            ? t({ es: "Nuevo elemento de prensa", en: "New press item" })
            : `${t({ es: "Editando", en: "Editing" })}: ${draft.id}`}
        </h2>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors" title={t(STR.cancel)}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelCls}>{t({ es: "Tipo", en: "Type" })}</label>
          <select
            value={draft.kind}
            onChange={(e) => patch({ kind: e.target.value as PressRow["kind"] })}
            className={inputCls}
          >
            <option value="award">{t({ es: "Reconocimiento / premio", en: "Award / recognition" })}</option>
            <option value="mention">{t({ es: "Mención de prensa", en: "Press mention" })}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>{t({ es: "Acerca de", en: "About" })}</label>
          <select
            value={draft.target}
            onChange={(e) => patch({ target: e.target.value as PressRow["target"] })}
            className={inputCls}
          >
            {VENUES.map((v) => (
              <option key={v.value} value={v.value}>{t(v.label)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>{t({ es: "Fecha de publicación", en: "Published date" })}</label>
          <input
            type="date"
            value={draft.published_at}
            onChange={(e) => patch({ published_at: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>{t({ es: "Emisor / medio", en: "Issuer / outlet" })}</label>
          <input
            type="text"
            value={draft.issuer}
            placeholder={t({ es: "Guía MICHELIN, The Wall Street Journal…", en: "MICHELIN Guide, The Wall Street Journal…" })}
            onChange={(e) => patch({ issuer: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <BilingualField
        label={t({ es: "Título", en: "Title" })}
        value={bi(draft.title)}
        onChange={(v) => {
          patch({ title: v });
          if (isNew && !draft.id && v.en) patch({ title: v, id: slugify(v.en) });
        }}
      />

      {isNew && (
        <div className="space-y-1.5">
          <label className={labelCls}>
            {t({ es: "ID (compatible con URL, permanente)", en: "ID (URL-safe, permanent)" })}{" "}
            <span className={idValid || !draft.id ? "text-stone-400" : "text-red-500"}>
              {idValid || !draft.id ? "" : t({ es: "— minúsculas, números y guiones", en: "— lowercase letters, numbers, dashes" })}
            </span>
          </label>
          <input
            type="text"
            value={draft.id}
            placeholder="wsj-best-destinations-2026"
            onChange={(e) => patch({ id: slugify(e.target.value) })}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      )}

      <BilingualField
        label={t({ es: "Reseña (descripción breve)", en: "Blurb (short description)" })}
        type="textarea"
        rows={3}
        value={bi(draft.blurb)}
        onChange={(v) => patch({ blurb: v })}
      />

      <EditableListShell<PressLinkDraft>
        label={t({ es: "Enlaces (al menos uno)", en: "Links (at least one)" })}
        items={linkDrafts}
        onChange={(links) => patch({ links })}
        makeItem={() => ({ label: { es: "Fuente oficial", en: "Official source" }, href: "" })}
        addLabel={t({ es: "Agregar enlace", en: "Add link" })}
        renderItem={(link, update) => (
          <>
            <BilingualField
              label={t({ es: "Etiqueta", en: "Label" })}
              value={bi(link.label)}
              onChange={(v) => update({ label: v })}
            />
            <div className="space-y-1.5">
              <label className={labelCls}>{t({ es: "URL", en: "URL" })}</label>
              <input
                type="url"
                value={link.href}
                placeholder="https://…"
                onChange={(e) => update({ href: e.target.value.trim() })}
                className={`${inputCls} font-mono text-xs ${
                  link.href && !/^https?:\/\//i.test(link.href) ? "border-red-400" : ""
                }`}
              />
            </div>
          </>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelCls}>{t({ es: "Etiquetas (separadas por comas)", en: "Tags (comma-separated)" })}</label>
          <input
            type="text"
            value={(draft.tags ?? []).join(", ")}
            placeholder={t({ es: "MICHELIN, Sostenibilidad", en: "MICHELIN, Sustainability" })}
            onChange={(e) =>
              patch({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
            }
            className={inputCls}
          />
        </div>
        <BilingualField
          label={t({ es: "Etiqueta de sección (opcional)", en: "Section label (optional)" })}
          value={bi(draft.section)}
          onChange={(v) => patch({ section: v })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 items-start">
        <ImageUpload
          label={t({ es: "Imagen de portada (opcional, para menciones)", en: "Cover image (optional, for mentions)" })}
          value={draft.cover?.src ?? ""}
          onChange={(src) => patch({ cover: src ? { ...(draft.cover ?? {}), src } : null })}
          folder="press"
        />
        <div className="space-y-4 pt-1">
          {draft.cover?.src && (
            <div className="space-y-1.5">
              <label className={labelCls}>{t({ es: "Texto alternativo de la portada", en: "Cover alt text" })}</label>
              <input
                type="text"
                value={draft.cover?.alt ?? ""}
                onChange={(e) => patch({ cover: { ...(draft.cover ?? {}), alt: e.target.value } })}
                className={inputCls}
              />
            </div>
          )}
          {draft.kind === "award" && (
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={!!draft.starred}
                onChange={(e) => patch({ starred: e.target.checked })}
                className="rounded border-stone-300"
              />
              {t({ es: "Reconocimiento destacado (fijado hasta arriba)", en: "Featured award (pinned at the top)" })}
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {t(error)}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-stone-500 hover:bg-stone-100 transition-colors"
        >
          {t(STR.cancel)}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !valid}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            valid
              ? "bg-[var(--olivea-olive)] text-white shadow-md hover:shadow-lg"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t(STR.saving) : t({ es: "Guardar elemento", en: "Save item" })}
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */

function PressAdmin() {
  const confirm = useConfirm();
  const { canEdit, canDelete } = useAuth();
  const { t } = useAdminLocale();
  const [rows, setRows] = useState<PressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PressRow | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await getPressItemsAdmin()) as unknown as PressRow[];
      setRows(data);
    } catch (err) {
      console.error("Load failed:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => { setEditing(newDraft()); setIsNew(true); };
  const startEdit = (row: PressRow) => { setEditing(row); setIsNew(false); };

  const handleToggle = async (row: PressRow) => {
    const next = !(row.enabled !== false);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, enabled: next } : r)));
    try {
      await togglePressItem(row.id, next);
    } catch {
      load();
    }
  };

  const handleDelete = async (row: PressRow) => {
    const ok = await confirm({
      tone: "danger",
      title: {
        es: `¿Eliminar “${row.title?.es || row.id}”?`,
        en: `Delete “${row.title?.es || row.id}”?`,
      },
      body: {
        es: "Esta acción no se puede deshacer.",
        en: "This cannot be undone.",
      },
    });
    if (!ok) return;
    try {
      await deletePressItem(row.id);
      setRows((rs) => rs.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-[var(--olivea-olive)]" />
          <div>
            <h1 className="text-base font-semibold text-stone-800">{t({ es: "Prensa y Reconocimientos", en: "Press Coverage" })}</h1>
            <p className="text-[11px] text-stone-400">
              {t({ es: "Premios y menciones en la página pública de prensa — los cambios aparecen en menos de un minuto", en: "Awards & mentions on the public press page — changes live within a minute" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/es/press"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--olivea-olive)] text-xs font-medium hover:bg-[var(--olivea-cream)]/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t(STR.viewLivePage)}
          </a>
          {canEdit && !editing && (
            <button
              onClick={startNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--olivea-olive)] text-white text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {t({ es: "Nuevo elemento", en: "New item" })}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      {editing && (
        <PressItemForm
          initial={editing}
          isNew={isNew}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          {t({ es: "Cargando elementos de prensa…", en: "Loading press items…" })}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-stone-400 italic text-center py-8">
          {t({
            es: "Aún no hay elementos de prensa en la base de datos — el sitio está mostrando los elementos heredados basados en archivos. Agrega tu primer elemento arriba.",
            en: "No press items in the database yet — the site is showing the legacy file-based items. Add your first item above.",
          })}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const enabled = row.enabled !== false;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  enabled
                    ? "border-stone-200/80 bg-white/60"
                    : "border-stone-200/50 bg-stone-50/50 opacity-60"
                }`}
              >
                <span
                  className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    row.kind === "award"
                      ? "bg-amber-50 text-amber-700 border-amber-200/60"
                      : "bg-sky-50 text-sky-700 border-sky-200/60"
                  }`}
                >
                  {t(row.kind === "award" ? { es: "reconocimiento", en: "award" } : { es: "mención", en: "mention" })}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-stone-800 truncate">
                    {row.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />}
                    <span className="truncate">{row.title?.es || row.title?.en || row.id}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 truncate">
                    {row.issuer} · {String(row.published_at).slice(0, 10)} · {row.target}
                  </div>
                </div>
                {canEdit && (
                  <>
                    <button
                      onClick={() => handleToggle(row)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border transition-colors ${
                        enabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                      }`}
                      title={enabled ? t({ es: "Visible en el sitio — haz clic para ocultar", en: "Visible on the site — click to hide" }) : t({ es: "Oculto — haz clic para mostrar", en: "Hidden — click to show" })}
                    >
                      {enabled ? t({ es: "En vivo", en: "Live" }) : t({ es: "Oculto", en: "Hidden" })}
                    </button>
                    <button
                      onClick={() => startEdit(row)}
                      className="shrink-0 p-2 rounded-lg text-stone-400 hover:text-[var(--olivea-olive)] hover:bg-stone-100 transition-colors"
                      title={t(STR.edit)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(row)}
                    className="shrink-0 p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title={t(STR.delete)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-stone-400 leading-relaxed">
        {t({
          es: "Estos elementos son la fuente de verdad de la página de prensa. Los elementos antiguos basados en archivos solo aparecen si esta lista está completamente vacía.",
          en: "These items are the press page’s source of truth. The old file-based items only appear if this list is completely empty.",
        })}
      </p>
    </div>
  );
}

export default function PressAdminPage() {
  return (
    <SectionGuard sectionKey="content.pressitems">
      <PressAdmin />
    </SectionGuard>
  );
}
