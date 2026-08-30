"use client";

import { useCallback, useRef, useState } from "react";
import { Film, Loader2, Upload, X } from "lucide-react";
import { uploadVideo, deleteVideo } from "@/lib/supabase/storage-actions";
import { useAuth } from "@/components/admin/AuthProvider";

interface VideoUploadProps {
  /** Current video URL, if any */
  value?: string;
  /** Called when a video is uploaded or cleared */
  onChange: (url: string) => void;
  /** Storage folder, e.g. "popups" */
  folder?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

/** Kept in step with the server action's ceiling. */
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Upload a short looping video.
 *
 * Unlike images there is no client-side compression step — a canvas can
 * re-encode a photo but cannot transcode a movie — so the size is checked
 * here as well as on the server, to fail immediately rather than after a
 * long upload of a file that was always going to be rejected.
 */
export default function VideoUpload({
  value,
  onChange,
  folder = "general",
  label,
  hint,
  disabled = false,
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { canEdit, canDelete } = useAuth();
  const interactionDisabled = disabled || !canEdit;

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!["video/mp4", "video/webm"].includes(file.type)) {
        setError("Use an MP4 or WebM file.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(
          `That video is ${(file.size / 1024 / 1024).toFixed(1)}MB. Keep loops under 12MB — trim the clip or export it smaller.`
        );
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);

      const result = await uploadVideo(formData);
      if (result.error) setError(result.error);
      else onChange(result.url);
      setUploading(false);
    },
    [folder, onChange]
  );

  const handleRemove = useCallback(async () => {
    if (!value) return;
    setUploading(true);
    if (canDelete && value.includes("/storage/v1/object/public/site-video/")) {
      const res = await deleteVideo(value);
      // Clearing the field matters more than the file going away.
      if (res.error) console.warn("Video delete failed:", res.error);
    }
    onChange("");
    setUploading(false);
  }, [value, onChange, canDelete]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-stone-600 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!interactionDisabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (interactionDisabled || uploading) return;
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => {
          if (!interactionDisabled && !uploading && !value) inputRef.current?.click();
        }}
        className={`
          relative overflow-hidden rounded-lg border-2 border-dashed transition-colors
          ${dragOver ? "border-[var(--olivea-olive)] bg-[var(--olivea-olive)]/5" : "border-stone-300 bg-stone-50/50"}
          ${interactionDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${value ? "" : "aspect-video"}
        `}
      >
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--olivea-olive)]" />
            <span className="ml-2 text-sm text-stone-600">Uploading…</span>
          </div>
        )}

        {value ? (
          <div className="group relative">
            {/* Muted and looping here too, so the preview behaves like the
                popup rather than surprising the editor with sound. */}
            <video
              src={value}
              className="w-full aspect-video object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
            {!interactionDisabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="rounded-full bg-white/90 p-2 text-stone-700 shadow-md hover:bg-white"
                  title="Replace video"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="rounded-full bg-white/90 p-2 text-red-600 shadow-md hover:bg-red-50"
                  title="Remove video"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <Film className="h-7 w-7 text-stone-300" />
            <p className="text-sm text-stone-500">
              Drop an MP4 or WebM, or click to choose
            </p>
            <p className="text-xs text-stone-400">Silent loop, under 12MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="hidden"
          disabled={interactionDisabled || uploading}
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
