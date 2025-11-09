// app/sitemap.ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Adjust routes as needed for your project
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
  ];

  const out: MetadataRoute.Sitemap = [];

  for (const lang of ["es", "en"]) {
    for (const route of routes) {
      const path = route === "" ? `/${lang}` : `/${lang}${route}`;
      out.push({
        url: absoluteUrl(path),
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      });
    }
  }

  return out;
}
