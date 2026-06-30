"use client";

import { useState, useEffect, useCallback } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import { Clock, Plus, Trash2, GripVertical, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

/* ── Types ── */

interface HoursSlot {
  days: string[];
  opens: string;
  closes: string;
}

interface BusinessHours {
  id: string;
  venue: string;
  label: { es: string; en: string };
  schedule: { es: string; en: string };
  slots?: HoursSlot[];
  sortOrder: number;
}

/* ── Venue options ── */
const venueOptions = [
  { value: "farmtotable", label: "Olivea Farm to Table" },
  { value: "casa", label: "Casa Olivea" },
  { value: "cafe", label: "Café Olivea" },
] as const;

/* ── Days (schema.org weekday names) ── */
const DAYS: { full: string; short: string }[] = [
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
  { full: "Sunday", short: "Sun" },
];

/* ── Easing ── */
const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function HoursPage() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  const loadHours = useCallback(async () => {
    try {
      // Load from global settings (hours are stored in global_settings table)
      const { getPageContent } = await import("@/lib/supabase/actions");
      const data = await getPageContent("global_settings");
      const h = (data?.hours ?? []) as BusinessHours[];
      setHours(h.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch {
      // fallback to static data
      const { default: global } = await import("@/lib/content/data/global");
      setHours([...global.hours]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHours(); }, [loadHours]);

  const updateItem = (idx: number, patch: Partial<BusinessHours>) => {
    const updated = [...hours];
    updated[idx] = { ...updated[idx], ...patch };
    setHours(updated);
    setDirty(true);
  };

  const addItem = () => {
    const newItem: BusinessHours = {
      id: crypto.randomUUID(),
      venue: "farmtotable",
      label: { es: "", en: "" },
      schedule: { es: "", en: "" },
      sortOrder: hours.length,
    };
    setHours([...hours, newItem]);
    setDirty(true);
  };

  const removeItem = (idx: number) => {
    const item = hours[idx];
    const venueLabel = venueOptions.find((v) => v.value === item?.venue)?.label ?? item?.venue ?? "this entry";
    if (!window.confirm(`Delete hours for "${venueLabel}"? This will be removed from the public site after you save.`)) return;
    setHours(hours.filter((_, i) => i !== idx));
    setDirty(true);
  };

  /* ── Structured slots (drive openingHoursSpecification in JSON-LD) ── */
  const addSlot = (idx: number) => {
    updateItem(idx, { slots: [...(hours[idx].slots ?? []), { days: [], opens: "09:00", closes: "17:00" }] });
  };
  const updateSlot = (idx: number, sIdx: number, patch: Partial<HoursSlot>) => {
    updateItem(idx, { slots: (hours[idx].slots ?? []).map((s, i) => (i === sIdx ? { ...s, ...patch } : s)) });
  };
  const removeSlot = (idx: number, sIdx: number) => {
    updateItem(idx, { slots: (hours[idx].slots ?? []).filter((_, i) => i !== sIdx) });
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= hours.length) return;
    const updated = [...hours];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    // Update sortOrder
    updated.forEach((h, i) => { h.sortOrder = i; });
    setHours(updated);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const { getPageContent, savePageContent } = await import("@/lib/supabase/actions");
      const current = await getPageContent("global_settings");
      const updated = { ...current, hours };
      await savePageContent("global_settings", updated as Record<string, unknown>);
      setDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (e) {
      console.error("[hours] Failed to save:", e);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SectionGuard sectionKey="settings.hours">
        <div className="max-w-3xl mx-auto flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--olivea-olive)]" />
        </div>
      </SectionGuard>
    );
  }

  return (
    <SectionGuard sectionKey="settings.hours">
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: cinematic }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[var(--olivea-olive)]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--olivea-ink)] tracking-tight">
              Hours & Availability
            </h1>
            <p className="text-xs text-[var(--olivea-clay)]">
              Operating hours displayed on the contact page and footer
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all
            ${dirty
              ? "bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-olive)]/90 shadow-sm"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
            }
          `}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* ── Status toasts ── */}
      {saveStatus === "saved" && (
        <div className="rounded-xl bg-emerald-50/80 ring-1 ring-emerald-200 px-4 py-2 text-sm text-emerald-700 text-center">
          Hours saved successfully
        </div>
      )}
      {saveStatus === "error" && (
        <div className="rounded-xl bg-red-50/80 ring-1 ring-red-200 px-4 py-2 text-sm text-red-700 text-center">
          Save failed — check your connection and try again
        </div>
      )}

      {/* ── Hours list ── */}
      <div className="space-y-3">
        {hours.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4, ease: cinematic }}
            className="rounded-2xl bg-white/60 backdrop-blur-sm border border-[var(--olivea-olive)]/[0.06] p-5 space-y-4 group"
          >
            {/* ── Header row ── */}
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-stone-300 flex-shrink-0" />

              <select
                value={item.venue}
                onChange={(e) => updateItem(idx, { venue: e.target.value })}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 focus:border-[var(--olivea-olive)] outline-none"
              >
                {venueOptions.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>

              <div className="flex-1" />

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {idx > 0 && (
                  <button onClick={() => moveItem(idx, -1)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 text-xs" title="Move up">↑</button>
                )}
                {idx < hours.length - 1 && (
                  <button onClick={() => moveItem(idx, 1)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 text-xs" title="Move down">↓</button>
                )}
                <button onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Label (bilingual) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Label (ES)</label>
                <input
                  type="text"
                  value={item.label.es}
                  onChange={(e) => updateItem(idx, { label: { ...item.label, es: e.target.value } })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none"
                  placeholder="Olivea Farm To Table"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Label (EN)</label>
                <input
                  type="text"
                  value={item.label.en}
                  onChange={(e) => updateItem(idx, { label: { ...item.label, en: e.target.value } })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none"
                  placeholder="Olivea Farm To Table"
                />
              </div>
            </div>

            {/* ── Schedule (bilingual) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Schedule (Spanish)</label>
                <input
                  type="text"
                  value={item.schedule.es}
                  onChange={(e) => updateItem(idx, { schedule: { ...item.schedule, es: e.target.value } })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none"
                  placeholder="Mié 5–8 · Vie 2:30–8:30 · Dom 2–7"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Schedule (English)</label>
                <input
                  type="text"
                  value={item.schedule.en}
                  onChange={(e) => updateItem(idx, { schedule: { ...item.schedule, en: e.target.value } })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[var(--olivea-olive)] focus:ring-2 focus:ring-[var(--olivea-olive)]/20 outline-none"
                  placeholder="Wed 5–8 · Fri 2:30–8:30 · Sun 2–7"
                />
              </div>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed pl-1">
              Tip: separate days with a dot ( · ) and use en-dash for time ranges (5–8 not 5-8). Example: <code className="text-stone-500">Wed 5–8 · Fri 2:30–8:30 · Sun 2–7</code>
            </p>

            {/* ── Structured hours (drives Google & AI opening hours in JSON-LD) ── */}
            <div className="space-y-2 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Structured hours · for Google &amp; AI</label>
                <button onClick={() => addSlot(idx)} className="text-[11px] font-semibold text-[var(--olivea-olive)] hover:underline">+ Add time block</button>
              </div>
              {(item.slots ?? []).length === 0 && (
                <p className="text-[11px] text-stone-400 italic">No structured hours yet — search engines fall back to the display text above.</p>
              )}
              {(item.slots ?? []).map((slot, sIdx) => (
                <div key={sIdx} className="rounded-lg bg-stone-50/80 ring-1 ring-stone-100 p-3 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {DAYS.map((d) => {
                      const on = slot.days.includes(d.full);
                      return (
                        <button
                          key={d.full}
                          onClick={() => updateSlot(idx, sIdx, { days: on ? slot.days.filter((x) => x !== d.full) : [...slot.days, d.full] })}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${on ? "bg-[var(--olivea-olive)] text-white" : "bg-white text-stone-500 ring-1 ring-stone-200 hover:ring-[var(--olivea-olive)]/40"}`}
                        >
                          {d.short}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="time" value={slot.opens} onChange={(e) => updateSlot(idx, sIdx, { opens: e.target.value })} className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm text-stone-800 focus:border-[var(--olivea-olive)] outline-none" />
                    <span className="text-stone-400 text-sm">to</span>
                    <input type="time" value={slot.closes} onChange={(e) => updateSlot(idx, sIdx, { closes: e.target.value })} className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm text-stone-800 focus:border-[var(--olivea-olive)] outline-none" />
                    <div className="flex-1" />
                    <button onClick={() => removeSlot(idx, sIdx)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500" title="Remove time block">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* ── Add button ── */}
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-2 border-dashed border-stone-200 text-stone-500 text-xs font-semibold uppercase tracking-wider hover:border-[var(--olivea-olive)] hover:text-[var(--olivea-olive)] hover:bg-[var(--olivea-olive)]/[0.03] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Venue Hours
        </button>
      </div>
    </motion.div>
    </SectionGuard>
  );
}
