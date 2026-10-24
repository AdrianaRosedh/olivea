// scripts/generate-content-fallback.mjs
//
// Regenerates the static content fallbacks from the CMS.
//
// The pages render from Supabase and fall back to these files when it is
// unreachable. That fallback used to be hand-maintained, which meant it
// quietly rotted: the café page's file said the café closed at 6:15pm while
// the real hours said 4:00pm, and nobody could tell, because the file only
// renders when the database does not. A fallback that disagrees with
// production is worse than no fallback — it waits for an outage to publish
// something false.
//
// So the direction is CMS → files, generated, one way. Editors work in the
// admin; this snapshots that into the repo at build time. Nothing here should
// ever be edited by hand — the next build overwrites it.
//
// Safety: if Supabase is not configured, or a fetch fails, or a table comes
// back empty, the existing file is LEFT ALONE. A build without secrets (CI)
// must not be able to blank the fallback. Exit code is always 0 for the same
// reason — a snapshot failing is not worth failing a deploy over, and the
// committed file is still perfectly serviceable.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "lib", "content", "data");

// Vercel injects env vars into the build, but a plain node script run locally
// gets none — next is what normally reads .env.local. Parse it so running this
// by hand behaves the same as running it in a deploy.
for (const file of [".env.local", ".env"]) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k]) continue; // a real env var always wins
    process.env[k] = raw.trim().replace(/^["']|["']$/g, "");
  }
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const log = (m) => console.log(`[content-fallback] ${m}`);

if (!URL_ || !KEY) {
  log("Supabase not configured — keeping the committed fallbacks as they are.");
  process.exit(0);
}

async function fetchRows(table, query = "") {
  const url = `${URL_}/rest/v1/${table}${query ? `?${query}` : ""}`;
  const res = await fetch(url, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`${table} → ${res.status} ${await res.text()}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error(`${table} → not an array`);
  return rows;
}

/** Stable, diff-friendly output: sorted keys, 2-space indent, undefined dropped. */
function literal(value, indent = 2) {
  const pad = " ".repeat(indent);
  const padIn = " ".repeat(indent + 2);

  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value
      .map((v) => `${padIn}${literal(v, indent + 2)}`)
      .join(",\n")},\n${pad}]`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort();
    if (!keys.length) return "{}";
    return `{\n${keys
      .map((k) => `${padIn}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${literal(value[k], indent + 2)}`)
      .join(",\n")},\n${pad}}`;
  }
  return JSON.stringify(value);
}

function writeFile(file, contents) {
  const target = path.join(DATA, file);
  const next = contents.endsWith("\n") ? contents : `${contents}\n`;
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (current === next) {
    log(`${file} — unchanged`);
    return;
  }
  fs.writeFileSync(target, next);
  log(`${file} — updated`);
}

const BANNER = (source) =>
  `// GENERATED FILE — DO NOT EDIT BY HAND.\n` +
  `// Snapshot of ${source}, written by scripts/generate-content-fallback.mjs.\n` +
  `// Edit this content in the admin; the next build regenerates this file.\n` +
  `// It exists so the page still renders if Supabase is unreachable.\n`;

/* ── Philosophy chapters ─────────────────────────────────────────── */
async function philosophySections() {
  const rows = await fetchRows("sustainability_sections", "order=sort_order.asc");
  if (!rows.length) throw new Error("sustainability_sections is empty");

  const items = rows.map((r, i) => ({
    id: String(r.id),
    order: typeof r.sort_order === "number" ? r.sort_order : i + 1,
    title: r.title ?? { es: "", en: "" },
    subtitle: r.subtitle ?? undefined,
    signals: Array.isArray(r.signals) && r.signals.length ? r.signals : undefined,
    practices: Array.isArray(r.practices) && r.practices.length ? r.practices : undefined,
    body: r.body ?? { es: "", en: "" },
  }));

  writeFile(
    "sustainabilitySections.ts",
    `${BANNER("public.sustainability_sections")}
import type { SustainabilitySection } from "../types";

const items: SustainabilitySection[] = ${literal(items, 0)};

export default items;
export { items };
`
  );
  return items.length;
}

/* ── Page singletons (casa / cafe / farm to table) ───────────────── */
const PAGES = [
  { table: "casa_content", file: "casa.ts", type: "CasaContent", varName: "casa" },
  { table: "cafe_content", file: "cafe.ts", type: "CafeContent", varName: "cafe" },
  {
    table: "farmtotable_content",
    file: "farmtotable.ts",
    type: "FarmToTableContent",
    varName: "farmtotable",
  },
];

async function pageSingleton({ table, file, type, varName }) {
  const rows = await fetchRows(table, "id=eq.singleton");
  const row = rows[0];
  if (!row) throw new Error(`${table} has no singleton row`);
  if (!Array.isArray(row.sections) || !row.sections.length)
    throw new Error(`${table}.sections is empty`);

  // id and updated_at are storage bookkeeping, not content.
  const { id: _id, updated_at: _u, ...content } = row;

  writeFile(
    file,
    `${BANNER(`public.${table}`)}
import type { ${type} } from "../types";

const ${varName}: ${type} = ${literal(content, 0)};

export default ${varName};
`
  );
  return row.sections.length;
}

/* ── Run ─────────────────────────────────────────────────────────── */
let failures = 0;

try {
  const n = await philosophySections();
  log(`philosophy chapters: ${n}`);
} catch (e) {
  failures++;
  log(`SKIPPED sustainabilitySections.ts — ${e.message}`);
}

for (const page of PAGES) {
  try {
    const n = await pageSingleton(page);
    log(`${page.file}: ${n} sections`);
  } catch (e) {
    failures++;
    log(`SKIPPED ${page.file} — ${e.message}`);
  }
}

log(
  failures
    ? `done with ${failures} skipped — those fallbacks keep their committed contents.`
    : "done — all fallbacks snapshotted from the CMS."
);
process.exit(0);
