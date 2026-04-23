"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/supabase/storage-actions";
import { compressImage } from "@/lib/utils/compress-image";

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
}

export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label,
  hint,
  aspectRatio = "aspect-video",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      // Compress before upload — resize large images, convert to WebP
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.82,
        maxBytes: 2 * 1024 * 1024, // 2MB max after compression
      });

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
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled || uploading) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleFile(file);
      } else {
        setError("Please drop an image file (JPEG, PNG, WebP, SVG, or GIF)");
      }
    },
    [disabled, uploading, handleFile]
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
    if (value.includes("/storage/v1/object/public/site-images/")) {
      const result = await deleteImage(value);
      if (result.error) {
        // Don't block removal from the form — just clear the URL
        console.warn("Image delete failed:", result.error);
      }
    }

    onChange("");
    setUploading(false);
  }, [value, onChange]);

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
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed transition-colors overflow-hidden
          ${dragOver ? "border-olive-600 bg-olive-50/50" : "border-stone-300 bg-stone-50/50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${!value ? aspectRatio : ""}
        `}
        onClick={() => {
          if (!disabled && !uploading && !value) inputRef.current?.click();
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
            {!disabled && (
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
            <p className="text-xs text-stone-400">JPEG, PNG, WebP, SVG, GIF · Max 5MB</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* URL text input (for manual entry or pasting external URLs) */}
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL..."
        className="w-full text-xs px-2.5 py-1.5 rounded border border-stone-300 bg-white/60 text-stone-600 focus:ring-1 focus:ring-olive-500 focus:border-olive-500 outline-none"
        disabled={disabled}
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
