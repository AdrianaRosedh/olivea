import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.resolve("public/images");
const SUPPORTED_EXT = [".jpg", ".jpeg"];

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

    const hasAvif = fs.existsSync(avifPath);
    const hasWebp = fs.existsSync(webpPath);

    if (hasAvif && hasWebp) {
      continue; // ✅ already done
    }

    console.log(`🖼  Processing: ${path.relative(IMAGES_DIR, fullPath)}`);

    const image = sharp(fullPath);

    if (!hasWebp) {
      await image
        .clone()
        .webp({ quality: 82 })
        .toFile(webpPath);
      console.log(`   → created ${path.basename(webpPath)}`);
    }

    if (!hasAvif) {
      await image
        .clone()
        .avif({ quality: 60 })
        .toFile(avifPath);
      console.log(`   → created ${path.basename(avifPath)}`);
    }
  }
}

walk(IMAGES_DIR)
  .then(() => {
    console.log("\n✅ Image conversion complete.");
  })
  .catch((err) => {
    console.error("❌ Error during conversion:", err);
    process.exit(1);
  });
