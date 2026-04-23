// app/sitemap.ts
import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";
import { TEAM } from "@/app/(main)/[lang]/team/teamData";
import fs from "node:fs/promises";
import path from "node:path";

type MaybeTeamItem = { id?: unknown };

function getTeamIds(): string[] {
  const t = TEAM as unknown;

  if (Array.isArray(t)) {
    return (t as MaybeTeamItem[])
      .map((m) => (typeof m?.id === "string" ? m.id : null))
      .filter((x): x is string => !!x);
  }

  if (t && typeof t === "object") {
    return Object.keys(t as Record<string, unknown>);
  }

  return [];
}

function cleanUrl(u: string): string {
  return u.trim().replace(/\s+/g, "");
}

function cleanPath(p: string): string {
  // Ensure no accidental spaces and collapse //
  // (safe because canonicalUrl will handle https:// properly)
  return p.trim().replace(/\s+/g, "").replace(/\/{2,}/g, "/");
}

async function safeStat(fullPath: string): Promise<Date | null> {
  try {
    const st = await fs.stat(fullPath);
    return st.mtime ?? null;
  } catch {
    return null;
  }
}

async function getJournalEntries(
  lang: "es" | "en"
): Promise<Array<{ slug: string; lastModified: Date }>> {
  const dir = path.join(process.cwd(), "content", "journal", lang);
  try {
    const files = await fs.readdir(dir);
    const mdx = files.filter((f) => f.endsWith(".mdx")).filter((f) => !/\s+copy(\s+\d+)?\.mdx$/i.test(f));

    const entries = await Promise.all(
      mdx.map(async (f) => {
        const slug = f.replace(/\.mdx$/, "");
        const mtime = await safeStat(path.join(dir, f));
        return { slug, lastModified: mtime ?? new Date() };
      })
    );

    entries.sort((a, b) => a.slug.localeCompare(b.slug));
    return entries;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "", // homepage
    "/about",
    "/cafe",
    "/press",
    "/carreras",
    "/casa",
    "/contact",
    "/sustainability",
    "/journal",
    "/legal",
    "/farmtotable",
    "/team",
  ] as const;

  const out: MetadataRoute.Sitemap = [];
  const ids = getTeamIds();
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
  for (const lang of ["es", "en"] as const) {
    const journalEntries = await getJournalEntries(lang);
    for (const it of journalEntries) {
      const esPath = cleanPath(`/es/journal/${it.slug}`);
      const enPath = cleanPath(`/en/journal/${it.slug}`);

      const alternates = {
        languages: {
          es: cleanUrl(canonicalUrl(esPath)),
          en: cleanUrl(canonicalUrl(enPath)),
        },
      };

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
