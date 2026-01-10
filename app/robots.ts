// app/robots.ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // If you have private routes later, add disallow entries here.
        // disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
