"use client";

import { useEffect, useState, useCallback, useRef, createContext, useContext } from "react";
import { Save, Loader2, RefreshCw, Undo2, ChevronDown, ChevronRight, Settings, ExternalLink } from "lucide-react";
import { getPageContent, savePageContent } from "@/lib/supabase/actions";
import { useAuth } from "@/components/admin/AuthProvider";

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
  | "footer_content";

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
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:bg-stone-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-3.5 h-3.5" />
          Search & Social Preview
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-stone-200/60">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            This is what people see when this page appears in Google or is shared on social media.
            The <strong className="text-stone-700">title</strong> is the clickable headline; the{" "}
            <strong className="text-stone-700">description</strong> is the short blurb below it.
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
  const [data, setData] = useState<Record<string, unknown>>({});
  const [originalData, setOriginalData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
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
        const { id: _id, updated_at: _u, ...rest } = row as Record<string, unknown>;
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
      await savePageContent(table, data);
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
        Loading content...
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
                    ? "Read-only — you need Editor access to make changes"
                    : isDirty
                      ? "Unsaved changes — click Save to publish"
                      : "Edits go live on the public site within 60 seconds of saving"}
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
                  title={`Open ${livePath} in a new tab`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View live page
                </a>
              )}

              {/* Discard */}
              {userCanEdit && isDirty && (
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Discard
                </button>
              )}

              {/* Reload */}
              <button
                onClick={load}
                className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                title="Reload from server"
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
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>

          {/* Status toast */}
          {status === "saved" && (
            <div className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
              Changes saved successfully
            </div>
          )}
          {status === "error" && (
            <div className="mt-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              Save failed — check your service role key
            </div>
          )}
        </div>

        {/* ── Visual editor content ──────────────────────────── */}
        {children}
      </div>
    </EditorContext.Provider>
  );
}
