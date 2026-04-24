"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SectionGuard from "@/components/admin/SectionGuard";
import { Image as ImageIcon, Upload, Trash2, Loader2, Copy, Check, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ── */

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  folder: string;
  publicUrl: string;
}

/* ── Folder list ── */
const folders = [
  { id: "general", label: "General" },
  { id: "journal", label: "Journal" },
  { id: "team", label: "Team" },
  { id: "pages", label: "Pages" },
  { id: "menu", label: "Menu" },
];

/* ── Easing ── */
const cinematic: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState("general");
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async (folder: string) => {
    setLoading(true);
    try {
      const { listStorageFiles } = await import("@/lib/supabase/storage-list-action");
      const items = await listStorageFiles(folder);
      setFiles(items);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(activeFolder); }, [activeFolder, loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadImage } = await import("@/lib/supabase/storage-actions");
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", activeFolder);
      const result = await uploadImage(formData);

      if (result.error) {
        console.error("[media] Upload error:", result.error);
      } else {
        await loadFiles(activeFolder);
      }
    } catch (err) {
      console.error("[media] Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete ${file.name}?`)) return;
    try {
      const { deleteImage } = await import("@/lib/supabase/storage-actions");
      await deleteImage(file.publicUrl);
      await loadFiles(activeFolder);
    } catch (err) {
      console.error("[media] Delete failed:", err);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <SectionGuard sectionKey="content.media">
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: cinematic }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--olivea-cream)]/60 border border-[var(--olivea-olive)]/10 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-[var(--olivea-olive)]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[var(--olivea-ink)] tracking-tight">
              Media Library
            </h1>
            <p className="text-xs text-[var(--olivea-clay)]">
              Upload and manage images used across the site
            </p>
          </div>
        </div>

        <label className={`
          flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all
          bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-olive)]/90 shadow-sm
          ${uploading ? "opacity-50 pointer-events-none" : ""}
        `}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading…" : "Upload Image"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* ── Folder tabs ── */}
      <div className="flex gap-1 rounded-xl bg-stone-100/60 p-1">
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFolder(f.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all
              ${activeFolder === f.id
                ? "bg-white text-[var(--olivea-olive)] shadow-sm"
                : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
              }
            `}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* ── File grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--olivea-olive)]" />
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl bg-white/40 border-2 border-dashed border-stone-200 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-500">No images in this folder yet</p>
          <p className="text-xs text-stone-400 mt-1">Upload an image to get started</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id || file.name}
                variants={{
                  hidden: { opacity: 0, scale: 0.92 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: cinematic } },
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative rounded-xl overflow-hidden bg-white/60 border border-stone-200/60 hover:border-[var(--olivea-olive)]/20 hover:shadow-md transition-all"
              >
                {/* Image preview */}
                <div className="aspect-square bg-stone-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => copyUrl(file.publicUrl)}
                      className="p-2 rounded-full bg-white/90 text-stone-700 hover:bg-white transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl === file.publicUrl ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File info */}
                <div className="px-3 py-2">
                  <p className="text-xs text-stone-700 font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
    </SectionGuard>
  );
}
