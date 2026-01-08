import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

// Where your source images live (adjust if needed)
const INPUT_DIRS = [
  "public/images",
];

// Which files to treat as “photos” (we’ll generate avif/webp/jpg)
const PHOTO_EXTS = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"]);

// Skip anything already “derived”
const SKIP_SUFFIXES = [".avif", ".webp"];

// Quality tuning (great defaults)
const Q_AVIF = 52;  // 45–55 is a sweet spot
const Q_WEBP = 74;  // 70–80 typically
const Q_JPG  = 82;  // fallback

// Max dimension cap (prevents accidental 8k assets). Set null to disable.
const MAX_DIM = 2400;

// If true: generate next to original (hero.jpg -> hero.avif/webp + keep hero.jpg)
const OUTPUT_NEXT_TO_SOURCE = true;

function isDerived(file) {
  const lower = file.toLowerCase();
  return SKIP_SUFFIXES.some((s) => lower.endsWith(s));
}

function extLower(file) {
  return path.extname(file).toLowerCase();
}

function outPathFor(file, newExt) {
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  return path.join(dir, `${base}${newExt}`);
}

async function ensureDir(p) {
  await fs.mkdir(path.dirname(p), { recursive: true });
}

async function processOne(absFile) {
  const rel = path.relative(ROOT, absFile);
  const ext = extLower(absFile);

  if (!PHOTO_EXTS.has(ext)) return { rel, skipped: true, reason: "not-photo" };
  if (isDerived(rel)) return { rel, skipped: true, reason: "derived" };

  // If it’s already jpg/jpeg, keep it as fallback.
  // If it’s png, we’ll create a jpg fallback too (unless it has transparency).
  const img = sharp(absFile, { failOn: "none" });

  const meta = await img.metadata();

  // Resize down if too large (keeping aspect ratio)
  let pipeline = img;
  if (MAX_DIM && meta.width && meta.height) {
    const bigger = Math.max(meta.width, meta.height);
    if (bigger > MAX_DIM) {
      pipeline = img.resize({
        width: meta.width >= meta.height ? MAX_DIM : null,
        height: meta.height > meta.width ? MAX_DIM : null,
        withoutEnlargement: true,
      });
    }
  }

  const avifOut = outPathFor(absFile, ".avif");
  const webpOut = outPathFor(absFile, ".webp");

  // Only write if missing (so you can re-run safely)
  const exists = async (p) => !!(await fs.stat(p).catch(() => null));

  // AVIF
  if (!(await exists(avifOut))) {
    await ensureDir(avifOut);
    await pipeline
      .clone()
      .avif({ quality: Q_AVIF })
      .toFile(avifOut);
  }

  // WebP
  if (!(await exists(webpOut))) {
    await ensureDir(webpOut);
    await pipeline
      .clone()
      .webp({ quality: Q_WEBP })
      .toFile(webpOut);
  }

  // JPG fallback: only if original is not jpg/jpeg or if png has alpha (we still keep original png)
  const hasAlpha = !!meta.hasAlpha;
  const isJpg = ext === ".jpg" || ext === ".jpeg";
  const jpgOut = outPathFor(absFile, ".jpg");

  if (!isJpg && !(await exists(jpgOut))) {
    // If png with alpha, converting to jpg may look wrong; still generate jpg for non-transparent images.
    // We can force a background for alpha (white). Change to your Olivea background if needed.
    const jpgPipeline = hasAlpha
      ? pipeline.clone().flatten({ background: "#ffffff" })
      : pipeline.clone();

    await ensureDir(jpgOut);
    await jpgPipeline
      .jpeg({ quality: Q_JPG, mozjpeg: true })
      .toFile(jpgOut);
  }

  return { rel, skipped: false };
}

async function main() {
  const patterns = INPUT_DIRS.map((d) => `${d}/**/*`);
  const files = await fg(patterns, { onlyFiles: true, absolute: true });

  let done = 0, skipped = 0;
  for (const f of files) {
    const r = await processOne(f);
    if (r.skipped) skipped++;
    else done++;
  }

  console.log(`✅ Converted: ${done}`);
  console.log(`↩️  Skipped: ${skipped}`);
  console.log(`Note: SVG/ICO/etc remain untouched.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
