// scripts/generate-hero.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { stat } from "node:fs/promises";

const srcCandidates = [
  "public/images/hero.avif",
  "public/images/hero.webp",
  "public/images/hero.jpg",
];

let src = null;
for (const p of srcCandidates) {
  try { await stat(p); src = p; break; } catch {}
}
if (!src) {
  console.error("❌ No source hero image found. Put one of hero.avif/webp/jpg in public/images.");
  process.exit(1);
}

await mkdir("public/images", { recursive: true });

async function makeAvif(width, out) {
  await sharp(src)
    .resize({ width, withoutEnlargement: true }) // keep aspect ratio (no height)
    .toColourspace("srgb")
    .avif({ quality: 60, effort: 4 })
    .toFile(out);
  const { size } = await stat(out);
  console.log(`✓ ${out} (${Math.round(size / 1024)} KiB, ${width}w)`);
}

await makeAvif(828, "public/images/hero-mobile.avif");      // main mobile
await makeAvif(480, "public/images/hero-mobile-480.avif");  // optional smaller

console.log("Done.");
