import sharp from "sharp";

const SRC  = "public/images/hero.jpg";
const OUTA = "public/images/hero.avif";
const OUTW = "public/images/hero.webp"; // optional fallback

const WIDTH = 1920;        // match your hero render (~98vw desktop)
const AVIF_QUALITY = 55;   // 45–60 ≈ crisp + small
const AVIF_EFFORT  = 4;    // 0–9 (higher=slower, tiny gain)
const WEBP_QUALITY = 70;

await sharp(SRC)
  .resize({ width: WIDTH, withoutEnlargement: true })
  .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
  .toFile(OUTA);

await sharp(SRC)
  .resize({ width: WIDTH, withoutEnlargement: true })
  .webp({ quality: WEBP_QUALITY })
  .toFile(OUTW);

console.log("✓ Wrote", OUTA, "and", OUTW);
