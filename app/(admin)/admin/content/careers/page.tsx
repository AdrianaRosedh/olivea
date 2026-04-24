"use client";

import { useCallback, useEffect, useState } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  FileText,
  Plus,
  Trash2,
  Save,
  Loader2,
  ChevronDown,
  Eye,
  EyeOff,
  X,
  MessageSquarePlus,
  Search,
} from "lucide-react";
import {
  getJobOpenings,
  saveJobOpening,
  deleteJobOpening,
  toggleJobOpeningStatus,
  getJobApplications,
  updateApplicationStatus,
  addApplicationNote,
  type JobOpening,
  type JobApplication,
  type ApplicationNote,
} from "@/lib/supabase/careers-actions";
import {
  getCareersContent,
  saveCareersContent,
} from "@/lib/supabase/actions";
import staticCareers from "@/lib/content/data/careers";

/* ── Styling tokens ─────────────────────────────────────────────── */

const cls = {
  card: "rounded-2xl bg-white/60 backdrop-blur-md ring-1 ring-black/8 shadow-lg p-6",
  input:
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full",
  textarea:
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full min-h-[80px] resize-y",
  select:
    "rounded-xl bg-white/80 ring-1 ring-black/10 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--olivea-olive)]/40 outline-none w-full appearance-none cursor-pointer",
  btnPrimary:
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] transition-colors disabled:opacity-50",
  btnGhost:
    "rounded-full px-5 py-2 text-xs tracking-widest uppercase font-semibold bg-white/60 text-[var(--olivea-ink)] ring-1 ring-black/10 hover:bg-white/80 transition-colors",
  btnDanger:
    "rounded-full px-3 py-1.5 text-xs tracking-widest uppercase font-semibold bg-red-500/10 text-red-600 ring-1 ring-red-200 hover:bg-red-500/20 transition-colors",
  label:
    "text-xs font-semibold uppercase tracking-wider text-[var(--olivea-clay)]",
  langTag:
    "text-[10px] font-bold uppercase tracking-widest text-[var(--olivea-clay)]/60",
  badge: (color: string) =>
    `inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${color}`,
};

