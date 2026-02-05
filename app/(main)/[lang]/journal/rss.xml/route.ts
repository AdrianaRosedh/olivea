// app/(main)/[lang]/journal/rss.xml/route.ts
import { NextResponse } from "next/server";
import { listJournalIndex, type JournalIndexItem } from "@/lib/journal/load";
import { SITE } from "@/lib/site";

type UnknownRecord = Record<string, unknown>;

function isRecord(x: unknown): x is UnknownRecord {
  return !!x && typeof x === "object";
}

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getString(obj: unknown, key: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getIsoDate(obj: unknown): string | undefined {
  if (!isRecord(obj)) return undefined;

  // Prefer common keys
  const candidates = [
    obj["publishedAt"],
    obj["updatedAt"],
    obj["datePublished"],
    obj["dateModified"],
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.length >= 10) return c;
  }
  return undefined;
}

function getExcerpt(obj: unknown): string | undefined {
  if (!isRecord(obj)) return undefined;

  // Try common keys
  const candidates = [
    obj["excerpt"],
    obj["description"],
    obj["summary"],
    obj["deck"],
    obj["subtitle"],
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return undefined;
}

export async function GET(
  _req: Request,
  { params }: { params: { lang: string } }
) {
  const lang = params.lang === "es" ? "es" : "en";
  const base = SITE.baseUrl;

  const journalUrl = `${base}/${lang}/journal`;

  let posts: JournalIndexItem[] = [];
  try {
    posts = await listJournalIndex(lang);
  } catch {
    posts = [];
  }

  const items = posts
    .slice(0, 50)
    .map((p) => {
      const slug = getString(p as unknown, "slug") ?? (p as unknown as { slug?: string }).slug ?? "";
      const titleRaw = getString(p as unknown, "title") ?? (p as unknown as { title?: string }).title ?? "Olivea Journal";
      const excerptRaw = getExcerpt(p as unknown) ?? "";
      const iso = getIsoDate(p as unknown) ?? new Date().toISOString();

      const url = `${base}/${lang}/journal/${slug}`;
      const title = esc(titleRaw);
      const desc = esc(excerptRaw);

      return `
<item>
  <title>${title}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${new Date(iso).toUTCString()}</pubDate>
  ${desc ? `<description>${desc}</description>` : ""}
</item>`;
    })
    .join("\n");

  const channelTitle = lang === "es" ? "Olivea Journal" : "Olivea Journal";
  const channelDesc =
    lang === "es"
      ? "Artículos, notas y decisiones del ecosistema Olivea."
      : "Articles, field notes, and decisions from the Olivea ecosystem.";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${esc(channelTitle)}</title>
  <link>${journalUrl}</link>
  <description>${esc(channelDesc)}</description>
  <language>${lang === "es" ? "es-MX" : "en-US"}</language>
  ${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
