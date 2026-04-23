"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { getPageContent, savePageContent } from "@/lib/supabase/actions";
import BilingualField from "./BilingualField";
import ImageUpload from "./ImageUpload";

/* ── Types ── */

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

interface FieldDef {
  key: string;
  label: string;
  type: "bilingual" | "bilingual-textarea" | "text" | "textarea" | "image" | "json" | "section";
  /** For bilingual-textarea */
  rows?: number;
  /** Image storage folder */
  folder?: string;
  /** Nested fields within a section */
  fields?: FieldDef[];
  /** Whether the section starts collapsed */
  collapsed?: boolean;
}

interface PageContentEditorProps {
  /** Page title shown at the top */
  title: string;
  /** Supabase table name */
  table: PageTable;
  /** Field definitions — controls what fields appear in the editor */
  fields: FieldDef[];
  /** Icon component */
  icon?: React.ReactNode;
  /** Static fallback data to pre-populate empty tables */
  fallbackData?: Record<string, unknown>;
}

/* ── Helpers ── */

function deepGet(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function deepSet(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(obj));
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

/* ── JSON field with local text state ── */

function JsonField({
  path,
  label,
  rows,
  data,
  setData,
}: {
  path: string;
  label: string;
  rows: number;
  data: Record<string, unknown>;
  setData: (d: Record<string, unknown>) => void;
}) {
  const val = deepGet(data, path);
  const [text, setText] = useState(val !== undefined ? JSON.stringify(val, null, 2) : "");
  const [isValid, setIsValid] = useState(true);

  // Sync when data changes externally (load / reset)
  useEffect(() => {
    const v = deepGet(data, path);
    setText(v !== undefined ? JSON.stringify(v, null, 2) : "");
    setIsValid(true);
  }, [path, data]);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
        {label} <span className={isValid ? "text-stone-400" : "text-red-500"}>(JSON{isValid ? "" : " — invalid"})</span>
      </label>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            setData(deepSet(data, path, parsed));
            setIsValid(true);
          } catch {
            setIsValid(false);
          }
        }}
        rows={rows}
        className={`w-full text-xs font-mono px-3 py-2 rounded-md border bg-stone-50/70 text-stone-800 focus:ring-1 focus:ring-olive-500 outline-none ${
          isValid ? "border-stone-300" : "border-red-400"
        }`}
      />
    </div>
  );
}

/* ── Component ── */

export default function PageContentEditor({
  title,
  table,
  fields,
  icon,
  fallbackData,
}: PageContentEditorProps) {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const row = await getPageContent(table);
      if (row && typeof row === "object") {
        // Remove internal fields
        const { id: _id, updated_at: _u, ...rest } = row as Record<string, unknown>;
        setData(rest);
      } else if (fallbackData) {
        setData(fallbackData);
      }
    } catch (err) {
      console.error("Load failed:", err);
      if (fallbackData) setData(fallbackData);
    }
    setLoading(false);
  }, [table, fallbackData]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await savePageContent(table, data);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
    }
    setSaving(false);
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const renderField = (field: FieldDef, prefix = "") => {
    const path = prefix ? `${prefix}.${field.key}` : field.key;

    if (field.type === "section") {
      const isCollapsed = collapsedSections.has(path);
      return (
        <div key={path} className="border border-stone-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(path)}
            className="w-full flex items-center justify-between px-4 py-3 bg-stone-100/60 hover:bg-stone-100 text-sm font-semibold text-stone-700 transition-colors"
          >
            {field.label}
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {!isCollapsed && (
            <div className="p-4 space-y-4 bg-white/40">
              {field.fields?.map((f) => renderField(f, path))}
            </div>
          )}
        </div>
      );
    }

    if (field.type === "bilingual" || field.type === "bilingual-textarea") {
      const val = deepGet(data, path) as { es: string; en: string } | undefined;
      return (
        <BilingualField
          key={path}
          label={field.label}
          value={val ?? { es: "", en: "" }}
          onChange={(v) => setData(deepSet(data, path, v))}
          type={field.type === "bilingual-textarea" ? "textarea" : "input"}
          rows={field.rows}
        />
      );
    }

    if (field.type === "text") {
      const val = (deepGet(data, path) as string) ?? "";
      return (
        <div key={path} className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            {field.label}
          </label>
          <input
            type="text"
            value={val}
            onChange={(e) => setData(deepSet(data, path, e.target.value))}
            className="w-full text-sm px-3 py-2 rounded-md border border-stone-300 bg-white/70 text-stone-800 focus:ring-1 focus:ring-olive-500 focus:border-olive-500 outline-none"
          />
        </div>
      );
    }

    if (field.type === "textarea") {
      const val = (deepGet(data, path) as string) ?? "";
      return (
        <div key={path} className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
            {field.label}
          </label>
          <textarea
            value={val}
            onChange={(e) => setData(deepSet(data, path, e.target.value))}
            rows={field.rows ?? 4}
            className="w-full text-sm px-3 py-2 rounded-md border border-stone-300 bg-white/70 text-stone-800 focus:ring-1 focus:ring-olive-500 focus:border-olive-500 outline-none"
          />
        </div>
      );
    }

    if (field.type === "image") {
      const val = (deepGet(data, path) as string) ?? "";
      return (
        <ImageUpload
          key={path}
          label={field.label}
          value={val}
          onChange={(v) => setData(deepSet(data, path, v))}
          folder={field.folder ?? "pages"}
        />
      );
    }

    if (field.type === "json") {
      return <JsonField key={path} path={path} label={field.label} rows={field.rows ?? 6} data={data} setData={setData} />;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading content...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-xl font-semibold text-stone-800">{title}</h1>
            <p className="text-sm text-stone-500">Edit bilingual content for this page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-stone-300 text-stone-500 hover:bg-stone-100 transition-colors"
            title="Reload"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-olive-700 text-white text-sm font-medium hover:bg-olive-800 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Status */}
      {status === "saved" && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          Changes saved successfully
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          Save failed — check your service role key
        </div>
      )}

      {/* Fields */}
      <div className="space-y-5 bg-white/60 backdrop-blur-sm border border-stone-200 rounded-xl p-6 shadow-sm">
        {fields.map((f) => renderField(f))}
      </div>
    </div>
  );
}
