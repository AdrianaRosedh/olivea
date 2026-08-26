"use client";

import { useEffect, useState, useCallback } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import ImageUpload from "@/components/admin/ImageUpload";
import VideoUpload from "@/components/admin/VideoUpload";
import { Bell, Plus, Pencil, Trash2, ChevronUp, X } from "lucide-react";
import { getPopups, savePopup, deletePopup, togglePopup } from "@/lib/supabase/actions";
import type { PopupItem, PopupFrequency } from "@/lib/content/types";
import { useAdminLocale, STR, type B } from "@/lib/admin/i18n";
import { useConfirm } from "@/components/admin/ConfirmDialog";

/* ─── Helpers ─── */

const EMPTY_TRANSLATION = { badge: "", title: "", excerpt: "", href: "", ctaLabel: "" };

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
    media: { coverSrc: "", coverAlt: { es: "", en: "" }, videoSrc: "" },
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

/* ─── Live Preview ─── */
/* Mirrors the real popup card in components/ui/popup/PopupHost.tsx so editors
   see exactly what ships (incl. the rule that covers only show for "journal"
   kind and the default "Nuevo/New" badge). Static — no entrance animation. */

function PopupPreview({ form }: { form: PopupItem }) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [imgOk, setImgOk] = useState(true);
  const { t: tr } = useAdminLocale();

  const t = form.translations[lang];
  const badge = (t.badge || "").trim() || (lang === "es" ? "Nuevo" : "New");
  const title = (t.title || "").trim();
  const excerpt = (t.excerpt || "").trim();
  const href = (t.href || "").trim();
  // An action shows a button whether or not a link was filled in, and it is
  // what the card will actually do — so the preview has to follow the same
  // precedence the popup uses, or it stops being a preview.
  const hasPrimary = Boolean(form.action) || Boolean(href);
  // Mirrors the shipped defaults: a booking names its venue, journal popups
  // read, everything else learns more.
  const ctaLabel =
    (t.ctaLabel || "").trim() ||
    (form.action === "hotel"
      ? lang === "es" ? "Reservar hospedaje" : "Book a stay"
      : form.action === "restaurant"
        ? lang === "es" ? "Reservar mesa" : "Book a table"
        : form.action === "cafe"
          ? lang === "es" ? "Reservar en el café" : "Book at the café"
          : form.kind === "journal"
            ? lang === "es" ? "Leer" : "Read"
            : lang === "es" ? "Ver más" : "Learn more");
  // The real card only renders a cover for "journal" kind.
  const coverSrc = (form.media?.coverSrc || "").trim();
  const videoSrc = (form.media?.videoSrc || "").trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider">
          {tr({ es: "Vista previa", en: "Live preview" })}
        </span>
        <div className="inline-flex rounded-full bg-white/70 ring-1 ring-black/10 p-0.5 text-[11px] font-semibold">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 uppercase tracking-wider transition-colors ${
                lang === l
                  ? "bg-[var(--olivea-olive)] text-white"
                  : "text-[var(--olivea-ink)]/55 hover:text-[var(--olivea-ink)]/80"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Preview canvas */}
      <div className="rounded-2xl bg-black/[0.02] ring-1 ring-black/5 p-4">
        <div className="overflow-hidden rounded-[24px] bg-[var(--olivea-cream)] ring-1 ring-[var(--olivea-olive)]/15 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.4)]">
          {/* Header: badge + (decorative) close */}
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="text-[11px] uppercase tracking-[0.34em] text-[var(--olivea-olive)] opacity-90">
              {badge}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[var(--olivea-olive)] ring-1 ring-[var(--olivea-olive)]/15">
              <X size={15} strokeWidth={1.75} />
            </span>
          </div>

          <div className="px-5 pb-5">
            {/* Matches the shipped card: the loop wins when one is set, the
                cover is its poster, and the cover shows on its own otherwise. */}
            {videoSrc ? (
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black/5 ring-1 ring-[var(--olivea-olive)]/10">
                <video
                  src={videoSrc}
                  poster={coverSrc || undefined}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            ) : coverSrc && imgOk ? (
              <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-black/5 ring-1 ring-[var(--olivea-olive)]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrc}
                  alt=""
                  onError={() => setImgOk(false)}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl bg-[var(--olivea-cream)] px-4 py-4 ring-1 ring-[var(--olivea-olive)]/10">
              <h3 className="text-[20px] font-semibold leading-tight text-[var(--olivea-olive)]">
                {title || (
                  <span className="opacity-30">
                    {lang === "es" ? "Título del popup" : "Popup title"}
                  </span>
                )}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--olivea-clay)]">
                {excerpt || (
                  <span className="opacity-30">
                    {lang === "es" ? "Texto del popup…" : "Popup body text…"}
                  </span>
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {hasPrimary ? (
                  <span className="inline-flex items-center justify-center rounded-xl bg-[var(--olivea-olive)] px-4 py-2.5 text-[11px] uppercase tracking-[0.28em] text-white">
                    {ctaLabel}
                  </span>
                ) : null}
                {form.phone ? (
                  <span className="inline-flex items-center justify-center rounded-xl bg-white/70 px-4 py-2.5 text-[11px] tracking-[0.08em] text-[var(--olivea-olive)] ring-1 ring-[var(--olivea-olive)]/25">
                    {form.phone}
                  </span>
                ) : null}
                <span className="inline-flex items-center justify-center rounded-xl bg-white/70 px-4 py-2.5 text-[11px] uppercase tracking-[0.28em] text-[var(--olivea-olive)] ring-1 ring-[var(--olivea-olive)]/10">
                  {lang === "es" ? "Ahora no" : "Not now"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--olivea-ink)]/50">
        {form.kind === "announcement"
          ? tr({
              es: "Los anuncios ahora muestran portada o video, igual que las ventanas tipo Cuaderno. ",
              en: "Announcements now show a cover or a video, the same as journal popups. ",
            })
          : tr({
              es: "Las ventanas tipo Cuaderno muestran la imagen de portada arriba. ",
              en: "Journal popups show the cover image above. ",
            })}
        {tr({
          es: "Solo aparece en el sitio la ventana activa de mayor prioridad.",
          en: "Only the highest-priority enabled popup appears on the site.",
        })}
      </p>
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
  const { t } = useAdminLocale();

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
      media: { coverSrc: "", coverAlt: { es: "", en: "" }, videoSrc: "", ...prev.media, ...patch },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
      {/* ── Identity ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            {t({ es: "ID (slug)", en: "ID (slug)" })}
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
            {t({ es: "Tipo", en: "Kind" })}
          </label>
          <select
            value={form.kind}
            onChange={(e) => updateField("kind", e.target.value as PopupItem["kind"])}
            className={inputClass}
          >
            <option value="journal">{t({ es: "Cuaderno", en: "Journal" })}</option>
            <option value="announcement">{t({ es: "Anuncio", en: "Announcement" })}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            {t({ es: "Prioridad", en: "Priority" })}
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
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">{t({ es: "Traducciones", en: "Translations" })}</h4>
        <BilingualInput
          label={t({ es: "Insignia", en: "Badge" })}
          esValue={form.translations.es.badge}
          enValue={form.translations.en.badge}
          onEsChange={(v) => updateTranslation("es", "badge", v)}
          onEnChange={(v) => updateTranslation("en", "badge", v)}
        />
        <BilingualInput
          label={t({ es: "Título", en: "Title" })}
          esValue={form.translations.es.title}
          enValue={form.translations.en.title}
          onEsChange={(v) => updateTranslation("es", "title", v)}
          onEnChange={(v) => updateTranslation("en", "title", v)}
        />
        <BilingualInput
          label={t({ es: "Extracto", en: "Excerpt" })}
          esValue={form.translations.es.excerpt}
          enValue={form.translations.en.excerpt}
          onEsChange={(v) => updateTranslation("es", "excerpt", v)}
          onEnChange={(v) => updateTranslation("en", "excerpt", v)}
          textarea
        />
        <BilingualInput
          label={t({ es: "Enlace (href)", en: "Link (href)" })}
          esValue={form.translations.es.href ?? ""}
          enValue={form.translations.en.href ?? ""}
          onEsChange={(v) => updateTranslation("es", "href", v)}
          onEnChange={(v) => updateTranslation("en", "href", v)}
        />
        {/* The button used to always read "Leer"/"Read" — correct for a
            journal post, nonsense on an offer. Blank keeps the default. */}
        <BilingualInput
          label={t({ es: "Texto del botón (opcional)", en: "Button label (optional)" })}
          esValue={form.translations.es.ctaLabel ?? ""}
          enValue={form.translations.en.ctaLabel ?? ""}
          onEsChange={(v) => updateTranslation("es", "ctaLabel", v)}
          onEnChange={(v) => updateTranslation("en", "ctaLabel", v)}
        />
      </div>

      {/* ── What the button does ──
          Separate from Translations because the venue is not language
          specific — only the label on the button is. */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">
          {t({ es: "Acción del botón", en: "Button action" })}
        </h4>
        <select
          value={form.action ?? ""}
          onChange={(e) =>
            updateField("action", (e.target.value || undefined) as PopupItem["action"])
          }
          className={inputClass}
        >
          <option value="">{t({ es: "Ir al enlace", en: "Go to the link" })}</option>
          <option value="hotel">
            {t({ es: "Abrir reservación · Casa Olivea", en: "Open booking · Casa Olivea" })}
          </option>
          <option value="restaurant">
            {t({ es: "Abrir reservación · Restaurante", en: "Open booking · Restaurant" })}
          </option>
          <option value="cafe">
            {t({ es: "Abrir reservación · Café", en: "Open booking · Café" })}
          </option>
        </select>
        <div className="pt-1">
          <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
            {t({ es: "Teléfono (opcional)", en: "Phone (optional)" })}
          </label>
          <input
            value={form.phone ?? ""}
            onChange={(e) => updateField("phone", e.target.value || undefined)}
            placeholder="+52 (646) 388 2369"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--olivea-ink)]/60">
            {t({
              es: "Añade un botón para llamar. Escríbelo como quieras que se lea — el enlace usa solo los dígitos. Mejor aquí que dentro del texto: en el teléfono es un toque en vez de copiarlo a mano.",
              en: "Adds a call button. Write it how you want it read — the link uses only the digits. Better here than inside the body text: on a phone it becomes one tap instead of copying it by hand.",
            })}
          </p>
        </div>

        <p className="text-[11px] leading-relaxed text-[var(--olivea-ink)]/60">
          {form.action
            ? t({
                es: "El botón abre la reservación en la misma página. El enlace de arriba se ignora, y si dejas el texto del botón vacío dirá «Reservar hospedaje».",
                en: "The button opens the booking on the same page. The link above is ignored, and leaving the button text empty reads “Book a stay”.",
              })
            : t({
                es: "El botón lleva al enlace de arriba. Elige una reservación si prefieres que abra el calendario sin salir de la página.",
                en: "The button follows the link above. Pick a booking if you would rather it open the calendar without leaving the page.",
              })}
        </p>
      </div>

      {/* ── Media ── */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">{t({ es: "Medios", en: "Media" })}</h4>
        {/* Drop a file in rather than typing a path. Asking someone to know
            where an image lives on the server is asking them to already have
            uploaded it somewhere else first. */}
        <ImageUpload
          value={form.media?.coverSrc ?? ""}
          onChange={(url) => updateMedia({ coverSrc: url })}
          folder="popups"
          label={t({ es: "Imagen de portada", en: "Cover Image" })}
          hint={t({
            es: "Arrastra una imagen o haz clic para elegir un archivo. Se optimiza automáticamente.",
            en: "Drag an image here or click to choose a file. It is optimised automatically.",
          })}
        />
        <VideoUpload
          value={form.media?.videoSrc ?? ""}
          onChange={(url) => updateMedia({ videoSrc: url })}
          folder="popups"
          label={t({ es: "Video en bucle (opcional)", en: "Looping video (optional)" })}
          hint={t({
            es: "Se reproduce en silencio y en bucle, en lugar de la portada. La portada sigue usándose como primer cuadro y para quien pide menos movimiento.",
            en: "Plays silently on a loop in place of the cover. The cover is still used as the first frame, and for anyone who asks for reduced motion.",
          })}
        />

        <BilingualInput
          label={t({ es: "Texto alternativo de portada", en: "Cover Alt Text" })}
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
        <h4 className="text-sm font-semibold text-[var(--olivea-ink)]">{t({ es: "Reglas de visualización", en: "Display Rules" })}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
              {t({ es: "Inicia el", en: "Starts At" })}
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
              {t({ es: "Termina el", en: "Ends At" })}
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
            {t({ es: "Frecuencia", en: "Frequency" })}
          </label>
          <select
            value={form.rules.frequency}
            onChange={(e) => updateRules({ frequency: e.target.value as PopupFrequency })}
            className={inputClass + " max-w-xs"}
          >
            <option value="onceEver">{t({ es: "Una sola vez", en: "Once Ever" })}</option>
            <option value="oncePerPopupId">{t({ es: "Una vez por ventana", en: "Once Per Popup" })}</option>
            <option value="oncePerDays">{t({ es: "Una vez cada N días", en: "Once Per N Days" })}</option>
          </select>
        </div>
        {form.rules.frequency === "oncePerDays" && (
          <div>
            <label className="block text-xs font-medium text-[var(--olivea-ink)]/70 uppercase tracking-wider mb-1">
              {t({ es: "Días", en: "Days" })}
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
            {t({ es: "Rutas incluidas (separadas por comas)", en: "Include Paths (comma-separated)" })}
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
            {t({ es: "Rutas excluidas (separadas por comas)", en: "Exclude Paths (comma-separated)" })}
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
          {saving ? t(STR.saving) : t({ es: "Guardar ventana", en: "Save Popup" })}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors"
        >
          {t(STR.cancel)}
        </button>
      </div>
    </form>
      <div className="lg:sticky lg:top-4">
        <PopupPreview form={form} />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function PopupsPage() {
  const confirm = useConfirm();
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<B | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { t } = useAdminLocale();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getPopups();
      setPopups((data as unknown as PopupItem[]) ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? { es: err.message, en: err.message }
          : { es: "No se pudieron cargar las ventanas", en: "Failed to load popups" }
      );
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
      setError(
        err instanceof Error
          ? { es: err.message, en: err.message }
          : { es: "No se pudo guardar la ventana", en: "Failed to save popup" }
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      tone: "danger",
      title: { es: `¿Eliminar la ventana "${id}"?`, en: `Delete popup "${id}"?` },
      body: { es: "Esta acción no se puede deshacer.", en: "This cannot be undone." },
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      await deletePopup(id);
      if (expandedId === id) setExpandedId(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? { es: err.message, en: err.message }
          : { es: "No se pudo eliminar la ventana", en: "Failed to delete popup" }
      );
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
      setError(
        err instanceof Error
          ? { es: err.message, en: err.message }
          : { es: "No se pudo cambiar el estado de la ventana", en: "Failed to toggle popup" }
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <SectionGuard sectionKey="content.popups">
    <div className="max-w-5xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-[var(--olivea-olive)]" />
          <h1 className="text-lg font-semibold text-[var(--olivea-ink)]">
            {t({ es: "Ventanas emergentes del sitio", en: "Site Popups" })}
          </h1>
          <span className="text-xs text-[var(--olivea-clay)]">
            {popups.length}{" "}
            {t(
              popups.length === 1
                ? { es: "ventana", en: "popup" }
                : { es: "ventanas", en: "popups" }
            )}
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
          {t({ es: "Nueva ventana", en: "New Popup" })}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl bg-red-50/80 backdrop-blur-md ring-1 ring-red-200/60 shadow-sm p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{t(error)}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            {t({ es: "Descartar", en: "Dismiss" })}
          </button>
        </div>
      )}

      {/* ── Create form ── */}
      {creating && (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-6">
          <h2 className="text-lg font-semibold text-[var(--olivea-ink)] mb-4">
            {t({ es: "Crear nueva ventana", en: "Create New Popup" })}
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
          <p className="mt-3 text-sm text-[var(--olivea-clay)]">{t({ es: "Cargando ventanas…", en: "Loading popups..." })}</p>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && popups.length === 0 && !error && (
        <div className="rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-12 text-center">
          <Bell size={32} className="mx-auto text-[var(--olivea-clay)]/30 mb-3" />
          <p className="text-sm text-[var(--olivea-clay)]">
            {t({ es: "Aún no hay ventanas configuradas. Crea la primera arriba.", en: "No popups configured yet. Create your first one above." })}
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
                        {t(
                          popup.kind === "journal"
                            ? { es: "Cuaderno", en: "Journal" }
                            : { es: "Anuncio", en: "Announcement" }
                        )}
                      </span>
                      {!popup.enabled && (
                        <span className="text-[10px] text-[var(--olivea-clay)]/60 uppercase tracking-wider">
                          {t({ es: "Desactivado", en: "Disabled" })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-[var(--olivea-clay)]">
                      <span>{t({ es: "Prioridad", en: "Priority" })}: {popup.priority ?? "--"}</span>
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
                      title={isExpanded ? t({ es: "Contraer", en: "Collapse" }) : t(STR.edit)}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <Pencil size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(popup.id)}
                      disabled={deletingId === popup.id}
                      className="rounded-full p-2 text-[var(--olivea-clay)] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title={t(STR.delete)}
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
    </SectionGuard>
  );
}
