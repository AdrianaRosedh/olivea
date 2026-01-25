import { redirect } from "next/navigation";
import { listJournalSlugs } from "@/lib/journal/load";
import { makeShortCode } from "@/lib/journal/shortcode";
import type { JournalLang } from "@/lib/journal/schema";

let cached: Map<string, string> | null = null;

async function buildMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const langs: JournalLang[] = ["es", "en"];

  for (const lang of langs) {
    const slugs = await listJournalSlugs(lang);
    for (const slug of slugs) {
      const code = makeShortCode(`${lang}:${slug}`);
      map.set(code, `/${lang}/journal/${slug}`);
    }
  }

  return map;
}

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!cached) {
    cached = await buildMap();
  }

  const target = cached.get(code);

  if (!target) {
    // Fallback: journal index (safe default)
    redirect("/journal");
  }

  // Canonical redirect
  redirect(target);
}
