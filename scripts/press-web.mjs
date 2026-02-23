// scripts/press-web.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const hiresDir = path.join(ROOT, "public/images/press/media/hires");
const webDir = path.join(ROOT, "public/images/press/media/web");

fs.mkdirSync(webDir, { recursive: true });

const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const files = fs
  .readdirSync(hiresDir)
  .filter((f) => exts.has(path.extname(f).toLowerCase()));

if (files.length === 0) {
  console.log("No images found in public/press/media/hires");
  process.exit(0);
}

const TARGET_LONG_EDGE = 2000; // premium web preview
const QUALITY = 80; // good balance for press previews

for (const file of files) {
  const inPath = path.join(hiresDir, file);
  const name = path.parse(file).name;

  // Normalize output filenames (avoid spaces/commas/caps weirdness)
  const safeName = name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

  const outPath = path.join(webDir, `${safeName}.jpg`);

  const img = sharp(inPath, { failOnError: false }).rotate(); // auto-orient
  const meta = await img.metadata();

  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const longEdge = Math.max(w, h);

  const resized =
    longEdge > TARGET_LONG_EDGE
      ? img.resize({
          width: w >= h ? TARGET_LONG_EDGE : undefined,
          height: h > w ? TARGET_LONG_EDGE : undefined,
          fit: "inside",
          withoutEnlargement: true,
        })
      : img;

  await resized
    .jpeg({
      quality: QUALITY,
      mozjpeg: true,
      chromaSubsampling: "4:2:0",
    })
    .toFile(outPath);

  const outStat = fs.statSync(outPath);
  console.log(
    `✅ ${file} → web/${path.basename(outPath)} (${Math.round(
      outStat.size / 1024
    )}KB)`
  );
}

console.log("Done.");