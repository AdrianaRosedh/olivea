// app/sitemap.ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
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

async function getJournalSlugs(lang: "es" | "en"): Promise<string[]> {
  const dir = path.join(process.cwd(), "content", "journal", lang);
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
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
  ];

  const out: MetadataRoute.Sitemap = [];
  const ids = getTeamIds();
  const now = new Date();

  for (const lang of ["es", "en"] as const) {
    // base routes
    for (const route of routes) {
      const p = route === "" ? `/${lang}` : `/${lang}${route}`;
      out.push({
        url: absoluteUrl(p),
        lastModified: now,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }

    // team member pages
    for (const id of ids) {
      out.push({
        url: absoluteUrl(`/${lang}/team/${id}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    // journal posts
    const journalFileSlugs = await getJournalSlugs(lang);
    for (const fileSlug of journalFileSlugs) {
      out.push({
        url: absoluteUrl(`/${lang}/journal/${fileSlug}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return out;
}