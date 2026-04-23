// lib/utils/compress-image.ts
// ─────────────────────────────────────────────────────────────────────
// Client-side image compression. Resizes and re-encodes images before
// upload so they fit within the server action body size limit.
// ─────────────────────────────────────────────────────────────────────

export interface CompressOptions {
  /** Maximum width in pixels (default: 1920) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 1920) */
  maxHeight?: number;
  /** JPEG/WebP quality 0-1 (default: 0.82) */
  quality?: number;
  /** Max file size in bytes (default: 1MB). Will re-compress at lower quality if exceeded. */
  maxBytes?: number;
  /** Output MIME type (default: "image/webp") */
  outputType?: "image/jpeg" | "image/webp" | "image/png";
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.82,
  maxBytes: 1 * 1024 * 1024, // 1 MB
  outputType: "image/webp",
};

/**
 * Compress an image file client-side using canvas.
 * Returns a new File with the compressed data.
 *
 * - Resizes to fit within maxWidth × maxHeight (preserving aspect ratio)
 * - Re-encodes as WebP (or specified format) at the given quality
 * - If still over maxBytes, iteratively lowers quality until it fits
 * - SVGs and GIFs are passed through unchanged (can't compress via canvas)
 */
export async function compressImage(
  file: File,
  opts?: CompressOptions,
): Promise<File> {
  // Pass through SVGs and GIFs — canvas can't handle these well
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // If already small enough, skip compression
  const { maxWidth, maxHeight, quality, maxBytes, outputType } = {
    ...DEFAULTS,
    ...opts,
  };

  if (file.size <= maxBytes) {
    // Still might need resize — check dimensions via image load
    // But for truly small files (< 200KB), skip entirely
    if (file.size < 200 * 1024) return file;
  }

  // Load into an Image element
  const img = await loadImage(file);
  const { width, height } = computeDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight,
  );

  // If no resize needed and file is already small, return original
  if (
    width === img.naturalWidth &&
    height === img.naturalHeight &&
    file.size <= maxBytes
  ) {
    return file;
  }

  // Draw to canvas at target dimensions
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  // Use high-quality downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Compress with iterative quality reduction if needed
  let currentQuality = quality;
  let blob = await canvasToBlob(canvas, outputType, currentQuality);

  // Iteratively reduce quality until we're under the limit (min quality: 0.4)
  let attempts = 0;
  while (blob.size > maxBytes && currentQuality > 0.4 && attempts < 5) {
    currentQuality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, currentQuality);
    attempts++;
  }

  // Build the output filename
  const ext = outputType === "image/webp" ? "webp" : outputType === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outName = `${baseName}.${ext}`;

  return new File([blob], outName, { type: outputType });
}

/* ── Internal helpers ── */

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    img.src = URL.createObjectURL(file);
  });
}

function computeDimensions(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  let w = srcW;
  let h = srcH;

  if (w > maxW) {
    h = Math.round(h * (maxW / w));
    w = maxW;
  }
  if (h > maxH) {
    w = Math.round(w * (maxH / h));
    h = maxH;
  }

  return { width: w, height: h };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob returned null"));
      },
      type,
      quality,
    );
  });
}
