"use client";

// ─────────────────────────────────────────────────────────────────────
// Menus & Links — the live menu embeds, editable without a deploy.
//
// What this edits (both live in Supabase, read by the public site):
//   • farmtotable_content.sections → [id="menu"].menuTabs[]
//       The Farmpop tabs on /farmtotable: Menu, Pairing, Wine, Spirits…
//       Each tab = bilingual label + an embed URL (Canva or roseiies).
//   • cafe_content.sections → [id="menu"].farmpop
//       The single "Live menu" link on /cafe.
//
// Saves go through savePageContent (role-guarded server action) which
// also revalidates the public pages and pings IndexNow.
// ─────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  UtensilsCrossed,
  Coffee,
  Save,
  Loader2,
  RefreshCw,
  Undo2,
  ExternalLink,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Link2,
} from "lucide-react";
import SectionGuard from "@/components/admin/SectionGuard";
import { getPageContent, savePageContent } from "@/lib/supabase/actions";
import { useAuth } from "@/components/admin/AuthProvider";
import { useAdminLocale, STR } from "@/lib/admin/i18n";

/* ── Types ────────────────────────────────────────────────────────── */

type Bilingual = { es: string; en: string };

interface MenuTab {
  id: string;
  label: Bilingual;
  canvaUrl: string;
  [key: string]: unknown; // preserve unknown fields
}

interface CafeFarmpop {
  title?: Bilingual;
  label?: Bilingual;
  canvaUrl?: string;
  [key: string]: unknown;
}

type Row = Record<string, unknown>;

