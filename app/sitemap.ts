// app/sitemap.ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { TEAM } from "@/app/(main)/[lang]/team/teamData";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", // homepage
    "/about",
    "/cafe",
    "/casa",
    "/contact",
    "/sustainability",
    "/journal",
    "/legal",
    "/farmtotable",

    // ✅ linktree index
    "/team",
  ];

  const out: MetadataRoute.Sitemap = [];
  const ids = getTeamIds();
  const now = new Date();

  for (const lang of ["es", "en"] as const) {
    for (const route of routes) {
      const path = route === "" ? `/${lang}` : `/${lang}${route}`;
      out.push({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }

    // ✅ member pages
    for (const id of ids) {
      const path = `/${lang}/team/${id}`;
      out.push({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return out;
}