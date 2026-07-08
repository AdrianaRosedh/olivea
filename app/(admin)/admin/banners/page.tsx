"use client";

import { useEffect, useState, useCallback } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import { Flag, Plus, Pencil, Trash2, ChevronUp } from "lucide-react";
import {
  getBanners,
  saveBanner,
  deleteBanner,
  toggleBanner,
} from "@/lib/supabase/actions";
import { useAdminLocale, STR, type B } from "@/lib/admin/i18n";

/* ─── Types ──────────────────────────────────────────────────────── */

interface BannerTranslation {
  text: string;
  ctaLabel: string;
  ctaHref: string;
}

interface Banner {
  id: string;
  type: "notice" | "promo" | "warning";
  enabled: boolean;
  dismissible: boolean;
  starts_at: string;
  ends_at: string;
  translations: { es: BannerTranslation; en: BannerTranslation };
  include_paths: string[];
  exclude_paths: string[];
  created_at?: string;
}

type BannerDraft = Omit<Banner, "created_at">;

const EMPTY_TRANSLATION: BannerTranslation = { text: "", ctaLabel: "", ctaHref: "" };

const EMPTY_BANNER: BannerDraft = {
  id: "",
  type: "notice",
  enabled: true,
  dismissible: true,
  starts_at: "",
  ends_at: "",
  translations: { es: { ...EMPTY_TRANSLATION }, en: { ...EMPTY_TRANSLATION } },
  include_paths: [],
  exclude_paths: [],
};

/* ─── Helpers ────────────────────────────────────────────────────── */

const TYPE_BADGE: Record<string, string> = {
  notice: "bg-[var(--olivea-olive)]/15 text-[var(--olivea-olive)]",
  promo: "bg-amber-100 text-amber-700",
  warning: "bg-red-100 text-red-700",
};

// Visible labels for banner types. The enum values (notice/promo/warning)
// stay as data; only the label shown to the user is localized. Resolved
// with t() inside the component — never at module scope.
const TYPE_LABEL: Record<string, B> = {
  notice: { es: "Aviso", en: "Notice" },
  promo: { es: "Promo", en: "Promo" },
  warning: { es: "Advertencia", en: "Warning" },
};

