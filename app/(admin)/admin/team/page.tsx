// app/(admin)/admin/team/page.tsx
// ─────────────────────────────────────────────────────────────────────
// Team management page — Roseiies Studio-style with per-section
// permissions.  Left: member list.  Right: detail panel with
// category pill tabs and section permission matrix.
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Clock,
  X,
  Check,
  Crown,
  Eye,
  Pencil,
  AlertTriangle,
  ExternalLink,
  FileText,
  Layers,
  Settings,
} from "lucide-react";
import { useAuth } from "@/components/admin/AuthProvider";
import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMemberRole,
  updateSectionPermissions,
  removeTeamMember,
} from "@/lib/auth/actions";
import type {
  AdminRole,
  AdminUser,
  SectionAccess,
  SectionPermissions,
} from "@/lib/auth/types";
import {
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  SECTION_ACCESS_HIERARCHY,
  SECTION_ACCESS_LABELS,
  ADMIN_SECTIONS,
  defaultSectionAccess,
} from "@/lib/auth/types";

/* ── Animation variants ── */

const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];

const listItem = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: cinematic },
  }),
  exit: { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

const panelReveal = {
  hidden: { opacity: 0, x: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: cinematic },
  },
  exit: {
    opacity: 0,
    x: 24,
    scale: 0.98,
    transition: { duration: 0.25 },
  },
};

const sectionRow = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.025, duration: 0.35, ease: cinematic },
  }),
};

/* ── Category config ── */

