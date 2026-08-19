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
  Megaphone,
  Search,
} from "lucide-react";
import { CANONICAL_BASE_URL } from "@/lib/site";
import {
  getJobOpenings,
  saveJobOpening,
  deleteJobOpening,
  toggleJobOpeningStatus,
  getJobApplications,
  updateApplicationStatus,
  publishApplicationOutcome,
  addApplicationNote,
  getHiringPromo,
  getResumeDownloadUrl,
  setHiringPromo,
  type JobOpening,
  type JobApplication,
  type ApplicationNote,
} from "@/lib/supabase/careers-actions";
import {
  getCareersContent,
  saveCareersContent,
} from "@/lib/supabase/actions";
import staticCareers from "@/lib/content/data/careers";
import { useAdminLocale, STR } from "@/lib/admin/i18n";
import { CAREER_AREAS, areaLabel, isKnownArea } from "@/lib/careers/areas";

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
  label: Bi;
  value: Bi;
  onChange: (v: Bi) => void;
  multiline?: boolean;
}) {
  const { t } = useAdminLocale();
  const Tag = multiline ? "textarea" : "input";
  const labelText = t(label);
  return (
    <div className="space-y-2">
      <p className={cls.label}>{labelText}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className={cls.langTag}>ES</span>
          <Tag
            className={multiline ? cls.textarea : cls.input}
            value={value.es}
            onChange={(e) => onChange({ ...value, es: e.target.value })}
            placeholder={`${labelText} (Español)`}
          />
        </div>
        <div className="space-y-1">
          <span className={cls.langTag}>EN</span>
          <Tag
            className={multiline ? cls.textarea : cls.input}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={`${labelText} (English)`}
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

/* ── Status / type display labels (bilingual) ────────────────────── */

const openingStatusLabels: Record<string, Bi> = {
  draft: { es: "Borrador", en: "Draft" },
  live: { es: "En vivo", en: "Live" },
  closed: { es: "Cerrada", en: "Closed" },
};

const applicationStatusLabels: Record<string, Bi> = {
  applied: { es: "Recibida", en: "Applied" },
  reviewing: { es: "En revisión", en: "Reviewing" },
  interview: { es: "Entrevista", en: "Interview" },
  offer: { es: "Oferta", en: "Offer" },
  hired: { es: "Contratada", en: "Hired" },
  rejected: { es: "Rechazada", en: "Rejected" },
};

/**
 * The two endings that wait for a person to deliver them.
 *
 * A status in this map does not reach the applicant's page when HR sets it —
 * it waits behind an explicit Publish. Anything absent here shows immediately.
 */
const outcomeCopy: Record<
  string,
  { held: Bi; published: Bi; confirm: Bi } | undefined
> = {
  rejected: {
    held: {
      es: "«En revisión». Aún no sabe que no seguimos adelante.",
      en: "“In review”. They don’t know yet that we didn’t move forward.",
    },
    published: {
      es: "«No seguimos adelante esta vez» — publicado.",
      en: "“We didn’t move forward this time” — published.",
    },
    confirm: {
      es: "El candidato verá que no seguimos adelante en cuanto abra su enlace. ¿Publicar el resultado?",
      en: "The applicant will see that we didn’t move forward as soon as they open their link. Publish the outcome?",
    },
  },
  hired: {
    held: {
      es: "«Oferta». Aún no sabe que quedó contratado.",
      en: "“Offer”. They don’t know yet that they’ve got the job.",
    },
    published: {
      es: "«Te damos la bienvenida» — publicado.",
      en: "“Welcome” — published.",
    },
    confirm: {
      es: "El candidato verá que quedó contratado en cuanto abra su enlace. ¿Publicar el resultado?",
      en: "The applicant will see that they’ve got the job as soon as they open their link. Publish the outcome?",
    },
  },
};

const jobTypeLabels: Record<string, Bi> = {
  "full-time": { es: "Tiempo completo", en: "Full-time" },
  "part-time": { es: "Medio tiempo", en: "Part-time" },
  seasonal: { es: "Temporada", en: "Seasonal" },
  internship: { es: "Prácticas", en: "Internship" },
};

/* ── Tab definition ──────────────────────────────────────────────── */

const tabs = [
  { key: "openings", label: { es: "Vacantes", en: "Job Openings" }, icon: Briefcase },
  { key: "applications", label: { es: "Postulaciones", en: "Applications" }, icon: Users },
  { key: "page", label: { es: "Contenido", en: "Page Content" }, icon: FileText },
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
  const [promo, setPromo] = useState<"auto" | "on" | "off">("auto");
  const { t } = useAdminLocale();

  // Load the current "we're hiring" pill mode.
  useEffect(() => {
    getHiringPromo().then(setPromo).catch(() => {});
  }, []);

  const changePromo = async (value: "auto" | "on" | "off") => {
    const prev = promo;
    setPromo(value); // optimistic
    try {
      await setHiringPromo(value);
      toast(t({ es: "Aviso de contratación actualizado", en: "Hiring promo updated" }), "success");
    } catch {
      setPromo(prev);
      toast(t({ es: "No se pudo actualizar", en: "Failed to update" }), "error");
    }
  };

  const liveCount = openings.filter((o) => o.status === "live").length;

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
        toast(editing.id ? t({ es: "Vacante actualizada", en: "Opening updated" }) : t({ es: "Vacante creada", en: "Opening created" }), "success");
        setEditing(null);
      }
    } catch {
      toast(t({ es: "No se pudo guardar la vacante", en: "Failed to save opening" }), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const backup = openings;
    setOpenings((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteJobOpening(id);
      toast(t({ es: "Vacante eliminada", en: "Opening deleted" }), "success");
    } catch {
      setOpenings(backup);
      toast(t({ es: "No se pudo eliminar", en: "Failed to delete" }), "error");
    }
  };

  const handleToggle = async (id: string, status: "draft" | "live" | "closed") => {
    setOpenings((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      await toggleJobOpeningStatus(id, status);
      toast(
        t(
          status === "live"
            ? { es: "Vacante publicada", en: "Opening published" }
            : status === "closed"
            ? { es: "Vacante cerrada", en: "Opening closed" }
            : { es: "Vacante en borrador", en: "Opening draft" }
        ),
        "success"
      );
    } catch {
      setOpenings((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: status === "live" ? "draft" : "live" } : o
        )
      );
      toast(t({ es: "No se pudo actualizar el estado", en: "Failed to update status" }), "error");
    }
  };

  const showingNow = promo === "on" || (promo === "auto" && liveCount > 0);

  return (
    <div className="space-y-4">
      {/* "We're hiring" pill control — promotes openings on the public site */}
      <div className="rounded-2xl border border-[var(--olivea-olive)]/[0.08] bg-[var(--olivea-cream)]/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/60 border border-[var(--olivea-olive)]/[0.08] flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4 text-[var(--olivea-olive)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--olivea-ink)]">
              {t({ es: "Aviso “Estamos contratando”", en: "“We’re hiring” pill" })}
            </h3>
            <p className="text-[11px] text-[var(--olivea-clay)] mt-0.5 leading-relaxed">
              {t({
                es: "Una invitación flotante en el sitio público que lleva a Trabaja con Nosotros.",
                en: "A floating invite on the public site that links to the careers page.",
              })}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {([
                { v: "auto", es: "Automático", en: "Auto" },
                { v: "on", es: "Siempre visible", en: "Always on" },
                { v: "off", es: "Oculto", en: "Off" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => changePromo(opt.v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    promo === opt.v
                      ? "bg-[var(--olivea-olive)] text-white shadow-sm"
                      : "bg-white/60 text-[var(--olivea-clay)] hover:bg-white"
                  }`}
                >
                  {t({ es: opt.es, en: opt.en })}
                </button>
              ))}
            </div>
            <p className="text-[11px] mt-2.5 flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${showingNow ? "bg-emerald-500" : "bg-stone-300"}`} />
              <span className="text-[var(--olivea-clay)]">
                {showingNow
                  ? t({ es: "Visible ahora en el sitio", en: "Showing on the site now" })
                  : promo === "off"
                    ? t({ es: "Oculto por elección", en: "Hidden by choice" })
                    : t({ es: "Se mostrará cuando publiques una vacante", en: "Will show once you publish a live opening" })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--olivea-clay)]">
          {openings.length}{" "}
          {t(
            openings.length !== 1
              ? { es: "vacantes", en: "openings" }
              : { es: "vacante", en: "opening" }
          )}
        </p>
        <button onClick={openNew} className={cls.btnPrimary}>
          <span className="flex items-center gap-2">
            <Plus size={14} /> {t({ es: "Nueva vacante", en: "New opening" })}
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
                      {o.titleEs || o.titleEn || t({ es: "Sin título", en: "Untitled" })}
                    </h3>
                    <span className={cls.badge(openingStatusColors[o.status])}>
                      {t(openingStatusLabels[o.status])}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--olivea-clay)]">
                    <span>
                      {o.area
                        ? t({ es: areaLabel(o.area, "es"), en: areaLabel(o.area, "en") })
                        : t({ es: "Sin área", en: "No area" })}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{t(jobTypeLabels[o.type])}</span>
                    <span>·</span>
                    <span>{o.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {o.status === "draft" ? (
                    <button
                      onClick={() => handleToggle(o.id, "live")}
                      title={t({ es: "Publicar", en: "Publish" })}
                      className="p-2 rounded-lg hover:bg-emerald-50 text-[var(--olivea-clay)] hover:text-emerald-600 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  ) : o.status === "live" ? (
                    <button
                      onClick={() => handleToggle(o.id, "closed")}
                      title={t({ es: "Cerrar", en: "Close" })}
                      className="p-2 rounded-lg hover:bg-gray-100 text-[var(--olivea-clay)] hover:text-gray-600 transition-colors"
                    >
                      <EyeOff size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(o.id, "live")}
                      title={t({ es: "Reabrir", en: "Reopen" })}
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
            {t({ es: 'Aún no hay vacantes. Haz clic en "Nueva vacante" para crear una.', en: 'No job openings yet. Click "New opening" to create one.' })}
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
                  {editing.id ? t({ es: "Editar vacante", en: "Edit Opening" }) : t({ es: "Nueva vacante", en: "New Opening" })}
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
                  label={{ es: "Título", en: "Title" }}
                  value={{ es: editing.titleEs ?? "", en: editing.titleEn ?? "" }}
                  onChange={(v) =>
                    setEditing((p) => ({ ...p!, titleEs: v.es, titleEn: v.en }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className={cls.label}>{t({ es: "Área", en: "Area" })}</p>
                    {/* A list, not free text. The applicant form offers these
                        same areas, so anything typed here that was not among
                        them — "Marketing" was — left applicants unable to
                        answer the question correctly. */}
                    <div className="relative">
                      <select
                        className={cls.select}
                        value={editing.area ?? ""}
                        onChange={(e) =>
                          setEditing((p) => ({ ...p!, area: e.target.value }))
                        }
                      >
                        <option value="" disabled>
                          {t({ es: "Selecciona…", en: "Select…" })}
                        </option>
                        {CAREER_AREAS.map((a) => (
                          <option key={a.value} value={a.value}>
                            {t({ es: a.es, en: a.en })}
                          </option>
                        ))}
                        {/* Keep an unrecognised existing value selectable so
                            opening an older posting cannot silently blank it. */}
                        {editing.area && !isKnownArea(editing.area) && (
                          <option value={editing.area}>{editing.area}</option>
                        )}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)] pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className={cls.label}>{t({ es: "Tipo", en: "Type" })}</p>
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
                        <option value="full-time">{t(jobTypeLabels["full-time"])}</option>
                        <option value="part-time">{t(jobTypeLabels["part-time"])}</option>
                        <option value="seasonal">{t(jobTypeLabels.seasonal)}</option>
                        <option value="internship">{t(jobTypeLabels.internship)}</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--olivea-clay)] pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className={cls.label}>{t({ es: "Ubicación", en: "Location" })}</p>
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
                  label={{ es: "Descripción", en: "Description" }}
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
                  label={{ es: "Requisitos", en: "Requirements" }}
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
                  <p className={cls.label}>{t({ es: "Estado", en: "Status" })}</p>
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
                      <option value="draft">{t(openingStatusLabels.draft)}</option>
                      <option value="live">{t(openingStatusLabels.live)}</option>
                      <option value="closed">{t(openingStatusLabels.closed)}</option>
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
                  {t(STR.cancel)}
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
                    {editing.id ? t({ es: "Actualizar", en: "Update" }) : t({ es: "Crear", en: "Create" })}
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
  const { t } = useAdminLocale();
  const [resumeBusy, setResumeBusy] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [publishBusy, setPublishBusy] = useState<string | null>(null);

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
      toast(t({ es: "Estado", en: "Status" }) + " → " + t(applicationStatusLabels[status]), "success");
    } catch {
      setApplications((apps) =>
        apps.map((a) => (a.id === id ? { ...a, status: prev! } : a))
      );
      toast(t({ es: "No se pudo actualizar el estado", en: "Failed to update status" }), "error");
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
      toast(t({ es: "Nota agregada", en: "Note added" }), "success");
    } catch {
      toast(t({ es: "No se pudo agregar la nota", en: "Failed to add note" }), "error");
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
          {t({ es: "Todas", en: "All" })} ({applications.length})
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
            {t(applicationStatusLabels[s])} ({counts[s] ?? 0})
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
          placeholder={t({ es: "Buscar por nombre, correo o área…", en: "Search by name, email, or area…" })}
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
                        {t(applicationStatusLabels[app.status])}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--olivea-clay)]">
                      <span>{app.email}</span>
                      <span>·</span>
                      {/* Applications store the same values, so they read as
                          names here instead of "foh". */}
                      <span>
                        {app.area
                          ? t({ es: areaLabel(app.area, "es"), en: areaLabel(app.area, "en") })
                          : t({ es: "General", en: "General" })}
                      </span>
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
                          <span className={cls.label}>{t({ es: "Teléfono", en: "Phone" })}</span>
                          <p className="mt-1 text-[var(--olivea-ink)]">
                            {app.phone || "—"}
                          </p>
                        </div>
                        <div>
                          <span className={cls.label}>{t({ es: "Correo", en: "Email" })}</span>
                          <p className="mt-1 text-[var(--olivea-ink)]">
                            {app.email}
                          </p>
                        </div>
                        <div>
                          <span className={cls.label}>{t({ es: "Postulación", en: "Applied" })}</span>
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
                          <span className={cls.label}>{t({ es: "Nota de presentación", en: "Cover note" })}</span>
                          <p className="mt-1 text-sm text-[var(--olivea-ink)]/80 bg-[var(--olivea-cream)]/30 rounded-xl p-3">
                            {app.coverNote}
                          </p>
                        </div>
                      )}

                      {/* Resume. resume_url holds a storage path, not a URL —
                          the bucket is private — so the link is signed on
                          click and expires in minutes. */}
                      {app.resumeUrl && (
                        <div>
                          <span className={cls.label}>{t({ es: "Currículum", en: "Resume" })}</span>
                          <button
                            type="button"
                            disabled={resumeBusy === app.id}
                            onClick={async () => {
                              setResumeBusy(app.id);
                              try {
                                const url = await getResumeDownloadUrl(app.id);
                                if (url) window.open(url, "_blank", "noopener,noreferrer");
                                else alert(t({ es: "No se pudo abrir el currículum.", en: "Could not open the resume." }));
                              } finally {
                                setResumeBusy(null);
                              }
                            }}
                            className="mt-1 inline-block text-sm text-[var(--olivea-olive)] underline disabled:opacity-50"
                          >
                            {resumeBusy === app.id
                              ? t({ es: "Abriendo…", en: "Opening…" })
                              : t({ es: "Ver currículum →", en: "View resume →" })}
                          </button>
                        </div>
                      )}

                      {/* The applicant's own status page. Sharing this instead
                          of answering "any news?" by hand means the stage the
                          buttons below set is the stage they see. */}
                      {app.statusToken && (
                        <div>
                          <span className={cls.label}>
                            {t({ es: "Enlace de seguimiento", en: "Tracking link" })}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              // Not window.location.origin — the admin lives on
                              // admin.oliveafarmtotable.com, which does not serve
                              // the public status page.
                              const url = `${CANONICAL_BASE_URL}/${app.lang}/carreras/estado/${app.statusToken}`;
                              navigator.clipboard
                                .writeText(url)
                                .then(() => {
                                  setCopiedLink(app.id);
                                  window.setTimeout(() => setCopiedLink(null), 2000);
                                })
                                .catch(() =>
                                  alert(t({ es: "No se pudo copiar.", en: "Could not copy." }))
                                );
                            }}
                            className="mt-1 inline-block text-sm text-[var(--olivea-olive)] underline"
                          >
                            {copiedLink === app.id
                              ? t({ es: "¡Copiado!", en: "Copied!" })
                              : t({ es: "Copiar enlace del candidato", en: "Copy applicant link" })}
                          </button>
                          <p className="mt-1 text-xs text-[var(--olivea-ink)]/50">
                            {t({
                              es: "Ya se lo enviamos por correo al aplicar.",
                              en: "Already emailed to them when they applied.",
                            })}
                          </p>
                        </div>
                      )}

                      {/* Status changer */}
                      <div>
                        <span className={cls.label}>{t({ es: "Mover a etapa", en: "Move to stage" })}</span>
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
                              {t(applicationStatusLabels[s])}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* What the applicant can actually see. Moving someone to
                          a final outcome is an internal decision; it only
                          reaches their status page when someone releases it
                          here — good news and bad news alike. */}
                      {outcomeCopy[app.status] && (
                        <div
                          className={
                            "rounded-xl p-3 " +
                            (app.outcomePublishedAt
                              ? "bg-[var(--olivea-cream)]/30"
                              : "bg-amber-50/70 ring-1 ring-amber-200/70")
                          }
                        >
                          <span className={cls.label}>
                            {t({ es: "El candidato ve", en: "The applicant sees" })}
                          </span>
                          {app.outcomePublishedAt ? (
                            <p className="mt-1 text-sm text-[var(--olivea-ink)]/80">
                              {t(outcomeCopy[app.status]!.published)}
                            </p>
                          ) : (
                            <>
                              <p className="mt-1 text-sm text-[var(--olivea-ink)]/80">
                                {t(outcomeCopy[app.status]!.held)}
                              </p>
                              <button
                                type="button"
                                disabled={publishBusy === app.id}
                                onClick={async () => {
                                  const ok = window.confirm(
                                    t(outcomeCopy[app.status]!.confirm)
                                  );
                                  if (!ok) return;
                                  setPublishBusy(app.id);
                                  try {
                                    await publishApplicationOutcome(app.id);
                                    setApplications((apps) =>
                                      apps.map((a) =>
                                        a.id === app.id
                                          ? { ...a, outcomePublishedAt: new Date().toISOString() }
                                          : a
                                      )
                                    );
                                    toast(t({ es: "Resultado publicado", en: "Outcome published" }), "success");
                                  } finally {
                                    setPublishBusy(null);
                                  }
                                }}
                                className="mt-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-[var(--olivea-olive)] text-white hover:opacity-90 disabled:opacity-50"
                              >
                                {publishBusy === app.id
                                  ? t({ es: "Publicando…", en: "Publishing…" })
                                  : t({ es: "Publicar el resultado", en: "Publish the outcome" })}
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <span className={cls.label}>
                          {t({ es: "Notas", en: "Notes" })} ({app.notes.length})
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
                            placeholder={t({ es: "Agrega una nota…", en: "Add a note…" })}
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
              ? t({ es: "Aún no hay postulaciones. Aparecerán aquí cuando los candidatos apliquen.", en: "No applications yet. They'll appear here when candidates apply." })
              : t({ es: "Ninguna postulación coincide con tus filtros.", en: "No applications match your filters." })}
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
  const { t } = useAdminLocale();

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
      toast(t({ es: "Contenido de la página guardado", en: "Page content saved" }), "success");
    } catch {
      toast(t({ es: "No se pudo guardar el contenido", en: "Failed to save page content" }), "error");
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
          {t({ es: "SEO / Metadatos", en: "SEO / Meta" })}
        </h3>
        <div className="space-y-4">
          <BiInput
            label={{ es: "Título de la página", en: "Page title" }}
            value={data.meta.title}
            onChange={(v) =>
              setData({ ...data, meta: { ...data.meta, title: v } })
            }
          />
          <BiInput
            label={{ es: "Descripción SEO", en: "Meta description" }}
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
          {t({ es: "Sección principal", en: "Hero Section" })}
        </h3>
        <div className="space-y-4">
          <BiInput
            label={{ es: "Antetítulo", en: "Kicker" }}
            value={data.hero.kicker}
            onChange={(v) =>
              setData({ ...data, hero: { ...data.hero, kicker: v } })
            }
          />
          <BiInput
            label={{ es: "Título", en: "Headline" }}
            value={data.hero.headline}
            onChange={(v) =>
              setData({ ...data, hero: { ...data.hero, headline: v } })
            }
          />
          <BiInput
            label={{ es: "Descripción", en: "Description" }}
            value={data.hero.description}
            onChange={(v) =>
              setData({ ...data, hero: { ...data.hero, description: v } })
            }
            multiline
          />
          <div className="space-y-1">
            <p className={cls.label}>{t({ es: "URL de la imagen principal", en: "Hero image URL" })}</p>
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
          {t({ es: "Sección de postulación", en: "Application Section" })}
        </h3>
        <div className="space-y-4">
          <BiInput
            label={{ es: "Título", en: "Title" }}
            value={data.application.title}
            onChange={(v) =>
              setData({ ...data, application: { ...data.application, title: v } })
            }
          />
          <BiInput
            label={{ es: "Descripción", en: "Description" }}
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
            {t({ es: "Guardar contenido", en: "Save page content" })}
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
  const { t } = useAdminLocale();

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
        {tabs.map((tabItem) => {
          const Icon = tabItem.icon;
          const active = tab === tabItem.key;
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
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
              {t(tabItem.label)}
              {tabItem.key === "applications" && applications.length > 0 && (
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