function formatDate(iso: string) {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function TypeBadge({ type }: { type: string }) {
  const { t } = useAdminLocale();
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_BADGE[type] ?? TYPE_BADGE.notice}`}
    >
      {t(TYPE_LABEL[type] ?? TYPE_LABEL.notice)}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? "bg-[var(--olivea-olive)]" : "bg-black/15"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ─── Translation inputs ─────────────────────────────────────────── */

function TranslationFields({
  lang,
  label,
  value,
  onChange,
}: {
  lang: string;
  label: string;
  value: BannerTranslation;
  onChange: (v: BannerTranslation) => void;
}) {
  const { t } = useAdminLocale();
  const inputCls =
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full";

  return (
    <fieldset className="flex-1 space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-widest text-[var(--olivea-clay)] mb-2">
        {label} ({lang.toUpperCase()})
      </legend>
      <input
        className={inputCls}
        placeholder={t({ es: "Texto del banner", en: "Banner text" })}
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
      />
      <div className="flex gap-3">
        <input
          className={inputCls}
          placeholder={t({ es: "Texto del botón", en: "CTA label" })}
          value={value.ctaLabel}
          onChange={(e) => onChange({ ...value, ctaLabel: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder={t({ es: "Enlace del botón", en: "CTA href" })}
          value={value.ctaHref}
          onChange={(e) => onChange({ ...value, ctaHref: e.target.value })}
        />
      </div>
    </fieldset>
  );
}

/* ─── Banner form (create / edit) ────────────────────────────────── */

function BannerForm({
  draft,
  isNew,
  saving,
  onSave,
  onCancel,
}: {
  draft: BannerDraft;
  isNew: boolean;
  saving: boolean;
  onSave: (b: BannerDraft) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<BannerDraft>(draft);
  const { t } = useAdminLocale();

  const inputCls =
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full";
  const primaryBtn =
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] disabled:opacity-50 transition-colors";
  const ghostBtn =
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors";

  const set = <K extends keyof BannerDraft>(k: K, v: BannerDraft[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Row: ID + Type */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            ID
          </label>
          <input
            className={inputCls}
            placeholder={t({ es: "ej. summer-2026", en: "e.g. summer-2026" })}
            value={form.id}
            onChange={(e) => set("id", e.target.value)}
            disabled={!isNew}
          />
        </div>
        <div className="w-44">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            {t({ es: "Tipo", en: "Type" })}
          </label>
          <select
            className={inputCls}
            value={form.type}
            onChange={(e) => set("type", e.target.value as Banner["type"])}
          >
            <option value="notice">{t(TYPE_LABEL.notice)}</option>
            <option value="promo">{t(TYPE_LABEL.promo)}</option>
            <option value="warning">{t(TYPE_LABEL.warning)}</option>
          </select>
        </div>
      </div>

      {/* Translations: ES / EN side by side */}
      <div className="flex gap-6 flex-col md:flex-row">
        <TranslationFields
          lang="es"
          label={t({ es: "Español", en: "Spanish" })}
          value={form.translations.es}
          onChange={(v) =>
            set("translations", { ...form.translations, es: v })
          }
        />
        <TranslationFields
          lang="en"
          label={t({ es: "Inglés", en: "English" })}
          value={form.translations.en}
          onChange={(v) =>
            set("translations", { ...form.translations, en: v })
          }
        />
      </div>

      {/* Dates + Dismissible */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            {t({ es: "Inicia el", en: "Starts at" })}
          </label>
          <input
            type="datetime-local"
            className={inputCls}
            value={form.starts_at}
            onChange={(e) => set("starts_at", e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            {t({ es: "Termina el", en: "Ends at" })}
          </label>
          <input
            type="datetime-local"
            className={inputCls}
            value={form.ends_at}
            onChange={(e) => set("ends_at", e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer pb-1">
          <Toggle
            checked={form.dismissible}
            onChange={(v) => set("dismissible", v)}
          />
          <span className="text-sm text-[var(--olivea-ink)]/70">{t({ es: "Descartable", en: "Dismissible" })}</span>
        </label>
      </div>

      {/* Paths */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            {t({ es: "Rutas incluidas (separadas por comas)", en: "Include paths (comma-separated)" })}
          </label>
          <input
            className={inputCls}
            placeholder="/menu, /reservations"
            value={(form.include_paths ?? []).join(", ")}
            onChange={(e) =>
              set(
                "include_paths",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            {t({ es: "Rutas excluidas (separadas por comas)", en: "Exclude paths (comma-separated)" })}
          </label>
          <input
            className={inputCls}
            placeholder="/admin"
            value={(form.exclude_paths ?? []).join(", ")}
            onChange={(e) =>
              set(
                "exclude_paths",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          className={primaryBtn}
          disabled={saving || !form.id.trim()}
          onClick={() => onSave(form)}
        >
          {saving
            ? t(STR.saving)
            : isNew
              ? t({ es: "Crear banner", en: "Create Banner" })
              : t(STR.saveChanges)}
        </button>
        <button className={ghostBtn} onClick={onCancel}>
          {t(STR.cancel)}
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<B | null>(null);
  const { t } = useAdminLocale();

  /* ── Load banners ── */
  const load = useCallback(async () => {
    try {
      const data = await getBanners();
      setBanners((data as unknown as Banner[]) ?? []);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Handlers ── */
  const handleSave = async (draft: BannerDraft) => {
    setSaving(true);
    setActionError(null);
    try {
      // Postgres rejects "" for timestamptz — empty schedule means "always
      // on", which the DB stores as NULL. (Without this, creating a banner
      // with no dates failed with a 400 every time.)
      const row: Record<string, unknown> = {
        ...draft,
        starts_at: draft.starts_at || null,
        ends_at: draft.ends_at || null,
      };
      await saveBanner(row);
      setShowNew(false);
      setExpandedId(null);
      await load();
    } catch (err) {
      console.error("Failed to save banner", err);
      setActionError({
        es: "No se pudo guardar el banner. Inténtalo de nuevo.",
        en: "Failed to save banner. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setActionError(null);
    try {
      await deleteBanner(id);
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      console.error("Failed to delete banner", err);
      setActionError({
        es: "No se pudo eliminar el banner. Inténtalo de nuevo.",
        en: "Failed to delete banner. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    setActionError(null);
    try {
      await toggleBanner(id, enabled);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, enabled } : b))
      );
    } catch (err) {
      console.error("Failed to toggle banner", err);
      setActionError({
        es: "No se pudo activar o desactivar el banner. Inténtalo de nuevo.",
        en: "Failed to toggle banner. Please try again.",
      });
    }
  };

  /* ── Styles ── */
  const card = "rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-6";
  const primaryBtn =
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors";
  const ghostBtn =
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors";

  return (
    <SectionGuard sectionKey="content.banners">
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag size={22} className="text-[var(--olivea-olive)]" />
          <h1 className="text-lg font-semibold text-[var(--olivea-ink)]">
            {t({ es: "Banners del sitio", en: "Site Banners" })}
          </h1>
        </div>
        {!showNew && (
          <button className={primaryBtn} onClick={() => setShowNew(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} />
              {t({ es: "Nuevo banner", en: "New Banner" })}
            </span>
          </button>
        )}
      </div>

      {/* Error toast */}
      {actionError && (
        <div className="rounded-xl bg-red-50/80 ring-1 ring-red-200 px-4 py-2 text-sm text-red-700 text-center">
          {t(actionError)}
        </div>
      )}

      {/* Create new form */}
      {showNew && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-[var(--olivea-ink)] mb-5">
            {t({ es: "Crear banner", en: "Create Banner" })}
          </h2>
          <BannerForm
            draft={{ ...EMPTY_BANNER, translations: { es: { ...EMPTY_TRANSLATION }, en: { ...EMPTY_TRANSLATION } } }}
            isNew
            saving={saving}
            onSave={handleSave}
            onCancel={() => setShowNew(false)}
          />
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className={card}>
          <p className="text-sm text-[var(--olivea-clay)] text-center py-8">
            {t({ es: "Cargando banners…", en: "Loading banners..." })}
          </p>
        </div>
      ) : banners.length === 0 && !showNew ? (
        <div className={card}>
          <p className="text-sm text-[var(--olivea-clay)] text-center py-8">
            {t({
              es: 'Aún no hay banners. Haz clic en "Nuevo banner" para crear uno.',
              en: 'No banners yet. Click "New Banner" to create one.',
            })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => {
            const isExpanded = expandedId === banner.id;
            const isDeleting = confirmDeleteId === banner.id;

            return (
              <div key={banner.id} className={card}>
                {/* Summary row */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Toggle */}
                  <Toggle
                    checked={banner.enabled}
                    onChange={(v) => handleToggle(banner.id, v)}
                  />

                  {/* ID */}
                  <span className="font-mono text-sm text-[var(--olivea-ink)] font-medium min-w-[120px]">
                    {banner.id}
                  </span>

                  {/* Type badge */}
                  <TypeBadge type={banner.type} />

                  {/* Date range */}
                  <span className="text-xs text-[var(--olivea-clay)] ml-auto hidden sm:inline">
                    {formatDate(banner.starts_at)} &mdash; {formatDate(banner.ends_at)}
                  </span>

                  {/* Dismissible indicator */}
                  {banner.dismissible && (
                    <span className="text-[10px] uppercase tracking-wider text-[var(--olivea-clay)] ring-1 ring-black/8 rounded-full px-2 py-0.5">
                      {t({ es: "Descartable", en: "Dismissible" })}
                    </span>
                  )}

                  {/* Action buttons */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-white/80 transition-colors text-[var(--olivea-ink)]/50 hover:text-[var(--olivea-olive)]"
                    title={t(STR.edit)}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : banner.id)
                    }
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <Pencil size={16} />
                    )}
                  </button>

                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-[var(--olivea-ink)]/50 hover:text-red-600"
                    title={t(STR.delete)}
                    onClick={() =>
                      setConfirmDeleteId(isDeleting ? null : banner.id)
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-3">
                    <p className="text-sm text-red-600 flex-1">
                      {t({ es: "¿Eliminar el banner", en: "Delete banner" })}{" "}
                      <strong>{banner.id}</strong>
                      {t({
                        es: "? Esta acción no se puede deshacer.",
                        en: "? This cannot be undone.",
                      })}
                    </p>
                    <button
                      className="rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={saving}
                      onClick={() => handleDelete(banner.id)}
                    >
                      {saving
                        ? t({ es: "Eliminando…", en: "Deleting..." })
                        : t({ es: "Confirmar eliminación", en: "Confirm Delete" })}
                    </button>
                    <button
                      className={ghostBtn}
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      {t(STR.cancel)}
                    </button>
                  </div>
                )}

                {/* Expanded edit form */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-black/5">
                    <BannerForm
                      draft={{
                        id: banner.id,
                        type: banner.type,
                        enabled: banner.enabled,
                        dismissible: banner.dismissible,
                        starts_at: banner.starts_at ?? "",
                        ends_at: banner.ends_at ?? "",
                        translations: banner.translations ?? {
                          es: { ...EMPTY_TRANSLATION },
                          en: { ...EMPTY_TRANSLATION },
                        },
                        include_paths: banner.include_paths ?? [],
                        exclude_paths: banner.exclude_paths ?? [],
                      }}
                      isNew={false}
                      saving={saving}
                      onSave={handleSave}
                      onCancel={() => setExpandedId(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </SectionGuard>
  );
}