/* ── Toast ───────────────────────────────────────────────────────── */

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 rounded-xl px-5 py-3 shadow-xl text-sm font-medium backdrop-blur-md ${
        type === "success"
          ? "bg-emerald-50/90 text-emerald-800 ring-1 ring-emerald-200"
          : "bg-red-50/90 text-red-800 ring-1 ring-red-200"
      }`}
    >
      {message}
    </div>
  );
}

/* ── Bilingual input ─────────────────────────────────────────────── */

interface Bi {
  es: string;
  en: string;
}

function BiInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Bi;
  onChange: (v: Bi) => void;
  multiline?: boolean;
}) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="space-y-2">
      <p className={cls.label}>{label}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className={cls.langTag}>ES</span>
          <Tag
            className={multiline ? cls.textarea : cls.input}
            value={value.es}
            onChange={(e) => onChange({ ...value, es: e.target.value })}
            placeholder={`${label} (Español)`}
          />
        </div>
        <div className="space-y-1">
          <span className={cls.langTag}>EN</span>
          <Tag
            className={multiline ? cls.textarea : cls.input}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={`${label} (English)`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Status badges ───────────────────────────────────────────────── */

const openingStatusColors: Record<string, string> = {
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-red-50 text-red-600 border-red-200",
};

const applicationStatusColors: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  interview: "bg-purple-50 text-purple-700 border-purple-200",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  hired: "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)]/20",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

const applicationStatuses = [
  "applied",
  "reviewing",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;

/* ── Tab definition ──────────────────────────────────────────────── */

const tabs = [
  { key: "openings", label: "Job Openings", icon: Briefcase },
  { key: "applications", label: "Applications", icon: Users },
  { key: "page", label: "Page Content", icon: FileText },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ================================================================ */
/*  TAB 1 — JOB OPENINGS                                           */
/* ================================================================ */

function OpeningsTab({
  openings,
  setOpenings,
  toast,
}: {
  openings: JobOpening[];
  setOpenings: React.Dispatch<React.SetStateAction<JobOpening[]>>;
  toast: (msg: string, type: "success" | "error") => void;
}) {
  const [editing, setEditing] = useState<Partial<JobOpening> | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () =>
    setEditing({
      titleEs: "",
      titleEn: "",
      area: "",
      type: "full-time",
      descriptionEs: "",
      descriptionEn: "",
      requirementsEs: "",
      requirementsEn: "",
      location: "Valle de Guadalupe",
      status: "draft",
      sortOrder: openings.length,
    });

  const openEdit = (o: JobOpening) => setEditing({ ...o });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const saved = await saveJobOpening(editing);
      if (saved) {
        setOpenings((prev) => {
          const idx = prev.findIndex((o) => o.id === saved.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [...prev, saved];
        });
        toast(editing.id ? "Opening updated" : "Opening created", "success");
        setEditing(null);
      }
    } catch {
      toast("Failed to save opening", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const backup = openings;
    setOpenings((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteJobOpening(id);
      toast("Opening deleted", "success");
    } catch {
      setOpenings(backup);
      toast("Failed to delete", "error");
    }
  };

  const handleToggle = async (id: string, status: "draft" | "live" | "closed") => {
    setOpenings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      await toggleJobOpeningStatus(id, status);
      toast(`Opening ${status === "live" ? "published" : status}`, "success");
    } catch {
      setOpenings((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: status === "live" ? "draft" : "live" } : o
        )
      );
      toast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--olivea-clay)]">
          {openings.length} opening{openings.length !== 1 ? "s" : ""}
        </p>
        <button onClick={openNew} className={cls.btnPrimary}>
          <span className="flex items-center gap-2">
            <Plus size={14} /> New opening
          </span>
        </button>
      </div>

      {/* Opening cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {openings.map((o) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cls.card}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--olivea-ink)] truncate">
                      {o.titleEs || o.titleEn || "Untitled"}
                    </h3>
                    <span className={cls.badge(openingStatusColors[o.status])}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--olivea-clay)]">
                    <span>{o.area || "No area"}</span>
                    <span>·</span>
                    <span className="capitalize">{o.type.replace("-", " ")}</span>
                    <span>·</span>
                    <span>{o.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {o.status === "draft" ? (
                    <button
                      onClick={() => handleToggle(o.id, "live")}
                      title="Publish"
                      className="p-2 rounded-lg hover:bg-emerald-50 text-[var(--olivea-clay)] hover:text-emerald-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  ) : o.status === "live" ? (
                    <button
                      onClick={() => handleToggle(o.id, "closed")}
                      title="Close"
                      className="p-2 rounded-lg hover:bg-gray-100 text-[var(--olivea-clay)] hover:text-gray-600 transition-colors"
                    >
                      <EyeOff size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(o.id, "live")}
                      title="Reopen"
                      className="p-2 rounded-lg hover:bg-emerald-50 text-[var(--olivea-clay)] hover:text-emerald-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(o)}
                    className="p-2 rounded-lg hover:bg-[var(--olivea-cream)] text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)] transition-colors"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-[var(--olivea-clay)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {openings.length === 0 && (
          <div className="text-center py-16 text-sm text-[var(--olivea-clay)]">
            No job openings yet. Click "New opening" to create one.
          </div>
        )}
      </div>

      {/* ── Edit / Create modal ── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-start justify-center pt-16 px-4 bg-black/30 backdrop-blur-sm overflow-y-auto"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 p-6 mb-16"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--olivea-ink)]">
                  {editing.id ? "Edit Opening" : "New Opening"}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
                <BiInput
                  label="Title"
                  value={{ es: editing.titleEs ?? "", en: editing.titleEn ?? "" }}
                  onChange={(v) =>
                    setEditing((p) => ({ ...p!, titleEs: v.es, titleEn: v.en }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className={cls.label}>Area</p>
                    <input
                      className={cls.input}
                      value={editing.area ?? ""}
                      onChange={(e) =>
                        setEditing((p) => ({ ...p!, area: e.target.value }))
                      }
                      placeholder="e.g. Kitchen, Service, Bar"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className={cls.label}>Type</p>
                    <div className="relative">
                      <select
                        className={cls.select}
                        value={editing.type ?? "full-time"}
                        onChange={(e) =>
                          setEditing((p) => ({
                            ...p!,
                            type: e.target.value as JobOpening["type"],
                          }))
                        }
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="seasonal">Seasonal</option>
                        <option value="internship">Internship</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)] pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className={cls.label}>Location</p>
                    <input
                      className={cls.input}
                      value={editing.location ?? ""}
                      onChange={(e) =>
                        setEditing((p) => ({ ...p!, location: e.target.value }))
                      }
                      placeholder="Valle de Guadalupe"
                    />
                  </div>
                </div>

                <BiInput
                  label="Description"
                  value={{
                    es: editing.descriptionEs ?? "",
                    en: editing.descriptionEn ?? "",
                  }}
                  onChange={(v) =>
                    setEditing((p) => ({
                      ...p!,
                      descriptionEs: v.es,
                      descriptionEn: v.en,
                    }))
                  }
                  multiline
                />

                <BiInput
                  label="Requirements"
                  value={{
                    es: editing.requirementsEs ?? "",
                    en: editing.requirementsEn ?? "",
                  }}
                  onChange={(v) =>
                    setEditing((p) => ({
                      ...p!,
                      requirementsEs: v.es,
                      requirementsEn: v.en,
                    }))
                  }
                  multiline
                />

                <div className="space-y-1">
                  <p className={cls.label}>Status</p>
                  <div className="relative">
                    <select
                      className={cls.select}
                      value={editing.status ?? "draft"}
                      onChange={(e) =>
                        setEditing((p) => ({
                          ...p!,
                          status: e.target.value as JobOpening["status"],
                        }))
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                      <option value="closed">Closed</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)] pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-black/5">
                <button onClick={() => setEditing(null)} className={cls.btnGhost}>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cls.btnPrimary}
                >
                  <span className="flex items-center gap-2">
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {editing.id ? "Update" : "Create"}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================ */
/*  TAB 2 — APPLICATIONS PIPELINE                                   */
/* ================================================================ */

function ApplicationsTab({
  applications,
  setApplications,
  toast,
}: {
  applications: JobApplication[];
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  toast: (msg: string, type: "success" | "error") => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const filtered = applications.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.area.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Count by status
  const counts = applicationStatuses.reduce(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleStatusChange = async (id: string, status: JobApplication["status"]) => {
    const prev = applications.find((a) => a.id === id)?.status;
    setApplications((apps) =>
      apps.map((a) => (a.id === id ? { ...a, status } : a))
    );
    try {
      await updateApplicationStatus(id, status);
      toast(`Status → ${status}`, "success");
    } catch {
      setApplications((apps) =>
        apps.map((a) => (a.id === id ? { ...a, status: prev! } : a))
      );
      toast("Failed to update status", "error");
    }
  };

  const handleAddNote = async (id: string) => {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await addApplicationNote(id, { text: noteText, author: "Admin" });
      const newNote: ApplicationNote = {
        text: noteText,
        author: "Admin",
        date: new Date().toISOString(),
      };
      setApplications((apps) =>
        apps.map((a) =>
          a.id === id ? { ...a, notes: [...a.notes, newNote] } : a
        )
      );
      setNoteText("");
      toast("Note added", "success");
    } catch {
      toast("Failed to add note", "error");
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pipeline summary pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={cls.badge(
            statusFilter === "all"
              ? "bg-[var(--olivea-cream)] text-[var(--olivea-olive)] border-[var(--olivea-olive)]/20"
              : "bg-white/60 text-[var(--olivea-clay)] border-black/10 hover:bg-white/80"
          )}
        >
          All ({applications.length})
        </button>
        {applicationStatuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
            className={cls.badge(
              statusFilter === s
                ? applicationStatusColors[s]
                : "bg-white/60 text-[var(--olivea-clay)] border-black/10 hover:bg-white/80"
            )}
          >
            <span className="capitalize">{s}</span> ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)]"
        />
        <input
          className={`${cls.input} pl-10`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or area…"
        />
      </div>

      {/* Application list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((app) => (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cls.card}
            >
              {/* Summary row */}
              <button
                className="w-full text-left"
                onClick={() =>
                  setExpanded(expanded === app.id ? null : app.id)
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-[var(--olivea-ink)] truncate">
                        {app.name}
                      </h3>
                      <span
                        className={cls.badge(
                          applicationStatusColors[app.status]
                        )}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--olivea-clay)]">
                      <span>{app.email}</span>
                      <span>·</span>
                      <span>{app.area || "General"}</span>
                      {app.openingTitle && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--olivea-olive)]">
                            {app.openingTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-[var(--olivea-clay)]">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[var(--olivea-clay)] transition-transform ${
                        expanded === app.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {expanded === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-black/5 space-y-4">
                      {/* Contact & details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className={cls.label}>Phone</span>
                          <p className="mt-1 text-[var(--olivea-ink)]">
                            {app.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <span className={cls.label}>Email</span>
                          <p className="mt-1 text-[var(--olivea-ink)]">
                            {app.email}
                          </p>
                        </div>
                        <div>
                          <span className={cls.label}>Applied</span>
                          <p className="mt-1 text-[var(--olivea-ink)]">
                            {new Date(app.appliedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Cover note */}
                      {app.coverNote && (
                        <div>
                          <span className={cls.label}>Cover note</span>
                          <p className="mt-1 text-sm text-[var(--olivea-ink)]/80 bg-[var(--olivea-cream)]/30 rounded-xl p-3">
                            {app.coverNote}
                          </p>
                        </div>
                      )}

                      {/* Resume link */}
                      {app.resumeUrl && (
                        <div>
                          <span className={cls.label}>Resume</span>
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-sm text-[var(--olivea-olive)] underline"
                          >
                            View resume →
                          </a>
                        </div>
                      )}

                      {/* Status changer */}
                      <div>
                        <span className={cls.label}>Move to stage</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {applicationStatuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(app.id, s)}
                              disabled={app.status === s}
                              className={cls.badge(
                                app.status === s
                                  ? applicationStatusColors[s]
                                  : "bg-white/60 text-[var(--olivea-clay)] border-black/10 hover:bg-white/80"
                              )}
                            >
                              <span className="capitalize">{s}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <span className={cls.label}>
                          Notes ({app.notes.length})
                        </span>
                        <div className="mt-2 space-y-2">
                          {app.notes.map((n, i) => (
                            <div
                              key={i}
                              className="text-sm bg-white/80 rounded-xl p-3 ring-1 ring-black/5"
                            >
                              <p className="text-[var(--olivea-ink)]/80">
                                {n.text}
                              </p>
                              <p className="mt-1 text-[10px] text-[var(--olivea-clay)]">
                                {n.author} ·{" "}
                                {new Date(n.date).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Add note */}
                        <div className="mt-3 flex gap-2">
                          <input
                            className={`${cls.input} flex-1`}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note…"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddNote(app.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddNote(app.id)}
                            disabled={addingNote || !noteText.trim()}
                            className={cls.btnPrimary}
                          >
                            {addingNote ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <MessageSquarePlus size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-[var(--olivea-clay)]">
            {applications.length === 0
              ? "No applications yet. They'll appear here when candidates apply."
              : "No applications match your filters."}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 3 — PAGE CONTENT (simplified)                               */
/* ================================================================ */

interface CareersPageData {
  id: string;
  meta: { title: Bi; description: Bi };
  hero: {
    kicker: Bi;
    headline: Bi;
    description: Bi;
    image: { src: string; alt: Bi };
  };
  application: {
    title: Bi;
    description: Bi;
  };
}

const emptyBi = (): Bi => ({ es: "", en: "" });

function PageContentTab({
  toast,
}: {
  toast: (msg: string, type: "success" | "error") => void;
}) {
  const [data, setData] = useState<CareersPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCareersContent()
      .then((raw: Record<string, unknown> | null) => {
        if (raw) {
          setData(raw as unknown as CareersPageData);
        } else {
          // Seed from static data
          const s = staticCareers as unknown as Record<string, unknown>;
          setData({
            id: "careers",
            meta: (s.meta as CareersPageData["meta"]) ?? {
              title: emptyBi(),
              description: emptyBi(),
            },
            hero: {
              kicker:
                (s.hero as Record<string, unknown>)?.kicker as Bi ?? emptyBi(),
              headline:
                (s.hero as Record<string, unknown>)?.headline as Bi ?? emptyBi(),
              description:
                (s.hero as Record<string, unknown>)?.description as Bi ?? emptyBi(),
              image: {
                src:
                  ((s.hero as Record<string, unknown>)?.image as Record<string, unknown>)
                    ?.src as string ?? "",
                alt:
                  ((s.hero as Record<string, unknown>)?.image as Record<string, unknown>)
                    ?.alt as Bi ?? emptyBi(),
              },
            },
            application: (s.application as CareersPageData["application"]) ?? {
              title: emptyBi(),
              description: emptyBi(),
            },
          });
        }
      })
      .catch(() => {
        setData({
          id: "careers",
          meta: { title: emptyBi(), description: emptyBi() },
          hero: {
            kicker: emptyBi(),
            headline: emptyBi(),
            description: emptyBi(),
            image: { src: "", alt: emptyBi() },
          },
          application: { title: emptyBi(), description: emptyBi() },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await saveCareersContent(data as unknown as Record<string, unknown>);
      toast("Page content saved", "success");
    } catch {
      toast("Failed to save page content", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-[var(--olivea-cream)]/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className={cls.card}>
        <h3 className="text-sm font-semibold text-[var(--olivea-ink)] mb-4">
          SEO / Meta
        </h3>
        <div className="space-y-4">
          <BiInput
            label="Page title"
            value={data.meta.title}
            onChange={(v) =>
              setData({ ...data, meta: { ...data.meta, title: v } })
            }
          />
          <BiInput
            label="Meta description"
            value={data.meta.description}
            onChange={(v) =>
              setData({ ...data, meta: { ...data.meta, description: v } })
            }
            multiline
          />
        </div>
      </div>

      {/* Hero */}
      <div className={cls.card}>
        <h3 className="text-sm font-semibold text-[var(--olivea-ink)] mb-4">
          Hero Section
        </h3>
        <div className="space-y-4">
          <BiInput
            label="Kicker"
            value={data.hero.kicker}
            onChange={(v) =>
              setData({ ...data, hero: { ...data.hero, kicker: v } })
            }
          />
          <BiInput
            label="Headline"
            value={data.hero.headline}
            onChange={(v) =>
              setData({ ...data, hero: { ...data.hero, headline: v } })
            }
          />
          <BiInput
            label="Description"
            value={data.hero.description}
            onChange={(v) =>
              setData({ ...data, hero: { ...data.hero, description: v } })
            }
            multiline
          />
          <div className="space-y-1">
            <p className={cls.label}>Hero image URL</p>
            <input
              className={cls.input}
              value={data.hero.image.src}
              onChange={(e) =>
                setData({
                  ...data,
                  hero: {
                    ...data.hero,
                    image: { ...data.hero.image, src: e.target.value },
                  },
                })
              }
              placeholder="/images/careers-hero.jpg"
            />
          </div>
        </div>
      </div>

      {/* Application section */}
      <div className={cls.card}>
        <h3 className="text-sm font-semibold text-[var(--olivea-ink)] mb-4">
          Application Section
        </h3>
        <div className="space-y-4">
          <BiInput
            label="Title"
            value={data.application.title}
            onChange={(v) =>
              setData({ ...data, application: { ...data.application, title: v } })
            }
          />
          <BiInput
            label="Description"
            value={data.application.description}
            onChange={(v) =>
              setData({
                ...data,
                application: { ...data.application, description: v },
              })
            }
            multiline
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={cls.btnPrimary}
        >
          <span className="flex items-center gap-2">
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save page content
          </span>
        </button>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN PAGE                                                        */
/* ================================================================ */

export default function CareersAdmin() {
  const [tab, setTab] = useState<TabKey>("openings");
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastData, setToastData] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const toast = useCallback(
    (message: string, type: "success" | "error") =>
      setToastData({ message, type }),
    []
  );

  useEffect(() => {
    Promise.all([getJobOpenings(), getJobApplications()])
      .then(([o, a]) => {
        setOpenings(o);
        setApplications(a);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionGuard sectionKey="pages.careers">
    <div className="max-w-5xl space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toastData && (
          <Toast {...toastData} onDismiss={() => setToastData(null)} />
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/40 backdrop-blur-sm ring-1 ring-black/5 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-white shadow-sm text-[var(--olivea-ink)] ring-1 ring-black/5"
                    : "text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)] hover:bg-white/50"
                }
              `}
            >
              <Icon size={16} />
              {t.label}
              {t.key === "applications" && applications.length > 0 && (
                <span className="ml-1 text-[10px] font-bold bg-[var(--olivea-cream)] text-[var(--olivea-olive)] px-1.5 py-0.5 rounded-full">
                  {applications.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-[var(--olivea-cream)]/40 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "openings" && (
              <OpeningsTab
                openings={openings}
                setOpenings={setOpenings}
                toast={toast}
              />
            )}
            {tab === "applications" && (
              <ApplicationsTab
                applications={applications}
                setApplications={setApplications}
                toast={toast}
              />
            )}
            {tab === "page" && <PageContentTab toast={toast} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
    </SectionGuard>
  );
}
