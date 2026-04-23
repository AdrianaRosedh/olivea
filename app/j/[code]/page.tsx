import { redirect } from "next/navigation";
import { listJournalSlugs } from "@/lib/journal/load";
import { makeShortCode } from "@/lib/journal/shortcode";
import type { JournalLang } from "@/lib/journal/schema";

/** Rebuild on every request — the map is small and avoids stale-cache bugs. */
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

  const map = await buildMap();
  const target = map.get(code);

  if (!target) {
    // Fallback: Spanish journal index (all journal routes require [lang] prefix)
    redirect("/es/journal");
  }

  // Canonical redirect
  redirect(target);
}
