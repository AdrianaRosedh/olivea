// scripts/convert-images.mjs
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.resolve("public/images");
const SUPPORTED_EXT = [".jpg", ".jpeg"];

// Tune these:
const MAX_EDGE = 2400;          // long edge max (safe + high quality)
const WEBP_QUALITY = 82;
const AVIF_QUALITY = 60;
const JPEG_QUALITY = 82;

// If you want to ALSO overwrite the original JPGs with resized versions,
// set to true (recommended given your 70–87MB files).
const OVERWRITE_JPEG_WITH_RESIZED = true;

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXT.includes(ext)) continue;

    const base = fullPath.slice(0, -ext.length);
    const avifPath = `${base}.avif`;
    const webpPath = `${base}.webp`;

    const rel = path.relative(IMAGES_DIR, fullPath);

    try {
      const hasAvif = fs.existsSync(avifPath);
      const hasWebp = fs.existsSync(webpPath);

      // We still might want to overwrite-resize the jpeg even if formats exist
      if (hasAvif && hasWebp && !OVERWRITE_JPEG_WITH_RESIZED) continue;

      console.log(`🖼  Processing: ${rel}`);

      // Read metadata (to log size / sanity)
      const img = sharp(fullPath, { failOnError: false });
      const meta = await img.metadata();

      // Resize *before* encoding to avoid WebP/AVIF limits
      const resized = img.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });

      // Optionally overwrite the original JPG with a resized/compressed JPG
      if (OVERWRITE_JPEG_WITH_RESIZED) {
        // Write to temp first, then replace (safer)
        const tmpJpg = `${base}.__tmp${ext}`;
        await resized
          .clone()
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toFile(tmpJpg);

        await fs.promises.rename(tmpJpg, fullPath);
        console.log(`   → resized original (${meta.width}x${meta.height} → max ${MAX_EDGE}px)`);
      }

      // Re-open after overwrite (so conversions are based on the resized jpeg)
      const imageForFormats = sharp(fullPath, { failOnError: false });

      if (!hasWebp) {
        await imageForFormats.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);
        console.log(`   → created ${path.basename(webpPath)}`);
      }

      if (!hasAvif) {
        await imageForFormats.clone().avif({ quality: AVIF_QUALITY }).toFile(avifPath);
        console.log(`   → created ${path.basename(avifPath)}`);
      }
    } catch (err) {
      console.error(`❌ Failed: ${rel}`);
      console.error(err);
      // keep going
    }
  }
}

walk(IMAGES_DIR)
  .then(() => console.log("\n✅ Image conversion complete."))
  .catch((err) => {
    console.error("❌ Fatal error during conversion:", err);
    process.exit(1);
  });