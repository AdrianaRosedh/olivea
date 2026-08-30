"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/supabase/storage-actions";
import { compressImage, IMAGE_BUDGETS, type ImageBudget } from "@/lib/utils/compress-image";
import { useAuth } from "@/components/admin/AuthProvider";

interface ImageUploadProps {
  /** Current image URL (if any) */
  value?: string;
  /** Called when a new image is uploaded or cleared */
  onChange: (url: string) => void;
  /** Storage folder to organize images (e.g. "heroes", "popups", "team") */
  folder?: string;
  /** Label shown above the upload area */
  label?: string;
  /** Hint text below the upload area */
  hint?: string;
  /** Aspect ratio class for the preview (e.g. "aspect-video", "aspect-square") */
  aspectRatio?: string;
  /** Disable the upload */
  disabled?: boolean;
  /**
   * "inline" renders just a thumbnail that swaps the image on click or
   * drop — for list rows where the full drop-zone block would dwarf the
   * row it belongs to. Same upload, compression and validation.
   */
  variant?: "block" | "inline";
  /** Square size in px for the inline variant. */
  inlineSize?: number;
  /**
   * How large this image is allowed to be, by what it is for.
   * Defaults to "card", which suits popups, sections and gallery rows —
   * pass "hero" for full-bleed art that earns the extra weight.
   */
  budget?: ImageBudget;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label,
  hint,
  aspectRatio = "aspect-video",
  disabled = false,
  variant = "block",
  inlineSize = 48,
  budget = "card",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { canEdit, canDelete } = useAuth();
  const interactionDisabled = disabled || !canEdit;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      // Compress before upload — resize, convert to WebP, and hold the image
      // to the budget for what it is. The previous call passed a 2MB ceiling
      // for everything, which a 1.99MB PNG slipped under untouched.
      const compressed = await compressImage(file, IMAGE_BUDGETS[budget]);

      const formData = new FormData();
      formData.set("file", compressed);
      formData.set("folder", folder);

      const result = await uploadImage(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onChange(result.url);
      }

      setUploading(false);
    },
    [folder, onChange, budget]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (interactionDisabled || uploading) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      } else {
        setError("Please drop an image file (JPEG, PNG, WebP, or GIF)");
      }
    },
    [interactionDisabled, uploading, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  const handleRemove = useCallback(async () => {
    if (!value) return;
    setUploading(true);
    setError(null);

    // Try to delete from storage (non-blocking — image may be external)
    if (canDelete && value.includes("/storage/v1/object/public/site-images/")) {
      const result = await deleteImage(value);
      if (result.error) {
        // Don't block removal from the form — just clear the URL
        console.warn("Image delete failed:", result.error);
      }
    }

    onChange("");
    setUploading(false);
  }, [value, onChange, canDelete]);

  if (variant === "inline") {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!interactionDisabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!interactionDisabled && !uploading) inputRef.current?.click();
        }}
        title={
          error ??
          (value ? "Click or drop to replace" : "Click or drop to add an image")
        }
        style={{ width: inlineSize, height: inlineSize }}
        className={`
          group relative shrink-0 overflow-hidden rounded-lg ring-1 transition-colors
          ${dragOver ? "ring-2 ring-[var(--olivea-olive)]" : "ring-black/5"}
          ${error ? "ring-2 ring-red-400" : ""}
          ${interactionDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${value ? "" : "bg-[var(--olivea-cream)]/40"}
        `}
      >
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        )}

        {!uploading && !interactionDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
            <Upload className="h-4 w-4 text-white" />
          </div>
        )}

        {!value && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-[var(--olivea-clay)]/40" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--olivea-olive)]" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleInputChange}
          className="hidden"
          disabled={interactionDisabled || uploading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-stone-600 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Preview / Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!interactionDisabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed transition-colors overflow-hidden
          ${dragOver ? "border-olive-600 bg-olive-50/50" : "border-stone-300 bg-stone-50/50"}
          ${interactionDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${!value ? aspectRatio : ""}
        `}
        onClick={() => {
          if (!interactionDisabled && !uploading && !value) inputRef.current?.click();
        }}
      >
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-olive-600" />
            <span className="ml-2 text-sm text-stone-600">Uploading...</span>
          </div>
        )}

        {value ? (
          /* Image preview */
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded"
              className={`w-full object-cover ${aspectRatio}`}
            />
            {!interactionDisabled && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md transition-colors"
                  title="Replace image"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="p-2 rounded-full bg-white/90 hover:bg-red-50 text-red-600 shadow-md transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-400">
            <ImageIcon className="w-8 h-8" />
            <p className="text-sm">
              {dragOver ? "Drop image here" : "Click or drag image here"}
            </p>
            <p className="text-xs text-stone-400">JPEG, PNG, WebP, GIF · Max 5MB</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={interactionDisabled || uploading}
      />

      {/* URL text input (for manual entry or pasting external URLs) */}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL..."
        className="w-full text-xs px-2.5 py-1.5 rounded border border-stone-300 bg-white/60 text-stone-600 focus:ring-1 focus:ring-olive-500 focus:border-olive-500 outline-none"
        disabled={interactionDisabled}
      />

      {/* Hint */}
      {hint && <p className="text-xs text-stone-400">{hint}</p>}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
