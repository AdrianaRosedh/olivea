// scripts/copy-pdf-worker.mjs
// ─────────────────────────────────────────────────────────────────────
// Copy the pdfjs-dist worker bundle into public/ so it's served at a
// stable, same-origin URL (/pdf.worker.min.mjs) — required by the secure
// document viewer (app/d/[token]/SecureDocumentViewer.tsx), which renders
// the PDF to canvas to bake in a watermark and disable download/print.
//
// A static asset in public/ works across every Next.js deployment shape,
// unlike webpack/turbopack URL imports. The site CSP already allows it
// (worker-src 'self' blob:). Runs on postinstall + before dev/build.
// ─────────────────────────────────────────────────────────────────────

import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
const DST = resolve(here, "../public/pdf.worker.min.mjs");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.warn(`[pdf-worker] source missing at ${SRC}, skipping`);
    return;
  }
  await mkdir(dirname(DST), { recursive: true });
  await copyFile(SRC, DST);
  console.log(`[pdf-worker] copied ${SRC} → ${DST}`);
}

main().catch((err) => {
  console.error("[pdf-worker] copy failed:", err);
  process.exitCode = 1;
});
