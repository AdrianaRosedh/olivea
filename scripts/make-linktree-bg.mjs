import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.join(__dirname, "../public/images/linktree/gardenleaves.jpg");
const outAvif = path.join(__dirname, "../public/images/linktree/gardenleaves.avif");
const outBlur = path.join(__dirname, "../public/images/linktree/gardenleaves-blur.jpg");

await fs.access(input);

// 1) Main AVIF (good quality, reasonable size)
await sharp(input)
  .resize({ width: 1920, withoutEnlargement: true }) // adjust if you want (e.g. 1600)
  .avif({ quality: 55, effort: 6 })
  .toFile(outAvif);

// 2) Tiny blur placeholder (fastest possible)
await sharp(input)
  .resize({ width: 120, withoutEnlargement: true })
  .jpeg({ quality: 35, mozjpeg: true })
  .blur(12)
  .toFile(outBlur);

console.log("✅ Created:", outAvif);
console.log("✅ Created:", outBlur);