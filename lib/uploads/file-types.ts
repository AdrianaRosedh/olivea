export type RasterImageType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";
export type VideoType = "video/mp4" | "video/webm";

function hasBytes(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function hasAscii(bytes: Uint8Array, offset: number, expected: string): boolean {
  return [...expected].every((char, index) => bytes[offset + index] === char.charCodeAt(0));
}

/** Identify supported raster images from their file signatures, not browser MIME claims. */
export function sniffRasterImageType(bytes: Uint8Array): RasterImageType | null {
  if (hasBytes(bytes, 0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (hasAscii(bytes, 0, "RIFF") && hasAscii(bytes, 8, "WEBP")) return "image/webp";
  if (hasAscii(bytes, 0, "GIF87a") || hasAscii(bytes, 0, "GIF89a")) return "image/gif";
  return null;
}

/** Identify supported video containers from their leading bytes. */
export function sniffVideoType(bytes: Uint8Array): VideoType | null {
  // ISO BMFF/MP4: a 32-bit box length followed by the `ftyp` box name.
  if (hasAscii(bytes, 4, "ftyp")) return "video/mp4";
  // Matroska/WebM EBML header.
  if (hasBytes(bytes, 0, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm";
  return null;
}

export function extensionForUploadType(type: RasterImageType | VideoType): string {
  switch (type) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/gif": return "gif";
    case "video/mp4": return "mp4";
    case "video/webm": return "webm";
  }
}
