// app/robots.ts
import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // If you add private routes later, uncomment:
        // disallow: ["/api/", "/_next/"],
      },
    ],
    // ✅ Always canonical (never preview / localhost)
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
