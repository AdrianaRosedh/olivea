"use client";

import { useEffect, useState, useCallback, useRef, createContext, useContext } from "react";
import { Save, Loader2, RefreshCw, Undo2, ChevronDown, ChevronRight, Settings, ExternalLink, Globe2 } from "lucide-react";
import { getPageContent, savePageContent } from "@/lib/supabase/actions";
import { useAuth } from "@/components/admin/AuthProvider";
import { useAdminLocale, STR } from "@/lib/admin/i18n";

/* ── Types ────────────────────────────────────────────────────────── */

type PageTable =
  | "farmtotable_content"
  | "casa_content"
  | "cafe_content"
  | "contact_content"
  | "sustainability_content"
  | "press_content"
  | "legal_content"
  | "team_content"
  | "not_found_content"
  | "global_settings"
  | "drawer_content"
  | "footer_content"
  | "innovation_content"
  | "roseiies_content";

interface EditorContextValue {
  data: Record<string, unknown>;
  setData: (d: Record<string, unknown>) => void;
  get: (path: string) => unknown;
  set: (path: string, value: unknown) => void;
  isDirty: boolean;
}

/* ── Deep helpers ─────────────────────────────────────────────────── */

function deepGet(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function deepSet(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  // Use structuredClone instead of JSON round-trip (faster, preserves more types)
  const clone = structuredClone(obj);
  const keys = path.split(".");
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

/* ── Context ──────────────────────────────────────────────────────── */

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within a VisualPageEditor");
  return ctx;
}

/* ── Meta section (collapsible) ───────────────────────────────────── */

function MetaSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useAdminLocale();
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:bg-stone-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" />
          {t({ es: "Vista en Google y Redes", en: "Search & Social Preview" })}
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-stone-200/60">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            {t({
              es: "Esto es lo que la gente ve cuando esta página aparece en Google o se comparte en redes. El título es el encabezado clicable; la descripción es el texto corto debajo.",
              en: "This is what people see when this page appears in Google or is shared on social media. The title is the clickable headline; the description is the short blurb below it.",
            })}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}

export { MetaSection };

/* ── Main component ───────────────────────────────────────────────── */

interface VisualPageEditorProps {
  /** Page title for the toolbar */
  title: string;
  /** Supabase table name */
  table: PageTable;
  /** Icon */
  icon?: React.ReactNode;
  /** Static fallback data */
  fallbackData?: Record<string, unknown>;
  /** Public path users can visit to see their edits live, e.g. "/casa".
      The toolbar renders a button that opens /es{path} in a new tab. */
  livePath?: string;
  /** The visual editor content — receives editable context */
  children: React.ReactNode;
}

