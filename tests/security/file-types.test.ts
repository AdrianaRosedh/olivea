import { describe, expect, it } from "vitest";
import {
  extensionForUploadType,
  sniffRasterImageType,
  sniffVideoType,
} from "@/lib/uploads/file-types";

const ascii = (value: string) => Uint8Array.from([...value].map((char) => char.charCodeAt(0)));

describe("upload file signature validation", () => {
  it.each([
    [Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg"],
    [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"],
    [ascii("RIFF0000WEBP"), "image/webp"],
    [ascii("GIF87a"), "image/gif"],
    [ascii("GIF89a"), "image/gif"],
  ])("recognizes raster file signatures", (bytes, expected) => {
    expect(sniffRasterImageType(bytes)).toBe(expected);
  });

  it("rejects SVG and content that only claims to be an image", () => {
    expect(sniffRasterImageType(ascii('<svg onload="alert(1)"></svg>'))).toBeNull();
    expect(sniffRasterImageType(ascii("not really a jpeg"))).toBeNull();
  });

  it("recognizes MP4 and WebM container signatures", () => {
    expect(sniffVideoType(Uint8Array.from([0, 0, 0, 24, ...ascii("ftyp"), 0, 0]))).toBe("video/mp4");
    expect(sniffVideoType(Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3]))).toBe("video/webm");
    expect(sniffVideoType(ascii("not a video"))).toBeNull();
  });

  it("derives server filenames from detected content", () => {
    expect(extensionForUploadType("image/jpeg")).toBe("jpg");
    expect(extensionForUploadType("video/webm")).toBe("webm");
  });
});
