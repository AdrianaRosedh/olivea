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
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_BADGE[type] ?? TYPE_BADGE.notice}`}
    >
      {type}
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
  const inputCls =
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full";

  return (
    <fieldset className="flex-1 space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-widest text-[var(--olivea-clay)] mb-2">
        {label} ({lang.toUpperCase()})
      </legend>
      <input
        className={inputCls}
        placeholder="Banner text"
        value={value.text}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
      />
      <div className="flex gap-3">
        <input
          className={inputCls}
          placeholder="CTA label"
          value={value.ctaLabel}
          onChange={(e) => onChange({ ...value, ctaLabel: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="CTA href"
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
            placeholder="e.g. summer-2026"
            value={form.id}
            onChange={(e) => set("id", e.target.value)}
            disabled={!isNew}
          />
        </div>
        <div className="w-44">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            Type
          </label>
          <select
            className={inputCls}
            value={form.type}
            onChange={(e) => set("type", e.target.value as Banner["type"])}
          >
            <option value="notice">Notice</option>
            <option value="promo">Promo</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      {/* Translations: ES / EN side by side */}
      <div className="flex gap-6 flex-col md:flex-row">
        <TranslationFields
          lang="es"
          label="Spanish"
          value={form.translations.es}
          onChange={(v) =>
            set("translations", { ...form.translations, es: v })
          }
        />
        <TranslationFields
          lang="en"
          label="English"
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
            Starts at
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
            Ends at
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
          <span className="text-sm text-[var(--olivea-ink)]/70">Dismissible</span>
        </label>
      </div>

      {/* Paths */}
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <label className="text-xs font-medium text-[var(--olivea-ink)]/70 mb-1 block">
            Include paths (comma-separated)
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
            Exclude paths (comma-separated)
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
          {saving ? "Saving..." : isNew ? "Create Banner" : "Save Changes"}
        </button>
        <button className={ghostBtn} onClick={onCancel}>
          Cancel
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
  const [actionError, setActionError] = useState<string | null>(null);

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
      await saveBanner(draft as unknown as Record<string, unknown>);
      setShowNew(false);
      setExpandedId(null);
      await load();
    } catch (err) {
      console.error("Failed to save banner", err);
      setActionError("Failed to save banner. Please try again.");
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
      setActionError("Failed to delete banner. Please try again.");
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
      setActionError("Failed to toggle banner. Please try again.");
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
            Site Banners
          </h1>
        </div>
        {!showNew && (
          <button className={primaryBtn} onClick={() => setShowNew(true)}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} />
              New Banner
            </span>
          </button>
        )}
      </div>

      {/* Error toast */}
      {actionError && (
        <div className="rounded-xl bg-red-50/80 ring-1 ring-red-200 px-4 py-2 text-sm text-red-700 text-center">
          {actionError}
        </div>
      )}

      {/* Create new form */}
      {showNew && (
        <div className={card}>
          <h2 className="text-lg font-semibold text-[var(--olivea-ink)] mb-5">
            Create Banner
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
            Loading banners...
          </p>
        </div>
      ) : banners.length === 0 && !showNew ? (
        <div className={card}>
          <p className="text-sm text-[var(--olivea-clay)] text-center py-8">
            No banners yet. Click &quot;New Banner&quot; to create one.
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
                      Dismissible
                    </span>
                  )}

                  {/* Action buttons */}
                  <button
                    className="p-1.5 rounded-lg hover:bg-white/80 transition-colors text-[var(--olivea-ink)]/50 hover:text-[var(--olivea-olive)]"
                    title="Edit"
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
                    title="Delete"
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
                      Delete banner <strong>{banner.id}</strong>? This cannot be
                      undone.
                    </p>
                    <button
                      className="rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={saving}
                      onClick={() => handleDelete(banner.id)}
                    >
                      {saving ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      className={ghostBtn}
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
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