const CATEGORIES = ["pages", "content", "settings"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_META: Record<Category, { label: string; icon: typeof FileText; description: string }> = {
  pages:    { label: "Pages",    icon: FileText, description: "Homepage, Farm to Table, Casa, and more" },
  content:  { label: "Content",  icon: Layers,   description: "Journal, popups, banners, FAQ, media" },
  settings: { label: "Settings", icon: Settings,  description: "Global, navigation, footer, hours" },
};

/* ── Confirm modal ── */

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  variant = "danger",
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning";
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/25 backdrop-blur-[6px] z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.35, ease: cinematic }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-[380px]"
          >
            <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(94,118,88,0.06)] overflow-hidden">
              <div className={`h-1 ${variant === "danger" ? "bg-gradient-to-r from-red-400 via-red-500 to-red-400" : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"}`} />
              <div className="p-6">
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 18 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4
                    ${variant === "danger" ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"}`}
                >
                  {variant === "danger" ? (
                    <Trash2 size={20} className="text-red-500" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-500" />
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3, ease: cinematic }}
                  className="text-center"
                >
                  <h3 className="text-base font-semibold text-[#2d3b29]">{title}</h3>
                  <p className="text-sm text-[#6b7a65] mt-1.5 leading-relaxed">{message}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.3, ease: cinematic }}
                  className="flex gap-3 mt-6"
                >
                  <button
                    ref={cancelRef}
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium
                      border border-[#5e7658]/12 text-[#6b7a65]
                      hover:bg-[#f4f5f0] hover:border-[#5e7658]/20
                      focus:outline-none focus:ring-2 focus:ring-[#5e7658]/15
                      transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium
                      text-white transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${variant === "danger"
                        ? "bg-red-500 hover:bg-red-600 focus:ring-red-300 shadow-[0_2px_12px_rgba(239,68,68,0.25)]"
                        : "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 shadow-[0_2px_12px_rgba(245,158,11,0.25)]"
                      }`}
                  >
                    {confirmLabel}
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Avatar ── */

const AVATAR_COLORS = [
  "from-[#6b7a65] to-[#5e7658]",
  "from-[#c9a96e] to-[#b8944f]",
  "from-[#7a8b9c] to-[#5d7080]",
  "from-[#9b7a6e] to-[#8a6455]",
  "from-[#7a6b9b] to-[#635580]",
  "from-[#6b9b7a] to-[#558065]",
  "from-[#9b8a6b] to-[#807255]",
  "from-[#6b8a9b] to-[#557280]",
];

function Avatar({
  name,
  url,
  size = 40,
  className = "",
}: {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Deterministic color based on name
  const colorIdx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;

  return (
    <div
      className={`rounded-full overflow-hidden bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span
          className="text-white font-bold"
          style={{ fontSize: size * 0.32 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/* ── Role badge (inline with name, like Roseiies) ── */

function RoleBadge({ role }: { role: AdminRole }) {
  const styles: Record<AdminRole, string> = {
    owner: "bg-[#c9a96e]/12 text-[#c9a96e] border-[#c9a96e]/20",
    manager: "bg-violet-50 text-violet-700 border-violet-200/60",
    editor: "bg-amber-50 text-amber-700 border-amber-200/60",
    host: "bg-sky-50 text-sky-600 border-sky-200/60",
  };

  const icons: Record<AdminRole, typeof Shield> = {
    owner: Crown,
    manager: Shield,
    editor: Pencil,
    host: Eye,
  };

  const Icon = icons[role];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${styles[role]}`}
    >
      <Icon size={10} />
      {ROLE_LABELS[role]}
    </span>
  );
}

/* ── Invite modal (Roseiies-style: full permission matrix inline) ── */

function InviteModal({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [sectionPerms, setSectionPerms] = useState<SectionPermissions>({});
  const [activeCat, setActiveCat] = useState<Category>("pages");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function setAccess(sectionKey: string, access: SectionAccess) {
    const inherited = defaultSectionAccess(role);
    const newPerms = { ...sectionPerms };
    if (access === inherited) {
      delete newPerms[sectionKey];
    } else {
      newPerms[sectionKey] = access;
    }
    setSectionPerms(newPerms);
  }

  function handleRoleChange(newRole: AdminRole) {
    setRole(newRole);
    setSectionPerms({});
  }

  function overridesInCat(cat: Category): number {
    return ADMIN_SECTIONS.filter((s) => s.category === cat && sectionPerms[s.key]).length;
  }

  function resetForm() {
    setStep(1);
    setEmail("");
    setFullName("");
    setRole("editor");
    setSectionPerms({});
    setActiveCat("pages");
    setError("");
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await inviteTeamMember(email, role, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        if (result.userId && Object.keys(sectionPerms).length > 0) {
          await updateSectionPermissions(result.userId, sectionPerms);
        }
        resetForm();
        onInvited();
        onClose();
      }
    });
  }

  const activeSections = ADMIN_SECTIONS.filter((s) => s.category === activeCat);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: cinematic }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              w-full max-w-[620px] max-h-[88vh] flex flex-col
              bg-white rounded-2xl shadow-2xl border border-[#5e7658]/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#5e7658]/[0.06] flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-[#2d3b29] flex items-center gap-2">
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  >
                    <UserPlus size={18} className="text-[#5e7658]" />
                  </motion.div>
                  Agregar miembro
                </h2>
                <p className="text-[11px] text-[#6b7a65] mt-0.5">
                  {step === 1 ? "Información básica y rol global" : "Personaliza el acceso por sección"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? "bg-[#5e7658]" : "bg-[#5e7658]/20"}`} />
                  <div className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? "bg-[#5e7658]" : "bg-[#5e7658]/20"}`} />
                </div>
                <button
                  onClick={() => { resetForm(); onClose(); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: "none" }}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: cinematic }}
                    className="space-y-4"
                  >
                    {/* Name + Email side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="invite-name" className="block text-[11px] font-medium text-[#2d3b29] mb-1.5">
                          Nombre completo
                        </label>
                        <input
                          id="invite-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="María García"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-[#5e7658]/15
                            text-[#2d3b29] placeholder:text-[#6b7a65]/40
                            focus:outline-none focus:ring-2 focus:ring-[#5e7658]/20 focus:border-[#5e7658]/30
                            transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="invite-email" className="block text-[11px] font-medium text-[#2d3b29] mb-1.5">
                          Correo electrónico
                        </label>
                        <input
                          id="invite-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="maria@ejemplo.com"
                          className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-[#5e7658]/15
                            text-[#2d3b29] placeholder:text-[#6b7a65]/40
                            focus:outline-none focus:ring-2 focus:ring-[#5e7658]/20 focus:border-[#5e7658]/30
                            transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Role selector */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#2d3b29] mb-2">Rol global</label>
                      <div className="grid grid-cols-3 gap-2">
                        {ROLE_HIERARCHY.filter((r) => r !== "owner").map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleRoleChange(r)}
                            className={`
                              flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-center
                              border transition-all duration-200
                              ${role === r
                                ? "border-[#5e7658]/30 bg-[#5e7658]/[0.06] ring-1 ring-[#5e7658]/10"
                                : "border-[#5e7658]/10 hover:border-[#5e7658]/20 hover:bg-[#f4f5f0]/50"
                              }
                            `}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                transition-all duration-200
                                ${role === r ? "border-[#5e7658] bg-[#5e7658]" : "border-[#6b7a65]/30"}`}
                            >
                              {role === r && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-xs font-semibold text-[#2d3b29]">{ROLE_LABELS[r]}</span>
                            <p className="text-[9px] text-[#6b7a65] leading-tight">{ROLE_DESCRIPTIONS[r]}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview: what this role gets */}
                    <div className="bg-[#f4f5f0]/60 rounded-xl p-3 border border-[#5e7658]/[0.06]">
                      <p className="text-[10px] font-semibold text-[#6b7a65] uppercase tracking-wider mb-1.5">
                        Acceso predeterminado
                      </p>
                      <p className="text-[11px] text-[#6b7a65]/80 leading-relaxed">
                        Con el rol <span className="font-semibold text-[#2d3b29]">{ROLE_LABELS[role]}</span>,
                        todas las secciones tendrán acceso{" "}
                        <span className="font-semibold text-[#5e7658]">
                          {SECTION_ACCESS_LABELS[defaultSectionAccess(role)]}
                        </span>{" "}
                        por defecto. En el siguiente paso podrás personalizar el acceso por sección.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: cinematic }}
                  >
                    {/* Description */}
                    <p className="text-[11px] text-[#6b7a65]/70 mb-4 leading-relaxed">
                      Cada sección tiene su propio nivel de acceso. Elige exactamente qué
                      puede ver o editar <span className="font-semibold text-[#2d3b29]">{fullName || "este miembro"}</span> — o
                      deja en <span className="font-medium text-[#5e7658]">Heredar</span> para
                      seguir el rol <span className="font-medium">{ROLE_LABELS[role]}</span>.
                    </p>

                    {/* Category pill tabs */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {CATEGORIES.map((cat) => {
                        const meta = CATEGORY_META[cat];
                        const CatIcon = meta.icon;
                        const isActive = activeCat === cat;
                        const overrides = overridesInCat(cat);

                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCat(cat)}
                            className={`
                              inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium
                              border transition-all duration-200
                              ${isActive
                                ? "bg-[#5e7658] text-white border-[#5e7658] shadow-[0_2px_8px_rgba(94,118,88,0.25)]"
                                : "bg-white text-[#6b7a65] border-[#5e7658]/12 hover:border-[#5e7658]/25 hover:bg-[#f4f5f0]"
                              }
                            `}
                          >
                            <CatIcon size={13} strokeWidth={isActive ? 2 : 1.5} />
                            {meta.label}
                            {overrides > 0 && (
                              <span className={`
                                text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5
                                ${isActive ? "bg-white/20 text-white" : "bg-[#5e7658]/10 text-[#5e7658]"}
                              `}>
                                {overrides}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Section permission matrix */}
                    <div className="border border-[#5e7658]/[0.06] rounded-2xl overflow-hidden divide-y divide-[#5e7658]/[0.04]">
                      {activeSections.map((section, i) => {
                        const currentAccess = sectionPerms[section.key] ?? defaultSectionAccess(role);
                        const isInherited = !sectionPerms[section.key];

                        return (
                          <motion.div
                            key={section.key}
                            custom={i}
                            variants={sectionRow}
                            initial="hidden"
                            animate="visible"
                            className="flex items-center gap-3 py-3 px-4 hover:bg-[#f4f5f0]/40 transition-colors"
                          >
                            <span className="text-[13px] text-[#2d3b29] flex-1 min-w-0 truncate">
                              {section.label}
                            </span>
                            <div className="flex">
                              {SECTION_ACCESS_HIERARCHY.map((access) => {
                                const isThis = currentAccess === access;
                                const isInheritedActive = isThis && isInherited;

                                return (
                                  <button
                                    key={access}
                                    type="button"
                                    onClick={() => setAccess(section.key, access)}
                                    className={`
                                      w-[52px] py-1.5 text-center text-[10px] font-semibold
                                      transition-all duration-200 rounded-lg
                                      ${isThis
                                        ? isInheritedActive
                                          ? "bg-[#5e7658]/15 text-[#5e7658]"
                                          : access === "maestro" ? "bg-[#5e7658] text-white shadow-sm"
                                          : access === "editor" ? "bg-amber-500 text-white shadow-sm"
                                          : access === "viewer" ? "bg-sky-500 text-white shadow-sm"
                                          : "bg-gray-400 text-white shadow-sm"
                                        : "text-[#6b7a65]/30 hover:text-[#6b7a65]/60 hover:bg-[#f4f5f0]"
                                      }
                                    `}
                                  >
                                    {access === "maestro"
                                      ? isInheritedActive ? "Heredar" : "Maestro"
                                      : access === "viewer" ? "Ver"
                                      : access === "editor" ? "Editar"
                                      : "Oculto"}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-[#5e7658]/[0.06] bg-[#f4f5f0]/30">
              {error && (
                <div className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</div>
              )}
              <div className="flex gap-3">
                {step === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { resetForm(); onClose(); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium
                        border border-[#5e7658]/15 text-[#6b7a65] hover:bg-white transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim() || !email.trim()) {
                          setError("Nombre y correo son requeridos");
                          return;
                        }
                        setError("");
                        setStep(2);
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium
                        bg-[#5e7658] text-white hover:bg-[#4a6046]
                        transition-all duration-200 shadow-[0_2px_8px_rgba(94,118,88,0.2)]"
                    >
                      Siguiente — Permisos
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-2.5 px-5 rounded-xl text-sm font-medium
                        border border-[#5e7658]/15 text-[#6b7a65] hover:bg-white transition-all duration-200"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPending}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium
                        bg-[#5e7658] text-white hover:bg-[#4a6046]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 shadow-[0_2px_8px_rgba(94,118,88,0.2)]
                        flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        "Enviando..."
                      ) : (
                        <>
                          <UserPlus size={14} />
                          Enviar invitación
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Detail panel (Roseiies-style with pill tabs) ── */

function DetailPanel({
  member,
  currentUserId,
  onRoleChange,
  onPermissionsChange,
  onRemove,
  isPending,
}: {
  member: AdminUser;
  currentUserId?: string;
  onRoleChange: (role: AdminRole) => void;
  onPermissionsChange: (perms: SectionPermissions) => void;
  onRemove: () => void;
  isPending: boolean;
}) {
  const isOwner = member.role === "owner";
  const isSelf = member.id === currentUserId;
  const perms = member.sectionPermissions ?? {};
  const [activeCat, setActiveCat] = useState<Category>("pages");

  const activeSections = ADMIN_SECTIONS.filter((s) => s.category === activeCat);

  function setAccess(sectionKey: string, access: SectionAccess) {
    const inherited = defaultSectionAccess(member.role);
    const newPerms = { ...perms };
    if (access === inherited) {
      delete newPerms[sectionKey];
    } else {
      newPerms[sectionKey] = access;
    }
    onPermissionsChange(newPerms);
  }

  function resetAllToInherit() {
    onPermissionsChange({});
  }

  // Count overrides per category
  function overridesInCat(cat: Category): number {
    return ADMIN_SECTIONS.filter((s) => s.category === cat && perms[s.key]).length;
  }

  return (
    <motion.div
      key={member.id}
      variants={panelReveal}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col"
    >
      {/* ─── Header ─── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-[#5e7658]/[0.06]">
        <div className="flex items-start gap-4">
          <Avatar name={member.fullName} url={member.avatarUrl} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-semibold text-[#2d3b29] truncate">
                {member.fullName}
              </h2>
              <RoleBadge role={member.role} />
            </div>
            <p className="text-xs text-[#6b7a65] mt-1">{member.email}</p>
            <p className="text-[10px] text-[#6b7a65]/60 flex items-center gap-1 mt-1">
              <Clock size={9} />
              Última actividad:{" "}
              {member.lastActiveAt
                ? new Date(member.lastActiveAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Nunca"}
            </p>
          </div>

          {/* Remove button */}
          {!isOwner && !isSelf && (
            <button
              onClick={onRemove}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium
                text-red-400 hover:text-white hover:bg-red-500
                border border-red-200/60 hover:border-red-500
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200 flex-shrink-0"
            >
              <Trash2 size={12} />
              Erase
            </button>
          )}
        </div>

        {/* Global role selector */}
        {!isOwner && !isSelf && (
          <div className="mt-4">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6b7a65] mb-2">
              Global Role
            </label>
            <div className="flex gap-1.5">
              {ROLE_HIERARCHY.filter((r) => r !== "owner").map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  disabled={isPending}
                  className={`
                    flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300 ease-out
                    ${member.role === r
                      ? "bg-[#5e7658] text-white shadow-[0_2px_12px_rgba(94,118,88,0.25)]"
                      : "text-[#6b7a65] hover:bg-[#f4f5f0] border border-[#5e7658]/10"
                    }
                    disabled:opacity-40 disabled:cursor-not-allowed
                  `}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Section permissions (scrollable) ─── */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5 team-sections-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`.team-sections-scroll::-webkit-scrollbar { display: none; }`}</style>

        {/* Heading */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b7a65]">
            Acceso a Secciones
          </h3>
          {Object.keys(perms).length > 0 && !isOwner && (
            <button
              onClick={resetAllToInherit}
              disabled={isPending}
              className="text-[10px] font-medium text-[#5e7658] hover:text-[#4a6046]
                px-2 py-1 rounded-lg hover:bg-[#5e7658]/5 transition-all"
            >
              Reset all
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#6b7a65]/70 mb-5 leading-relaxed">
          Cada sección tiene su propio nivel de acceso. Abajo, elige exactamente
          qué secciones puede ver o editar — o deja en{" "}
          <span className="font-medium text-[#5e7658]">Heredar</span> para
          seguir el rol global.
        </p>

        {/* ─── Category pill tabs (like Roseiies app tabs) ─── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const CatIcon = meta.icon;
            const isActive = activeCat === cat;
            const overrides = overridesInCat(cat);

            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium
                  border transition-all duration-200
                  ${isActive
                    ? "bg-[#5e7658] text-white border-[#5e7658] shadow-[0_2px_8px_rgba(94,118,88,0.25)]"
                    : "bg-white text-[#6b7a65] border-[#5e7658]/12 hover:border-[#5e7658]/25 hover:bg-[#f4f5f0]"
                  }
                `}
              >
                <CatIcon size={13} strokeWidth={isActive ? 2 : 1.5} />
                {meta.label}
                {overrides > 0 && (
                  <span className={`
                    text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5
                    ${isActive ? "bg-white/20 text-white" : "bg-[#5e7658]/10 text-[#5e7658]"}
                  `}>
                    {overrides}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Active category section + description ─── */}
        <div className="mb-4">
          <div className="flex items-center gap-2.5 mb-1">
            {(() => {
              const CatIcon = CATEGORY_META[activeCat].icon;
              return <CatIcon size={18} className="text-[#5e7658]" />;
            })()}
            <span className="text-sm font-semibold text-[#2d3b29]">
              {CATEGORY_META[activeCat].label}
            </span>
            {isOwner && (
              <span className="text-[10px] text-[#6b7a65]/60 ml-auto">
                Heredado del propietario
              </span>
            )}
          </div>
        </div>

        {/* ─── Section permission matrix ─── */}
        {/* Column headers */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7a65]/50 flex-1">
            Secciones
          </span>
          <div className="flex">
            {SECTION_ACCESS_HIERARCHY.map((access) => (
              <span
                key={access}
                className="w-[52px] text-center text-[9px] font-semibold uppercase tracking-wider text-[#6b7a65]/40"
              >
                {access === "viewer" ? "Ver" : access === "editor" ? "Editar" : access === "maestro" ? "Heredar" : "Oculto"}
              </span>
            ))}
          </div>
        </div>

        {/* Section rows */}
        <div className="border border-[#5e7658]/[0.06] rounded-2xl overflow-hidden divide-y divide-[#5e7658]/[0.04]">
          {activeSections.map((section, i) => {
            const currentAccess = perms[section.key] ?? defaultSectionAccess(member.role);
            const isInherited = !perms[section.key];

            return (
              <motion.div
                key={section.key}
                custom={i}
                variants={sectionRow}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-3 py-3 px-4 hover:bg-[#f4f5f0]/40 transition-colors group"
              >
                {/* Section name — clickable link */}
                {section.href ? (
                  <Link
                    href={section.href}
                    className="text-[13px] text-[#2d3b29] flex-1 min-w-0 truncate
                      hover:text-[#5e7658] hover:underline underline-offset-2
                      transition-colors duration-200 flex items-center gap-1.5 group/link"
                  >
                    {section.label}
                    <ExternalLink
                      size={10}
                      className="opacity-0 group-hover/link:opacity-50 transition-opacity flex-shrink-0"
                    />
                  </Link>
                ) : (
                  <span className="text-[13px] text-[#2d3b29] flex-1 min-w-0 truncate">
                    {section.label}
                  </span>
                )}

                {/* Permission radio buttons */}
                <div className="flex">
                  {SECTION_ACCESS_HIERARCHY.map((access) => {
                    const isThis = currentAccess === access;
                    const isInheritedActive = isThis && isInherited;

                    return (
                      <button
                        key={access}
                        onClick={() => setAccess(section.key, access)}
                        disabled={isOwner || isPending}
                        className={`
                          w-[52px] py-1.5 text-center text-[10px] font-semibold
                          transition-all duration-200 rounded-lg
                          disabled:cursor-not-allowed
                          ${isThis
                            ? isInheritedActive
                              ? "bg-[#5e7658]/15 text-[#5e7658]"
                              : access === "maestro"
                                ? "bg-[#5e7658] text-white shadow-sm"
                                : access === "editor"
                                  ? "bg-amber-500 text-white shadow-sm"
                                  : access === "viewer"
                                    ? "bg-sky-500 text-white shadow-sm"
                                    : "bg-gray-400 text-white shadow-sm"
                            : "text-[#6b7a65]/30 hover:text-[#6b7a65]/60 hover:bg-[#f4f5f0] disabled:hover:bg-transparent disabled:hover:text-[#6b7a65]/30"
                          }
                        `}
                      >
                        {access === "maestro"
                          ? isInheritedActive ? "Heredar" : "Maestro"
                          : access === "viewer" ? "Ver"
                          : access === "editor" ? "Editar"
                          : "Oculto"}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ── */

export default function TeamPage() {
  const { user: currentUser, canManageTeam: isOwner } = useAuth();
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMembers = useCallback(async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
      setSelectedId((prev) => {
        if (!prev && data.length > 0) return data[0].id;
        return prev;
      });
    } catch {
      // requireRole will redirect if not owner
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const selectedMember = members.find((m) => m.id === selectedId);

  function handleRoleChange(userId: string, newRole: AdminRole) {
    startTransition(async () => {
      await updateTeamMemberRole(userId, newRole);
      await loadMembers();
    });
  }

  function handlePermissionsChange(userId: string, perms: SectionPermissions) {
    startTransition(async () => {
      await updateSectionPermissions(userId, perms);
      await loadMembers();
    });
  }

  function handleRemove(userId: string, name: string) {
    setConfirmRemove({ id: userId, name });
  }

  function executeRemove() {
    if (!confirmRemove) return;
    const userId = confirmRemove.id;
    setConfirmRemove(null);
    startTransition(async () => {
      await removeTeamMember(userId);
      setSelectedId(null);
      await loadMembers();
    });
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: cinematic }}
        >
          <Shield size={48} className="mx-auto mb-4 text-[#5e7658]/20" />
          <h1 className="text-xl font-semibold text-[#2d3b29] mb-2">Access Restricted</h1>
          <p className="text-sm text-[#6b7a65]">
            Only the account owner can manage team members and permissions.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* ─── Left: Member list ─── */}
      <div className="w-[280px] flex-shrink-0 border-r border-[#5e7658]/[0.06] flex flex-col bg-white/30">
        {/* Header */}
        <div className="px-4 py-4 border-b border-[#5e7658]/[0.06]">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold text-[#2d3b29]">Equipo</h1>
            <span className="text-[10px] text-[#6b7a65] bg-[#f4f5f0] px-2 py-0.5 rounded-full font-medium">
              {members.length} miembros
            </span>
          </div>
        </div>

        {/* Invite button */}
        <div className="px-3 py-2">
          <button
            onClick={() => setInviteOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
              text-xs font-medium text-[#5e7658]
              border border-dashed border-[#5e7658]/20
              hover:bg-[#5e7658]/[0.04] hover:border-[#5e7658]/30
              transition-all duration-200"
          >
            <UserPlus size={14} />
            Agregar miembro
          </button>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {isLoading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-[#f4f5f0]/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {members.map((member, i) => {
                const isSelected = selectedId === member.id;
                const sectionCount = Object.keys(member.sectionPermissions ?? {}).length;

                return (
                  <motion.button
                    key={member.id}
                    custom={i}
                    variants={listItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    onClick={() => setSelectedId(member.id)}
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5
                      transition-all duration-200 text-left
                      ${isSelected
                        ? "bg-[#5e7658]/[0.08] shadow-[0_1px_4px_rgba(94,118,88,0.06)]"
                        : "hover:bg-[#f4f5f0]/80"
                      }
                    `}
                  >
                    {/* Active indicator bar */}
                    {isSelected && (
                      <motion.div
                        layoutId="team-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-full bg-[#5e7658]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Avatar name={member.fullName} url={member.avatarUrl} size={38} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${isSelected ? "font-semibold text-[#2d3b29]" : "font-medium text-[#2d3b29]"}`}>
                          {member.fullName}
                        </span>
                        {member.id === currentUser?.id && (
                          <span className="text-[8px] text-[#6b7a65] bg-[#f4f5f0] px-1 py-0.5 rounded font-medium flex-shrink-0">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {member.role === "owner" ? (
                          <span className="text-[10px] font-semibold text-[#c9a96e]">
                            {ROLE_LABELS[member.role]}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#6b7a65]">
                            {member.email}
                          </span>
                        )}
                      </div>
                      {!isSelected && sectionCount > 0 && (
                        <span className="text-[9px] text-[#5e7658]/60 mt-0.5 block">
                          {sectionCount} override{sectionCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ─── Right: Detail panel ─── */}
      <div className="flex-1 bg-[#f4f5f0]/30 overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedMember ? (
            <DetailPanel
              key={selectedMember.id}
              member={selectedMember}
              currentUserId={currentUser?.id}
              onRoleChange={(role) => handleRoleChange(selectedMember.id, role)}
              onPermissionsChange={(perms) => handlePermissionsChange(selectedMember.id, perms)}
              onRemove={() => handleRemove(selectedMember.id, selectedMember.fullName)}
              isPending={isPending}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center">
                <Users size={40} className="mx-auto mb-3 text-[#5e7658]/15" />
                <p className="text-sm text-[#6b7a65]/50">
                  Selecciona un miembro del equipo para gestionar permisos
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={loadMembers}
      />

      {/* Confirm remove modal */}
      <ConfirmModal
        open={!!confirmRemove}
        title="Eliminar miembro"
        message={`¿Estás segura de que quieres eliminar a ${confirmRemove?.name ?? "este miembro"} del equipo? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={executeRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
