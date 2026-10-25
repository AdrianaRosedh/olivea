// app/sitemap.ts
import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";
import { loadTeam } from "@/app/[lang]/(main)/team/teamData";
import { listJournalIndex } from "@/lib/journal/load";

async function getTeamIds(): Promise<string[]> {
  const team = await loadTeam();
  return team.map((m) => m.id).filter((x): x is string => typeof x === "string" && !!x);
}

function cleanUrl(u: string): string {
  return u.trim().replace(/\s+/g, "");
}

function cleanPath(p: string): string {
  // Ensure no accidental spaces and collapse //
  // (safe because canonicalUrl will handle https:// properly)
  return p.trim().replace(/\s+/g, "").replace(/\/{2,}/g, "/");
}

// The same list the journal page shows: MDX files AND posts written in the
// admin (Supabase). Reading only content/journal/*.mdx left every admin-written
// post (e.g. "Mesa Invitada Vol. 2") out of the sitemap.
async function getJournalEntries(
  lang: "es" | "en"
): Promise<Array<{ slug: string; lastModified: Date }>> {
  try {
    const items = await listJournalIndex(lang);
    return items
      .filter((it) => typeof it.slug === "string" && it.slug.length > 0)
      .map((it) => {
        const d = it.publishedAt ? new Date(it.publishedAt) : null;
        return { slug: it.slug, lastModified: d && !Number.isNaN(d.getTime()) ? d : new Date() };
      })
      .sort((a, b) => a.slug.localeCompare(b.slug));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "", // homepage
    "/cafe",
    "/press",
    "/carreras",
    "/casa",
    "/contact",
    "/sustainability",
    "/journal",
    "/legal",
    "/farmtotable",
    "/menu",
    "/innovation",
    "/roseiies",
    "/team",
    "/mesa-invitada",
  ] as const;

  const out: MetadataRoute.Sitemap = [];
  const ids = await getTeamIds();
  const now = new Date();

  // ─── Static routes (both languages, with hreflang alternates) ───
  for (const route of routes) {
    const isHome = route === "";
    const isJournalIndex = route === "/journal";
    const isCoreExperience = route === "/casa" || route === "/farmtotable" || route === "/cafe" || route === "/sustainability";

    const esPath = cleanPath(isHome ? "/es" : `/es${route}`);
    const enPath = cleanPath(isHome ? "/en" : `/en${route}`);

    const alternates = {
      languages: {
        es: cleanUrl(canonicalUrl(esPath)),
        en: cleanUrl(canonicalUrl(enPath)),
      },
    };

    for (const lang of ["es", "en"] as const) {
      const p = lang === "es" ? esPath : enPath;
      out.push({
        url: cleanUrl(canonicalUrl(p)),
        lastModified: now,
        changeFrequency: isHome ? "daily" : "weekly",
        priority: isHome ? 1.0 : isCoreExperience || isJournalIndex ? 0.9 : 0.8,
        alternates,
      });
    }
  }

  // ─── Team member pages ───
  for (const id of ids) {
    const esPath = cleanPath(`/es/team/${id}`);
    const enPath = cleanPath(`/en/team/${id}`);

    const alternates = {
      languages: {
        es: cleanUrl(canonicalUrl(esPath)),
        en: cleanUrl(canonicalUrl(enPath)),
      },
    };

    for (const lang of ["es", "en"] as const) {
      const p = lang === "es" ? esPath : enPath;
      out.push({
        url: cleanUrl(canonicalUrl(p)),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates,
      });
    }
  }

  // ─── Journal entries ───
  const journalByLang = {
    es: await getJournalEntries("es"),
    en: await getJournalEntries("en"),
  };
  const journalSlugs = {
    es: new Set(journalByLang.es.map((e) => e.slug)),
    en: new Set(journalByLang.en.map((e) => e.slug)),
  };
  for (const lang of ["es", "en"] as const) {
    for (const it of journalByLang[lang]) {
      // Name a translation only when that language really has the post.
      const languages: Record<string, string> = {};
      for (const l of ["es", "en"] as const) {
        if (journalSlugs[l].has(it.slug)) {
          languages[l] = cleanUrl(canonicalUrl(cleanPath(`/${l}/journal/${it.slug}`)));
        }
      }
      const alternates = { languages };

      out.push({
        url: cleanUrl(canonicalUrl(cleanPath(`/${lang}/journal/${it.slug}`))),
        lastModified: it.lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates,
      });
    }
  }

  return out;
}
