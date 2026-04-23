"use client";

import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  Shield,
  Mail,
  User,
  Save,
  Check,
} from "lucide-react";
import type { AdminUser, AdminRole } from "@/lib/auth/types";
import { uploadImage } from "@/lib/supabase/storage-actions";
import { updateProfile } from "@/lib/auth/actions";
import { compressImage } from "@/lib/utils/compress-image";

/* ─── Role badge ─── */
function RoleBadge({ role }: { role: AdminRole }) {
  const config: Record<AdminRole, { label: string; className: string }> = {
    owner: {
      label: "Owner",
      className: "bg-[var(--olivea-olive)]/10 text-[var(--olivea-olive)] border-[var(--olivea-olive)]/15",
    },
    manager: {
      label: "Manager",
      className: "bg-violet-50 text-violet-700 border-violet-200/60",
    },
    editor: {
      label: "Editor",
      className: "bg-amber-50 text-amber-700 border-amber-200/60",
    },
    host: {
      label: "Host",
      className: "bg-sky-50 text-sky-600 border-sky-200/60",
    },
  };

  const { label, className } = config[role];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${className}`}>
      <Shield size={11} />
      {label}
    </span>
  );
}

/* ─── Avatar with upload overlay ─── */
function AvatarEditor({
  avatarUrl,
  initials,
  uploading,
  onImageSelect,
}: {
  avatarUrl?: string;
  initials: string;
  uploading: boolean;
  onImageSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative group">
      <div className={`w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/80 shadow-[0_4px_24px_rgba(94,118,88,0.12)] ${uploading ? "opacity-60" : ""}`}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--olivea-olive)] to-[var(--olivea-clay)] flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">{initials}</span>
          </div>
        )}
      </div>

      {/* Upload overlay */}
      <button
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
        className="
          absolute inset-0 rounded-2xl
          bg-black/0 group-hover:bg-black/30
          flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-all duration-200 cursor-pointer
          disabled:cursor-wait
        "
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
        ) : (
          <Camera size={20} className="text-white drop-shadow-md" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageSelect(file);
          // Reset so same file can be re-selected
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ─── Editable field ─── */
function ProfileField({
  icon: Icon,
  label,
  value,
  onChange,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--olivea-clay)]">
        <Icon size={12} />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          w-full px-3.5 py-2.5 rounded-xl
          bg-white/60 backdrop-blur-sm
          border border-[var(--olivea-olive)]/[0.08]
          text-sm text-[var(--olivea-ink)]
          placeholder:text-[var(--olivea-clay)]/50
          focus:outline-none focus:border-[var(--olivea-olive)]/20 focus:bg-white/80
          focus:shadow-[0_0_0_3px_rgba(94,118,88,0.06)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all
        "
      />
    </div>
  );
}

/* ─── Main Panel ─── */
export default function ProfilePanel({
  user,
  open,
  onClose,
  onSave,
}: {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSave: (updated: AdminUser) => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasChanges = fullName !== user.fullName || email !== user.email || avatarUrl !== user.avatarUrl;

  const handleSave = async () => {
    // Persist to Supabase
    try {
      await updateProfile({ fullName, avatarUrl });
    } catch (e) {
      console.error("Failed to update profile:", e);
    }
    onSave({ ...user, fullName, email, avatarUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageSelect = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      // Compress image before upload (avatars: 512px max, aggressive compression)
      const compressed = await compressImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.8,
        maxBytes: 500 * 1024, // 500KB max for avatars
      });

      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("folder", "avatars");

      const result = await uploadImage(formData);

      if (result.error) {
        setUploadError(result.error);
        return;
      }

      // Set the permanent Supabase Storage URL
      setAvatarUrl(result.url);

      // Auto-save the avatar immediately so it persists
      try {
        await updateProfile({ avatarUrl: result.url });
        onSave({ ...user, fullName, email, avatarUrl: result.url });
      } catch (e) {
        console.error("Failed to persist avatar:", e);
      }
    } catch (e) {
      console.error("Avatar upload failed:", e);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Render into document.body to escape the dock's overflow-hidden
  if (!mounted) return null;

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="
              fixed right-0 top-0 bottom-0 z-[61]
              w-[380px] max-w-[90vw]
              bg-white/80 backdrop-blur-2xl
              border-l border-[var(--olivea-olive)]/[0.06]
              shadow-[-8px_0_40px_rgba(94,118,88,0.08)]
              flex flex-col
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--olivea-olive)]/[0.06] flex-shrink-0">
              <h2 className="text-sm font-semibold text-[var(--olivea-ink)]">Profile</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--olivea-clay)] hover:text-[var(--olivea-ink)] hover:bg-[var(--olivea-cream)]/50 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {/* Avatar section */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <AvatarEditor
                  avatarUrl={avatarUrl}
                  initials={initials}
                  uploading={uploading}
                  onImageSelect={handleImageSelect}
                />
                {uploadError && (
                  <p className="text-xs text-red-500 text-center">{uploadError}</p>
                )}
                <div className="text-center">
                  <div className="text-lg font-medium text-[var(--olivea-ink)]">{fullName}</div>
                  <div className="text-xs text-[var(--olivea-clay)] mt-1">{email}</div>
                </div>
                <RoleBadge role={user.role} />
              </motion.div>

              {/* Divider */}
              <div className="h-px bg-[var(--olivea-olive)]/[0.06]" />

              {/* Fields */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-5"
              >
                <ProfileField
                  icon={User}
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                />
                <ProfileField
                  icon={Mail}
                  label="Email"
                  value={email}
                  onChange={setEmail}
                />
              </motion.div>

              {/* Info card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="
                  rounded-xl p-4
                  bg-[var(--olivea-cream)]/40
                  border border-[var(--olivea-olive)]/[0.06]
                "
              >
                <div className="flex items-start gap-3">
                  <Shield size={14} className="text-[var(--olivea-olive)]/60 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-[var(--olivea-ink)]/70">
                      Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                    <p className="text-[11px] text-[var(--olivea-clay)] mt-1 leading-relaxed">
                      {user.role === "owner"
                        ? "Full access to all settings, team management, and content."
                        : user.role === "editor"
                          ? "Can edit menus, pages, and journal articles."
                          : "Read-only access to the admin portal."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer with save */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="px-6 py-4 border-t border-[var(--olivea-olive)]/[0.06] flex-shrink-0"
            >
              <button
                onClick={handleSave}
                disabled={!hasChanges && !saved}
                className={`
                  w-full flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-xl
                  text-sm font-medium
                  transition-all duration-200
                  ${saved
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200/60"
                    : hasChanges
                      ? "bg-[var(--olivea-olive)] text-white shadow-[0_2px_12px_rgba(94,118,88,0.25)] hover:shadow-[0_4px_20px_rgba(94,118,88,0.3)]"
                      : "bg-[var(--olivea-cream)]/60 text-[var(--olivea-clay)] border border-[var(--olivea-olive)]/[0.06] cursor-not-allowed"
                  }
                `}
              >
                {saved ? (
                  <>
                    <Check size={15} />
                    Saved
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(panel, document.body);
}
