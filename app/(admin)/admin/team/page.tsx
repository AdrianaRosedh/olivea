// app/(admin)/admin/team/page.tsx
// ─────────────────────────────────────────────────────────────────────
// Team management page — Roseiies-style with per-section permissions.
// Left: member list. Right: detail panel with permission grid.
// ─────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Trash2,
  Clock,
  X,
  Check,
  Crown,
  Eye,
  Pencil,
  Sparkles,
  AlertTriangle,
  ExternalLink,
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
    transition: { delay: 0.15 + i * 0.02, duration: 0.35, ease: cinematic },
  }),
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

  // Auto-focus cancel button on open
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  // Close on Escape
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/25 backdrop-blur-[6px] z-[60]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]
              w-full max-w-[380px]"
          >
            <div className="bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(94,118,88,0.06)] overflow-hidden">
              {/* Top accent bar */}
              <div className={`h-1 ${variant === "danger" ? "bg-gradient-to-r from-red-400 via-red-500 to-red-400" : "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"}`} />

              <div className="p-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 18 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4
                    ${variant === "danger"
                      ? "bg-red-50 border border-red-100"
                      : "bg-amber-50 border border-amber-100"
                    }`}
                >
                  {variant === "danger" ? (
                    <Trash2 size={20} className="text-red-500" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-500" />
                  )}
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <h3 className="text-base font-semibold text-[#2d3b29]">{title}</h3>
                  <p className="text-sm text-[#6b7a65] mt-1.5 leading-relaxed">{message}</p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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

  return (
    <div
      className={`rounded-full overflow-hidden bg-gradient-to-br from-[#6b7a65] to-[#5e7658] flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <span
          className="text-white font-bold"
          style={{ fontSize: size * 0.3 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/* ── Role badge ── */

function RoleBadge({ role }: { role: AdminRole }) {
  const styles: Record<AdminRole, string> = {
    owner: "bg-[#c9a96e]/10 text-[#c9a96e] border-[#c9a96e]/20",
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${styles[role]}`}
    >
      <Icon size={11} />
      {ROLE_LABELS[role]}
    </span>
  );
}

/* ── Section access button ── */

function AccessButton({
  access,
  isActive,
  isInherited,
  onClick,
  disabled,
}: {
  access: SectionAccess;
  isActive: boolean;
  isInherited: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const baseStyles: Record<SectionAccess, string> = {
    maestro: "bg-[#5e7658] text-white shadow-[0_2px_8px_rgba(94,118,88,0.3)]",
    editor: "bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]",
    viewer: "bg-sky-500 text-white shadow-[0_2px_8px_rgba(14,165,233,0.3)]",
    hidden: "bg-gray-400 text-white shadow-[0_2px_8px_rgba(156,163,175,0.3)]",
  };

  const inheritedStyles: Record<SectionAccess, string> = {
    maestro: "bg-[#5e7658]/15 text-[#5e7658] border-[#5e7658]/20",
    editor: "bg-amber-50 text-amber-600 border-amber-200/60",
    viewer: "bg-sky-50 text-sky-600 border-sky-200/60",
    hidden: "bg-gray-50 text-gray-400 border-gray-200/60",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-3 py-1.5 rounded-lg text-[11px] font-semibold
        transition-all duration-300 ease-out
        disabled:opacity-30 disabled:cursor-not-allowed
        ${isActive
          ? isInherited
            ? `${inheritedStyles[access]} border`
            : baseStyles[access]
          : "text-[#6b7a65]/40 hover:text-[#6b7a65]/70 hover:bg-[#f4f5f0]"
        }
      `}
    >
      {SECTION_ACCESS_LABELS[access]}
      {isActive && isInherited && (
        <span className="ml-1 text-[9px] opacity-60">Heredar</span>
      )}
    </button>
  );
}

/* ── Invite modal ── */

function InviteModal({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [sectionPerms, setSectionPerms] = useState<SectionPermissions>({});
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const categories = ["pages", "content", "settings"] as const;
  const categoryLabels = { pages: "Pages", content: "Content", settings: "Settings" };

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

  // Reset section perms when role changes (inherited defaults change)
  function handleRoleChange(newRole: AdminRole) {
    setRole(newRole);
    setSectionPerms({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await inviteTeamMember(email, role, fullName);
      if (result.error) {
        setError(result.error);
      } else {
        // Save section permissions if any overrides were set
        if (result.userId && Object.keys(sectionPerms).length > 0) {
          await updateSectionPermissions(result.userId, sectionPerms);
        }
        setEmail("");
        setFullName("");
        setRole("editor");
        setSectionPerms({});
        setShowPermissions(false);
        onInvited();
        onClose();
      }
    });
  }

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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              w-full max-w-md bg-white rounded-2xl shadow-2xl
              border border-[#5e7658]/10 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#2d3b29] flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <UserPlus size={18} className="text-[#5e7658]" />
                </motion.div>
                Invite Team Member
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="invite-name"
                  className="block text-xs font-medium text-[#2d3b29] mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="invite-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-[#5e7658]/15
                    text-[#2d3b29] placeholder:text-[#6b7a65]/50
                    focus:outline-none focus:ring-2 focus:ring-[#5e7658]/20 focus:border-[#5e7658]/30
                    transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-xs font-medium text-[#2d3b29] mb-1.5"
                >
                  Email
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane@casaolivea.com"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white border border-[#5e7658]/15
                    text-[#2d3b29] placeholder:text-[#6b7a65]/50
                    focus:outline-none focus:ring-2 focus:ring-[#5e7658]/20 focus:border-[#5e7658]/30
                    transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2d3b29] mb-2">
                  Role
                </label>
                <div className="space-y-2">
                  {ROLE_HIERARCHY.filter((r) => r !== "owner").map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(r)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                        border transition-all duration-200
                        ${role === r
                          ? "border-[#5e7658]/30 bg-[#5e7658]/[0.04] ring-1 ring-[#5e7658]/10"
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
                      <div>
                        <span className="text-sm font-medium text-[#2d3b29]">
                          {ROLE_LABELS[r]}
                        </span>
                        <p className="text-[10px] text-[#6b7a65] mt-0.5">
                          {ROLE_DESCRIPTIONS[r]}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Per-section permissions (expandable) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="flex items-center gap-2 text-xs font-medium text-[#5e7658]
                    hover:text-[#4a6046] transition-colors"
                >
                  <motion.span
                    animate={{ rotate: showPermissions ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px]"
                  >
                    ▶
                  </motion.span>
                  Customize section access
                  {Object.keys(sectionPerms).length > 0 && (
                    <span className="text-[9px] bg-[#5e7658]/10 text-[#5e7658] px-1.5 py-0.5 rounded-full font-semibold">
                      {Object.keys(sectionPerms).length} override{Object.keys(sectionPerms).length !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showPermissions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 space-y-4">
                        <p className="text-[10px] text-[#6b7a65]/70">
                          Override per-section access or leave as inherited from {ROLE_LABELS[role]} role.
                        </p>
                        {categories.map((cat) => {
                          const sections = ADMIN_SECTIONS.filter((s) => s.category === cat);
                          return (
                            <div key={cat}>
                              <span className="text-[10px] font-semibold text-[#2d3b29] uppercase tracking-wider">
                                {categoryLabels[cat]}
                              </span>
                              <div className="mt-1.5 space-y-0.5">
                                {sections.map((section) => {
                                  const currentAccess =
                                    sectionPerms[section.key] ?? defaultSectionAccess(role);
                                  const isInherited = !sectionPerms[section.key];
                                  return (
                                    <div
                                      key={section.key}
                                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg
                                        hover:bg-[#f4f5f0]/60 transition-colors"
                                    >
                                      <span className="text-[11px] text-[#2d3b29] flex-1 min-w-0 truncate">
                                        {section.label}
                                      </span>
                                      <div className="flex gap-0.5">
                                        {SECTION_ACCESS_HIERARCHY.map((access) => (
                                          <button
                                            key={access}
                                            type="button"
                                            onClick={() => setAccess(section.key, access)}
                                            className={`
                                              px-2 py-1 rounded text-[9px] font-semibold
                                              transition-all duration-200
                                              ${currentAccess === access
                                                ? isInherited
                                                  ? "bg-[#5e7658]/10 text-[#5e7658] border border-[#5e7658]/15"
                                                  : access === "maestro"
                                                    ? "bg-[#5e7658] text-white"
                                                    : access === "editor"
                                                      ? "bg-amber-500 text-white"
                                                      : access === "viewer"
                                                        ? "bg-sky-500 text-white"
                                                        : "bg-gray-400 text-white"
                                                : "text-[#6b7a65]/30 hover:text-[#6b7a65]/60 hover:bg-[#f4f5f0]"
                                              }
                                            `}
                                          >
                                            {SECTION_ACCESS_LABELS[access]}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <div className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium
                    border border-[#5e7658]/15 text-[#6b7a65]
                    hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium
                    bg-[#5e7658] text-white hover:bg-[#4a6046]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-[0_2px_8px_rgba(94,118,88,0.2)]"
                >
                  {isPending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Detail panel ── */

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

  const categories = ["pages", "content", "settings"] as const;
  const categoryLabels = { pages: "Pages", content: "Content", settings: "Settings" };

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

  return (
    <motion.div
      key={member.id}
      variants={panelReveal}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full flex flex-col"
    >
      {/* Header — fixed, never scrolls */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#5e7658]/[0.06]">
        <div className="flex items-start gap-4">
          <Avatar name={member.fullName} url={member.avatarUrl} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#2d3b29] truncate">
                {member.fullName}
              </h2>
              {isOwner && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Crown size={16} className="text-[#c9a96e]" />
                </motion.div>
              )}
              {/* Delete button — right of name */}
              {!isOwner && !isSelf && (
                <button
                  onClick={onRemove}
                  disabled={isPending}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium
                    text-red-400 hover:text-white hover:bg-red-500
                    border border-red-200/60 hover:border-red-500
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  <Trash2 size={12} />
                  Erase
                </button>
              )}
            </div>
            <p className="text-xs text-[#6b7a65] flex items-center gap-1.5 mt-0.5">
              <Mail size={11} />
              {member.email}
            </p>
            <p className="text-[10px] text-[#6b7a65]/60 flex items-center gap-1 mt-1">
              <Clock size={9} />
              Last active: {member.lastActiveAt
                ? new Date(member.lastActiveAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Never"}
            </p>
          </div>
        </div>

        {/* Role selector */}
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
                    flex-1 py-2 rounded-xl text-xs font-medium
                    transition-all duration-300 ease-out
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

      {/* Section permissions — scrollable, hidden scrollbar */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 team-sections-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Hide webkit scrollbar via global style */}
        <style>{`.team-sections-scroll::-webkit-scrollbar { display: none; }`}</style>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6b7a65]">
              Acceso a Secciones
            </h3>
            <p className="text-[10px] text-[#6b7a65]/60 mt-0.5">
              Override per-section access — or leave as{" "}
              <span className="font-medium">Heredar</span> to follow the role default
            </p>
          </div>
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

        {categories.map((cat) => {
          const sections = ADMIN_SECTIONS.filter((s) => s.category === cat);
          return (
            <div key={cat} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-[#c9a96e]" />
                <span className="text-[11px] font-semibold text-[#2d3b29] uppercase tracking-wider">
                  {categoryLabels[cat]}
                </span>
              </div>

              <div className="space-y-1">
                {sections.map((section, i) => {
                  const currentAccess =
                    perms[section.key] ?? defaultSectionAccess(member.role);
                  const isInherited = !perms[section.key];

                  return (
                    <motion.div
                      key={section.key}
                      custom={i}
                      variants={sectionRow}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3 py-2 px-3 rounded-xl
                        hover:bg-[#f4f5f0]/60 transition-colors group"
                    >
                      {section.href ? (
                        <Link
                          href={section.href}
                          className="text-sm text-[#2d3b29] flex-1 min-w-0 truncate
                            hover:text-[#5e7658] hover:underline underline-offset-2
                            transition-colors duration-200 flex items-center gap-1.5 group/link"
                        >
                          {section.label}
                          <ExternalLink
                            size={10}
                            className="opacity-0 group-hover/link:opacity-60 transition-opacity flex-shrink-0"
                          />
                        </Link>
                      ) : (
                        <span className="text-sm text-[#2d3b29] flex-1 min-w-0 truncate">
                          {section.label}
                        </span>
                      )}

                      <div className="flex gap-1">
                        {SECTION_ACCESS_HIERARCHY.map((access) => (
                          <AccessButton
                            key={access}
                            access={access}
                            isActive={currentAccess === access}
                            isInherited={isInherited && currentAccess === access}
                            onClick={() => setAccess(section.key, access)}
                            disabled={isOwner || isPending}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
      // Auto-select first member if none selected
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
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Shield size={48} className="mx-auto mb-4 text-[#5e7658]/20" />
          <h1 className="text-xl font-semibold text-[#2d3b29] mb-2">
            Access Restricted
          </h1>
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
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-sm font-semibold text-[#2d3b29]">Equipo</h1>
            <span className="text-[10px] text-[#6b7a65] bg-[#f4f5f0] px-2 py-0.5 rounded-full font-medium">
              {members.length} members
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
            Add member
          </button>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {isLoading ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-[#f4f5f0]/60 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {members.map((member, i) => (
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
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5
                    transition-all duration-200 text-left
                    ${selectedId === member.id
                      ? "bg-[#5e7658]/[0.08] shadow-[0_1px_4px_rgba(94,118,88,0.06)]"
                      : "hover:bg-[#f4f5f0]/80"
                    }
                  `}
                >
                  <Avatar name={member.fullName} url={member.avatarUrl} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[#2d3b29] truncate">
                        {member.fullName}
                      </span>
                      {member.id === currentUser?.id && (
                        <span className="text-[8px] text-[#6b7a65] bg-[#f4f5f0] px-1 py-0.5 rounded font-medium flex-shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RoleBadge role={member.role} />
                    </div>
                  </div>

                  {/* Active indicator */}
                  {selectedId === member.id && (
                    <motion.div
                      layoutId="team-active"
                      className="w-[3px] h-8 rounded-full bg-[#5e7658] absolute left-0"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              ))}
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
              onRoleChange={(role) =>
                handleRoleChange(selectedMember.id, role)
              }
              onPermissionsChange={(perms) =>
                handlePermissionsChange(selectedMember.id, perms)
              }
              onRemove={() =>
                handleRemove(selectedMember.id, selectedMember.fullName)
              }
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
                  Select a team member to manage permissions
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
        title="Remove Team Member"
        message={`Are you sure you want to remove ${confirmRemove?.name ?? "this member"} from the team? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={executeRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
