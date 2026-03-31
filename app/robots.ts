// app/robots.ts
import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // ✅ Standard crawlers (Google, Bing, etc.)
        userAgent: "*",
        allow: "/",
      },
      {
        // ✅ Explicitly allow AI crawlers for AI Overviews, ChatGPT, Perplexity
        userAgent: [
          "ChatGPT-User",
          "GPTBot",
          "Google-Extended",
          "PerplexityBot",
          "Applebot-Extended",
          "anthropic-ai",
          "ClaudeBot",
          "cohere-ai",
        ],
        allow: "/",
      },
    ],
    // ✅ Always canonical (never preview / localhost)
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