export default function VisualPageEditor({
  title,
  table,
  icon,
  fallbackData,
  livePath,
  children,
}: VisualPageEditorProps) {
  const { canEdit: userCanEdit } = useAuth();
  const { t } = useAdminLocale();
  const [data, setData] = useState<Record<string, unknown>>({});
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error" | "conflict">("idle");
  // updated_at as it was when this editor loaded. The save is refused if the
  // row has moved since — these editors send the whole document, so writing
  // anyway would revert whatever the other person changed.
  const versionRef = useRef<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const originalRef = useRef<string>("");

  // Track dirty state via serialized snapshot (only when data changes, not every render)
  useEffect(() => {
    const currentStr = JSON.stringify(data);
    setIsDirty(currentStr !== originalRef.current);
  }, [data]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const row = await getPageContent(table);
      if (row && typeof row === "object") {
        const { id: _id, updated_at, ...rest } = row as Record<string, unknown>;
        versionRef.current = typeof updated_at === "string" ? updated_at : null;
        setData(rest);
        setOriginalData(rest);
        originalRef.current = JSON.stringify(rest);
      } else if (fallbackData) {
        setData(fallbackData);
        setOriginalData(fallbackData);
      }
    } catch (err) {
      console.error("Load failed:", err);
      if (fallbackData) {
        setData(fallbackData);
        setOriginalData(fallbackData);
      }
    }
    setLoading(false);
  }, [table, fallbackData]);

  useEffect(() => { load(); }, [load]);

  // Warn before navigation if there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const result = await savePageContent(table, data, versionRef.current);

      if (!result.ok) {
        // Someone else saved while this was open. Nothing is written and the
        // edits stay on screen, so the work is not lost — it just cannot be
        // applied on top of a version this editor never saw.
        setStatus("conflict");
        setSaving(false);
        return;
      }

      versionRef.current = result.version;
      setOriginalData(data);
      originalRef.current = JSON.stringify(data);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    setData(originalData);
  };

  const get = useCallback((path: string) => deepGet(data, path), [data]);
  const set = useCallback((path: string, value: unknown) => {
    setData((prev) => deepSet(prev, path, value));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t(STR.loading)}
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{ data, setData, get, set, isDirty }}>
      <div className="pb-24">
        {/* ── Sticky toolbar ─────────────────────────────────── */}
        <div className="sticky top-0 z-30 mb-6">
          <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <h1 className="text-base font-semibold text-stone-800">{title}</h1>
                <p className="text-[11px] text-stone-400">
                  {!userCanEdit
                    ? t(STR.readOnlyEditor)
                    : isDirty
                      ? t(STR.unsavedChanges)
                      : t(STR.liveWithin60s)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View live page */}
              {livePath && (
                <a
                  href={`/es${livePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--olivea-olive)] text-xs font-medium hover:bg-[var(--olivea-cream)]/50 transition-colors"
                  title={`${t(STR.viewLivePage)}: ${livePath}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t(STR.viewLivePage)}
                </a>
              )}

              {/* Discard */}
              {userCanEdit && isDirty && (
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  {t(STR.discard)}
                </button>
              )}

              {/* Reload */}
              <button
                onClick={load}
                className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                title={t(STR.reloadFromServer)}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Save — only show for editors+ */}
              {userCanEdit && (
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isDirty
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

          {/* ── Site impact — exactly what this editor changes on the website.
              Both language URLs as distinct pills; answers "where will I see this?" */}
          {livePath && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 px-4 py-2 rounded-xl bg-[var(--olivea-cream)]/30 border border-[var(--olivea-olive)]/[0.06] text-[11px] text-stone-500">
              <Globe2 className="w-3 h-3 text-[var(--olivea-olive)]/60 shrink-0" />
              <span className="font-medium text-stone-600 shrink-0">{t(STR.affects)}:</span>
              {(["es", "en"] as const).map((l) => (
                <a
                  key={l}
                  href={`/${l}${livePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t(STR.viewLivePage)}
                  className="inline-flex items-center gap-1 font-mono px-1.5 py-0.5 rounded-md bg-white/70 border border-[var(--olivea-olive)]/10 text-[var(--olivea-olive)] hover:bg-white hover:border-[var(--olivea-olive)]/25 transition-colors"
                >
                  <span className="uppercase text-[9px] font-bold tracking-wider text-[var(--olivea-olive)]/50">{l}</span>
                  oliveafarmtotable.com/{l}
                  {livePath}
                </a>
              ))}
              <span className="text-stone-400 shrink-0">
                · {t({ es: "en vivo ~1 min después de guardar", en: "live ~1 min after saving" })}
              </span>
            </div>
          )}

          {/* Status toast */}
          {status === "saved" && (
            <div className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
              {t(STR.savedOk)}
            </div>
          )}
          {status === "error" && (
            <div className="mt-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {t(STR.saveFailed)}
            </div>
          )}
          {/* Nothing was written and the edits are still on screen. Reloading
              is destructive, so it asks rather than doing it automatically. */}
          {status === "conflict" && (
            <div className="mt-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <p className="font-semibold">
                {t({
                  es: "Alguien más guardó esta página mientras la editabas.",
                  en: "Someone else saved this page while you were editing.",
                })}
              </p>
              <p className="mt-1 text-amber-700">
                {t({
                  es: "No se guardó nada, para no borrar su trabajo. Tus cambios siguen aquí: cópialos, recarga y vuelve a aplicarlos.",
                  en: "Nothing was saved, so their work is intact. Your changes are still here — copy them, reload, and apply them again.",
                })}
              </p>
              <button
                type="button"
                onClick={() => {
                  void load();
                  setStatus("idle");
                }}
                className="mt-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700"
              >
                {t({ es: "Recargar y perder mis cambios", en: "Reload and discard my changes" })}
              </button>
            </div>
          )}
        </div>

        {/* ── Visual editor content ──────────────────────────── */}
        {children}
      </div>
    </EditorContext.Provider>
  );
}
