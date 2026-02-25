import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGES_DIR = path.resolve("public/images");
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png"]);

// Optional: ignore folders under public/images (relative to IMAGES_DIR)
const IGNORE_DIRS = new Set([
  // "icons",
  // "favicons",
]);

const MAX_EDGE = 2400;
const WEBP_QUALITY = 82;
const AVIF_QUALITY = 60;

const DRY_RUN = process.env.DRY_RUN === "true";

function normalizeRel(p) {
  return p.split(path.sep).join("/");
}

function isIgnored(relToImagesDir) {
  for (const d of IGNORE_DIRS) {
    const dir = d.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    if (relToImagesDir === dir || relToImagesDir.startsWith(dir + "/")) return true;
  }
  return false;
}

function basePath(fullPath) {
  const ext = path.extname(fullPath);
  return fullPath.slice(0, -ext.length);
}

async function walk(dir, onFile) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relDir = normalizeRel(path.relative(IMAGES_DIR, fullPath));
      if (isIgnored(relDir)) continue;
      await walk(fullPath, onFile);
    } else {
      await onFile(fullPath);
    }
  }
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ IMAGES_DIR not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const planned = [];
  let scanned = 0;
  let skipped = 0;

  await walk(IMAGES_DIR, async (fullPath) => {
    const ext = path.extname(fullPath).toLowerCase();
    if (!SOURCE_EXT.has(ext)) return;

    const rel = normalizeRel(path.relative(IMAGES_DIR, fullPath));
    if (isIgnored(rel)) return;

    scanned++;

    const base = basePath(fullPath);
    const webpPath = `${base}.webp`;
    const avifPath = `${base}.avif`;

    const hasWebp = fs.existsSync(webpPath);
    const hasAvif = fs.existsSync(avifPath);

    if (hasWebp && hasAvif) {
      skipped++;
      return;
    }

    planned.push({ fullPath, rel, webpPath, avifPath, hasWebp, hasAvif });
  });

  if (!planned.length) {
    console.log("ℹ️ No images missing formats. Nothing to do.");
    console.log(`Scanned: ${scanned}, Skipped: ${skipped}`);
    return;
  }

  console.log(`🔎 Found ${planned.length} image(s) missing .webp/.avif`);

  if (DRY_RUN) {
    for (const p of planned) {
      const todo = [
        !p.hasWebp ? "webp" : null,
        !p.hasAvif ? "avif" : null,
      ].filter(Boolean);
      console.log(`- ${p.rel} → ${todo.join(" + ")}`);
    }
    console.log("\n🧪 DRY_RUN=true: no files written.");
    return;
  }

  let createdWebp = 0;
  let createdAvif = 0;
  let failed = 0;

  for (const p of planned) {
    console.log(`🖼  ${p.rel}`);
    try {
      const resized = sharp(p.fullPath, { failOnError: false }).resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });

      if (!p.hasWebp) {
        await resized.clone().webp({ quality: WEBP_QUALITY }).toFile(p.webpPath);
        createdWebp++;
        console.log(`   → + ${path.basename(p.webpPath)}`);
      }

      if (!p.hasAvif) {
        await resized.clone().avif({ quality: AVIF_QUALITY }).toFile(p.avifPath);
        createdAvif++;
        console.log(`   → + ${path.basename(p.avifPath)}`);
      }
    } catch (err) {
      failed++;
      console.error(`❌ Failed: ${p.rel}`);
      console.error(err);
    }
  }

  console.log("\n— Summary —");
  console.log(`Scanned:   ${scanned}`);
  console.log(`Skipped:   ${skipped} (already had .webp + .avif)`);
  console.log(`Created:   ${createdWebp} webp, ${createdAvif} avif`);
  console.log(`Failed:    ${failed}`);
  console.log("\n✅ Done.");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
