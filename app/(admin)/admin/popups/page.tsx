"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Plus, Pencil, Trash2, ChevronUp } from "lucide-react";
import { getPopups, savePopup, deletePopup, togglePopup } from "@/lib/supabase/actions";
import type { PopupItem, PopupFrequency } from "@/lib/content/types";

/* ─── Helpers ─── */

const EMPTY_TRANSLATION = { badge: "", title: "", excerpt: "", href: "" };

function emptyPopup(): PopupItem {
  return {
    id: "",
    enabled: false,
    kind: "announcement",
    priority: 100,
    translations: {
      es: { ...EMPTY_TRANSLATION },
      en: { ...EMPTY_TRANSLATION },
    },
    media: { coverSrc: "", coverAlt: { es: "", en: "" } },
    rules: {
      startsAt: "",
      endsAt: "",
      frequency: "oncePerPopupId",
      includePaths: ["/*"],
      excludePaths: [],
    },
  };
}

function formatDate(iso: string) {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ─── Toggle Switch ─── */

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[var(--olivea-olive)]/40 focus:ring-offset-2
        ${checked ? "bg-[var(--olivea-olive)]" : "bg-black/15"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

/* ─── Bilingual Input Pair ─── */

function BilingualInput({
  label,
  esValue,
  enValue,
  onEsChange,
  onEnChange,
  textarea,
}: {
  label: string;
  esValue: string;
  enValue: string;
  onEsChange: (v: string) => void;
  onEnChange: (v: string) => void;
  textarea?: boolean;
}) {
  const inputClass =
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full";
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] font-semibold text-[var(--olivea-clay)] uppercase tracking-widest mb-1 block">
            ES
          </span>
          {textarea ? (
            <textarea
              value={esValue}
              onChange={(e) => onEsChange(e.target.value)}
              rows={3}
              className={inputClass + " resize-y"}
            />
          ) : (
            <input
              type="text"
              value={esValue}
              onChange={(e) => onEsChange(e.target.value)}
              className={inputClass}
            />
          )}
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[var(--olivea-clay)] uppercase tracking-widest mb-1 block">
            EN
          </span>
          {textarea ? (
            <textarea
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              rows={3}
              className={inputClass + " resize-y"}
            />
          ) : (
            <input
              type="text"
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              className={inputClass}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Popup Form ─── */

function PopupForm({
  popup,
  onSave,
  onCancel,
  saving,
}: {
  popup: PopupItem;
  onSave: (p: PopupItem) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<PopupItem>(popup);

  const inputClass =
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full";

  function updateField<K extends keyof PopupItem>(key: K, val: PopupItem[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function updateTranslation(
    lang: "es" | "en",
    field: string,
    val: string
  ) {
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], [field]: val },
      },
    }));
  }

  function updateRules(patch: Partial<PopupItem["rules"]>) {
    setForm((prev) => ({
      ...prev,
      rules: { ...prev.rules, ...patch },
    }));
  }

  function updateMedia(patch: Partial<NonNullable<PopupItem["media"]>>) {
    setForm((prev) => ({
      ...prev,
      media: { coverSrc: "", coverAlt: { es: "", en: "" }, ...prev.media, ...patch },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Identity ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            ID (slug)
          </label>
          <input
            type="text"
            required
            value={form.id}
            onChange={(e) => updateField("id", e.target.value)}
            placeholder="popup-2026-04-spring-menu"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            Kind
          </label>
          <select
            value={form.kind}
            onChange={(e) => updateField("kind", e.target.value as PopupItem["kind"])}
            className={inputClass}
          >
            <option value="journal">Journal</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            Priority
          </label>
          <input
            type="number"
            value={form.priority ?? 100}
            onChange={(e) => updateField("priority", parseInt(e.target.value, 10) || 0)}
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Translations ── */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">Translations</h4>
        <BilingualInput
          label="Badge"
          esValue={form.translations.es.badge}
          enValue={form.translations.en.badge}
          onEsChange={(v) => updateTranslation("es", "badge", v)}
          onEnChange={(v) => updateTranslation("en", "badge", v)}
        />
        <BilingualInput
          label="Title"
          esValue={form.translations.es.title}
          enValue={form.translations.en.title}
          onEsChange={(v) => updateTranslation("es", "title", v)}
          onEnChange={(v) => updateTranslation("en", "title", v)}
        />
        <BilingualInput
          label="Excerpt"
          esValue={form.translations.es.excerpt}
          enValue={form.translations.en.excerpt}
          onEsChange={(v) => updateTranslation("es", "excerpt", v)}
          onEnChange={(v) => updateTranslation("en", "excerpt", v)}
          textarea
        />
        <BilingualInput
          label="Link (href)"
          esValue={form.translations.es.href ?? ""}
          enValue={form.translations.en.href ?? ""}
          onEsChange={(v) => updateTranslation("es", "href", v)}
          onEnChange={(v) => updateTranslation("en", "href", v)}
        />
      </div>

      {/* ── Media ── */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">Media</h4>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            Cover Image Source
          </label>
          <input
            type="text"
            value={form.media?.coverSrc ?? ""}
            onChange={(e) => updateMedia({ coverSrc: e.target.value })}
            placeholder="/images/journal/example/cover.jpg"
            className={inputClass}
          />
        </div>
        <BilingualInput
          label="Cover Alt Text"
          esValue={form.media?.coverAlt?.es ?? ""}
          enValue={form.media?.coverAlt?.en ?? ""}
          onEsChange={(v) =>
            updateMedia({ coverAlt: { es: v, en: form.media?.coverAlt?.en ?? "" } })
          }
          onEnChange={(v) =>
            updateMedia({ coverAlt: { es: form.media?.coverAlt?.es ?? "", en: v } })
          }
        />
      </div>

      {/* ── Rules ── */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">Display Rules</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
              Starts At
            </label>
            <input
              type="datetime-local"
              value={form.rules.startsAt ? form.rules.startsAt.slice(0, 16) : ""}
              onChange={(e) => updateRules({ startsAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
              Ends At
            </label>
            <input
              type="datetime-local"
              value={form.rules.endsAt ? form.rules.endsAt.slice(0, 16) : ""}
              onChange={(e) => updateRules({ endsAt: e.target.value ? new Date(e.target.value).toISOString() : "" })}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            Frequency
          </label>
          <select
            value={form.rules.frequency}
            onChange={(e) => updateRules({ frequency: e.target.value as PopupFrequency })}
            className={inputClass + " max-w-xs"}
          >
            <option value="onceEver">Once Ever</option>
            <option value="oncePerPopupId">Once Per Popup</option>
            <option value="oncePerDays">Once Per N Days</option>
          </select>
        </div>
        {form.rules.frequency === "oncePerDays" && (
          <div>
            <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
              Days
            </label>
            <input
              type="number"
              min={1}
              value={form.rules.days ?? 7}
              onChange={(e) => updateRules({ days: parseInt(e.target.value, 10) || 7 })}
              className={inputClass + " max-w-[120px]"}
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            Include Paths (comma-separated)
          </label>
          <input
            type="text"
            value={form.rules.includePaths.join(", ")}
            onChange={(e) =>
              updateRules({
                includePaths: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="/*"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            Exclude Paths (comma-separated)
          </label>
          <input
            type="text"
            value={form.rules.excludePaths.join(", ")}
            onChange={(e) =>
              updateRules({
                excludePaths: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="/es/journal/*, /en/journal/*"
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.id}
          className="rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save Popup"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Main Page ─── */

export default function PopupsPage() {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getPopups();
      setPopups((data as unknown as PopupItem[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load popups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(popup: PopupItem) {
    setSaving(true);
    try {
      await savePopup(popup as unknown as Record<string, unknown>);
      setCreating(false);
      setExpandedId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save popup");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Delete popup "${id}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePopup(id);
      if (expandedId === id) setExpandedId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete popup");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    setTogglingId(id);
    try {
      await togglePopup(id, enabled);
      setPopups((prev) =>
        prev.map((p) => (p.id === id ? { ...p, enabled } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle popup");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-[var(--olivea-olive)]" />
          <h1 className="text-lg font-semibold text-[var(--olivea-ink)]">
            Site Popups
          </h1>
          <span className="text-xs text-[var(--olivea-clay)]">
            {popups.length} popup{popups.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => {
            setCreating(true);
            setExpandedId(null);
          }}
          className="flex items-center gap-2 rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors"
        >
          <Plus size={14} />
          New Popup
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl bg-red-50/80 backdrop-blur-md ring-1 ring-red-200/60 shadow-sm p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Create form ── */}
      {creating && (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-6">
          <h2 className="text-lg font-semibold text-[var(--olivea-ink)] mb-4">
            Create New Popup
          </h2>
          <PopupForm
            popup={emptyPopup()}
            onSave={handleSave}
            onCancel={() => setCreating(false)}
            saving={saving}
          />
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--olivea-olive)] border-r-transparent" />
          <p className="mt-3 text-sm text-[var(--olivea-clay)]">Loading popups...</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && popups.length === 0 && !error && (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-12 text-center">
          <Bell size={32} className="mx-auto text-[var(--olivea-clay)]/30 mb-3" />
          <p className="text-sm text-[var(--olivea-clay)]">
            No popups configured yet. Create your first one above.
          </p>
        </div>
      )}

      {/* ── Popup list ── */}
      {!loading && popups.length > 0 && (
        <div className="space-y-3">
          {popups.map((popup) => {
            const isExpanded = expandedId === popup.id;
            return (
              <div
                key={popup.id}
                className="rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg overflow-hidden"
              >
                {/* ── Row summary ── */}
                <div className="flex items-center gap-4 px-6 py-4">
                  {/* Toggle */}
                  <Toggle
                    checked={popup.enabled}
                    onChange={(v) => handleToggle(popup.id, v)}
                    disabled={togglingId === popup.id}
                  />

                  {/* Info */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedId(isExpanded ? null : popup.id);
                      setCreating(false);
                    }}
                    className="flex-1 text-left min-w-0 group"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--olivea-ink)] truncate">
                        {popup.translations.es.title || popup.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          popup.kind === "journal"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60"
                        }`}
                      >
                        {popup.kind}
                      </span>
                      {!popup.enabled && (
                        <span className="text-[10px] text-[var(--olivea-clay)]/60 uppercase tracking-wider">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[var(--olivea-clay)]">
                      <span>Priority: {popup.priority ?? "--"}</span>
                      <span>
                        {formatDate(popup.rules.startsAt)} - {formatDate(popup.rules.endsAt)}
                      </span>
                      <span className="truncate max-w-[200px] opacity-60">
                        id: {popup.id}
                      </span>
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedId(isExpanded ? null : popup.id);
                        setCreating(false);
                      }}
                      className="rounded-full p-2 text-[var(--olivea-clay)] hover:bg-white/60 hover:text-[var(--olivea-ink)] transition-colors"
                      title={isExpanded ? "Collapse" : "Edit"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <Pencil size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(popup.id)}
                      disabled={deletingId === popup.id}
                      className="rounded-full p-2 text-[var(--olivea-clay)] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* ── Expanded edit form ── */}
                {isExpanded && (
                  <div className="border-t border-black/5 px-6 py-6 bg-white/30">
                    <PopupForm
                      popup={popup}
                      onSave={handleSave}
                      onCancel={() => setExpandedId(null)}
                      saving={saving}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
