import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.oliveafarmtotable.com"

  // Define all routes that should be in the sitemap
  const routes = [
    "",
    "/about",
    "/cafe",
    "/casa",
    "/contact",
    "/sustainability",
    "/journal",
    "/legal",
    "/farmtotable",
  ]

  // Create sitemap entries for both languages
  const sitemap: MetadataRoute.Sitemap = []

  // Add entries for both languages
  for (const lang of ["en", "es"]) {
    for (const route of routes) {
      sitemap.push({
        url: `${baseUrl}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
      })
    }
  }

  return sitemap
}
