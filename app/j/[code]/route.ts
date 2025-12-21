import { NextResponse } from "next/server";
import { listJournalSlugs } from "@/lib/journal/load";
import { makeShortCode } from "@/lib/journal/shortcode";

let cached: Map<string, string> | null = null;

async function buildMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const langs = ["es", "en"] as const;

  for (const l of langs) {
    const slugs = await listJournalSlugs(l);
    for (const slug of slugs) {
      const code = makeShortCode(`${l}:${slug}`);
      map.set(code, `/${l}/journal/${slug}`);
    }
  }

  return map;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lang: string; code: string }> }
) {
  const { code } = await params;

  if (!cached) cached = await buildMap();

  const target = cached.get(code);

  if (!target) {
    return NextResponse.redirect(new URL("/journal", req.url), 302);
  }

  return NextResponse.redirect(new URL(target, req.url), 302);
}