interface SectionShape {
  id?: string;
  [key: string]: unknown;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function sectionsOf(row: Row): SectionShape[] {
  return Array.isArray(row.sections) ? (row.sections as SectionShape[]) : [];
}

function menuSectionOf(row: Row): SectionShape | undefined {
  return sectionsOf(row).find((s) => s.id === "menu");
}

/** Immutably replace (or create) the menu section with `patch` merged in. */
function withMenuPatch(row: Row, patch: Record<string, unknown>): Row {
  const sections = sectionsOf(row);
  const idx = sections.findIndex((s) => s.id === "menu");
  const next = [...sections];
  if (idx >= 0) next[idx] = { ...next[idx], ...patch };
  else next.push({ id: "menu", ...patch });
  return { ...row, sections: next };
}

function isValidEmbedUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

const bi = (v: unknown): Bilingual => {
  const o = (v ?? {}) as Partial<Bilingual>;
  return { es: o.es ?? "", en: o.en ?? "" };
};

/* ── Small building blocks (match the visual-editor design language) ─ */

function CardHeader({
  icon,
  title,
  hint,
  liveHref,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  liveHref: string;
}) {
  const { t } = useAdminLocale();
  return (
    <div className="px-5 py-4 border-b border-stone-200/60 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/[0.08] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--olivea-ink)]">{title}</h2>
          <p className="text-[11px] text-[var(--olivea-clay)] truncate">{hint}</p>
        </div>
      </div>
      <a
        href={liveHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold hover:bg-stone-200 transition-colors shrink-0"
      >
        <ExternalLink className="w-3 h-3" />
        {t(STR.viewLive)}
      </a>
    </div>
  );
}

function LangInput({
  lang,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  lang: "es" | "en";
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider text-stone-400 pointer-events-none">
        {lang}
      </span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-stone-300 bg-white/70 text-stone-800 focus:ring-1 focus:ring-[var(--olivea-olive)] focus:border-[var(--olivea-olive)] outline-none disabled:bg-stone-50 disabled:text-stone-400 transition-colors"
      />
    </div>
  );
}

function UrlInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const { t } = useAdminLocale();
  const valid = isValidEmbedUrl(value);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="relative flex-1 min-w-0">
        <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        <input
          type="url"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="https://…"
          spellCheck={false}
          className={`w-full text-xs font-mono pl-8 pr-3 py-2 rounded-lg border bg-white/70 text-stone-700 focus:ring-1 outline-none disabled:bg-stone-50 disabled:text-stone-400 transition-colors ${
            valid || !value
              ? "border-stone-300 focus:ring-[var(--olivea-olive)] focus:border-[var(--olivea-olive)]"
              : "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/40"
          }`}
        />
      </div>
      <a
        href={valid ? value : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!valid}
        title={valid ? t({ es: "Abrir enlace", en: "Open link" }) : t({ es: "Escribe una URL https:// válida", en: "Enter a valid https:// URL" })}
        className={`p-2 rounded-lg border transition-colors shrink-0 ${
          valid
            ? "border-stone-300 text-stone-500 hover:bg-stone-100"
            : "border-stone-200 text-stone-300 pointer-events-none"
        }`}
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

function MenusAndLinks() {
  const { canEdit } = useAuth();
  const { t } = useAdminLocale();

  const [ftt, setFtt] = useState<Row | null>(null);
  const [cafe, setCafe] = useState<Row | null>(null);
  const [origFtt, setOrigFtt] = useState("");
  const [origCafe, setOrigCafe] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loadNote, setLoadNote] = useState<{ es: string; en: string } | null>(null);
  const [newTabCount, setNewTabCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadNote(null);
    try {
      const [fttRow, cafeRow] = await Promise.all([
        getPageContent("farmtotable_content"),
        getPageContent("cafe_content"),
      ]);
      const clean = (r: unknown): Row => {
        const { id: _id, updated_at: _u, ...rest } = (r ?? {}) as Row;
        return rest;
      };
      if (fttRow) {
        const c = clean(fttRow);
        setFtt(c);
        setOrigFtt(JSON.stringify(c));
      } else {
        setFtt(null);
        setLoadNote({ es: "No se pudo cargar el contenido en vivo — revisa la conexión y recarga.", en: "Could not load live content — check the connection and reload." });
      }
      if (cafeRow) {
        const c = clean(cafeRow);
        setCafe(c);
        setOrigCafe(JSON.stringify(c));
      }
    } catch (err) {
      console.error("Load failed:", err);
      setFtt(null);
      setCafe(null);
      setLoadNote({ es: "No se pudo cargar el contenido en vivo — revisa la conexión y recarga.", en: "Could not load live content — check the connection and reload." });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Derived state ── */

  const tabs = useMemo(
    () => (ftt ? ((menuSectionOf(ftt)?.menuTabs ?? []) as MenuTab[]) : []),
    [ftt]
  );
  const farmpop = useMemo(
    () => (cafe ? ((menuSectionOf(cafe)?.farmpop ?? {}) as CafeFarmpop) : {}),
    [cafe]
  );

  const fttDirty = ftt !== null && JSON.stringify(ftt) !== origFtt;
  const cafeDirty = cafe !== null && JSON.stringify(cafe) !== origCafe;
  const isDirty = fttDirty || cafeDirty;

  const invalidCount =
    tabs.filter((t) => !isValidEmbedUrl(t.canvaUrl)).length +
    (cafe && farmpop.canvaUrl !== undefined && !isValidEmbedUrl(farmpop.canvaUrl ?? "") ? 1 : 0);

  /* ── Mutations ── */

  const setTabs = (next: MenuTab[]) => {
    if (!ftt) return;
    setFtt(withMenuPatch(ftt, { menuTabs: next }));
  };

  const updateTab = (i: number, patch: Partial<MenuTab>) => {
    const next = tabs.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    setTabs(next);
  };

  const moveTab = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= tabs.length) return;
    const next = [...tabs];
    [next[i], next[j]] = [next[j], next[i]];
    setTabs(next);
  };

  const removeTab = (i: number) => setTabs(tabs.filter((_, idx) => idx !== i));

  const addTab = () => {
    const n = newTabCount + 1;
    setNewTabCount(n);
    setTabs([...tabs, { id: `tab-${n}`, label: { es: "", en: "" }, canvaUrl: "" }]);
  };

  const updateFarmpop = (patch: Partial<CafeFarmpop>) => {
    if (!cafe) return;
    setCafe(withMenuPatch(cafe, { farmpop: { ...farmpop, ...patch } }));
  };

  /* ── Save / discard ── */

  const handleSave = async () => {
    if (!isDirty || invalidCount > 0) return;
    setSaving(true);
    setStatus("idle");
    try {
      if (fttDirty && ftt) {
        await savePageContent("farmtotable_content", ftt);
        setOrigFtt(JSON.stringify(ftt));
      }
      if (cafeDirty && cafe) {
        await savePageContent("cafe_content", cafe);
        setOrigCafe(JSON.stringify(cafe));
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    if (origFtt) setFtt(JSON.parse(origFtt));
    if (origCafe) setCafe(JSON.parse(origCafe));
  };

  /* Warn before closing the tab with unsaved changes */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ── Render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t({ es: "Cargando menús…", en: "Loading menus…" })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* ── Sticky toolbar (same language as VisualPageEditor) ── */}
      <div className="sticky top-0 z-30 mb-6">
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-5 h-5 text-[var(--olivea-olive)]" />
            <div>
              <h1 className="text-base font-semibold text-stone-800">{t({ es: "Menús y Enlaces", en: "Menus & Links" })}</h1>
              <p className="text-[11px] text-stone-400">
                {!canEdit
                  ? t(STR.readOnlyEditor)
                  : invalidCount > 0
                    ? t({ es: ` URL inválida — deben empezar con https://`, en: ` invalid URL — links must start with https://` })
                    : isDirty
                      ? t(STR.unsavedChanges)
                      : t(STR.liveWithin60s)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && isDirty && (
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                {t(STR.discard)}
              </button>
            )}
            <button
              onClick={load}
              className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
              title={t(STR.reloadFromServer)}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving || !isDirty || invalidCount > 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDirty && invalidCount === 0
                    ? "bg-[var(--olivea-olive)] text-white shadow-md hover:shadow-lg"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed"
                }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t(STR.saving) : t(STR.save)}
              </button>
            )}
          </div>
        </div>

        {status === "saved" && (
          <div className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
            {t(STR.savedLiveSoon)}
          </div>
        )}
        {status === "error" && (
          <div className="mt-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {t(STR.saveFailed)}
          </div>
        )}
        {loadNote && (
          <div className="mt-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center">
            {t(loadNote)}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* ── Farm To Table tabs ── */}
        {ftt && (
          <div className="rounded-2xl border border-stone-200/80 bg-white/60 overflow-hidden">
            <CardHeader
              icon={<UtensilsCrossed className="w-4 h-4 text-[var(--olivea-olive)]" />}
              title={t({ es: "Farm To Table — Pestañas del Menú en Vivo", en: "Farm To Table — Live Menu Tabs" })}
              hint="The tabs inside the “Live menu” popup: tasting menu, pairing, wine list…"
              liveHref="/es/farmtotable"
            />
            <div className="p-4 space-y-3">
              {tabs.length === 0 && (
                <p className="text-sm text-stone-400 italic px-1 py-2">
                  {t({ es: "Aún no hay pestañas — agrega la primera abajo.", en: "No menu tabs yet — add the first one below." })}
                </p>
              )}
              {tabs.map((tab, i) => (
                <div
                  key={`${tab.id}-${i}`}
                  className="rounded-xl border border-stone-200/70 bg-white/70 p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {/* Reorder */}
                    <div className="flex flex-col shrink-0">
                      <button
                        onClick={() => moveTab(i, -1)}
                        disabled={!canEdit || i === 0}
                        className="p-0.5 text-stone-400 hover:text-[var(--olivea-olive)] disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                        title={t(STR.moveUp)}
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveTab(i, 1)}
                        disabled={!canEdit || i === tabs.length - 1}
                        className="p-0.5 text-stone-400 hover:text-[var(--olivea-olive)] disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
                        title={t(STR.moveDown)}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Labels */}
                    <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                      <LangInput
                        lang="es"
                        value={bi(tab.label).es}
                        onChange={(v) => updateTab(i, { label: { ...bi(tab.label), es: v } })}
                        disabled={!canEdit}
                        placeholder="Vinos"
                      />
                      <LangInput
                        lang="en"
                        value={bi(tab.label).en}
                        onChange={(v) => updateTab(i, { label: { ...bi(tab.label), en: v } })}
                        disabled={!canEdit}
                        placeholder="Wine"
                      />
                    </div>

                    {/* Remove */}
                    {canEdit && (
                      <button
                        onClick={() => removeTab(i)}
                        className="p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title={t({ es: "Quitar pestaña", en: "Remove tab" })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="pl-6">
                    <UrlInput
                      value={tab.canvaUrl ?? ""}
                      onChange={(v) => updateTab(i, { canvaUrl: v })}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              ))}

              {canEdit && (
                <button
                  onClick={addTab}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-stone-300 text-stone-500 text-xs font-medium hover:border-[var(--olivea-olive)]/40 hover:text-[var(--olivea-olive)] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t({ es: "Agregar pestaña", en: "Add tab" })}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Café live menu ── */}
        {cafe && (
          <div className="rounded-2xl border border-stone-200/80 bg-white/60 overflow-hidden">
            <CardHeader
              icon={<Coffee className="w-4 h-4 text-[var(--olivea-olive)]" />}
              title={t({ es: "Olivea Café Wine Bar — Menú en Vivo", en: "Olivea Café Wine Bar — Live Menu" })}
              hint="The single “View live menu” button on the café page"
              liveHref="/es/cafe"
            />
            <div className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <LangInput
                  lang="es"
                  value={bi(farmpop.label).es}
                  onChange={(v) => updateFarmpop({ label: { ...bi(farmpop.label), es: v } })}
                  disabled={!canEdit}
                  placeholder="Ver menú en vivo"
                />
                <LangInput
                  lang="en"
                  value={bi(farmpop.label).en}
                  onChange={(v) => updateFarmpop({ label: { ...bi(farmpop.label), en: v } })}
                  disabled={!canEdit}
                  placeholder="View live menu"
                />
              </div>
              <UrlInput
                value={farmpop.canvaUrl ?? ""}
                onChange={(v) => updateFarmpop({ canvaUrl: v })}
                disabled={!canEdit}
              />
            </div>
          </div>
        )}

        {/* ── How it works ── */}
        <div className="rounded-2xl border border-stone-200/60 bg-white/40 px-5 py-4">
          <p className="text-xs text-stone-500 leading-relaxed">
            These links power the <strong className="text-stone-700">“Live menu”</strong> popups on
            the public site — each tab embeds the page it points to (Canva designs or roseiies
            menus). Changes are live within a minute of saving: no deploy needed. To change what a
            menu <em>says</em>, edit the design in Canva or roseiies — the site always shows the
            latest version at each link.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MenuAdminPage() {
  return (
    <SectionGuard sectionKey="content.menu">
      <MenusAndLinks />
    </SectionGuard>
  );
}
