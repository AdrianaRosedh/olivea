import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";

/* ────────────────────────────────────────────────────────────── */
/* Canonical URL helpers                                          */
/* ────────────────────────────────────────────────────────────── */
function resolvePublicUrl() {
  const { NEXT_PUBLIC_SITE_URL, SITE_URL, VERCEL_URL } = process.env;
  if (NEXT_PUBLIC_SITE_URL) return NEXT_PUBLIC_SITE_URL;
  if (SITE_URL) return SITE_URL;
  if (VERCEL_URL) return `https://${VERCEL_URL}`;
  return "http://localhost:3000";
}
const PUBLIC_URL = resolvePublicUrl();
const { hostname: PUBLIC_HOSTNAME } = new URL(PUBLIC_URL);

/* ────────────────────────────────────────────────────────────── */
/* CSP — single source of truth lives in lib/csp.ts               */
/* ────────────────────────────────────────────────────────────── */
// @ts-expect-error — Next.js resolves .ts imports in config files
import { STATIC_CSP } from "./lib/csp.ts";

/* ────────────────────────────────────────────────────────────── */
/* 1) MDX loader (Turbopack-compatible — no non-serializable     */
/*    plugin options. Remark/rehype plugins are only needed by    */
/*    next-mdx-remote which configures its own pipeline.)         */
/* ────────────────────────────────────────────────────────────── */
const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/* ────────────────────────────────────────────────────────────── */
/* 2) bundle analyzer (disabled by default)                       */
/* ────────────────────────────────────────────────────────────── */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: process.env.ANALYZE === "true",
  analyzerMode: "static",
});

/* ────────────────────────────────────────────────────────────── */
/* 3) Next config                                                 */
/* ────────────────────────────────────────────────────────────── */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  pageExtensions: ["ts", "tsx", "mdx"],

  experimental: {
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "date-fns",
      "lodash-es",
      "react-icons",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: PUBLIC_HOSTNAME },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "maps.gstatic.com" },
      { protocol: "https", hostname: "static1.cloudbeds.com" },
      { protocol: "https", hostname: "www.opentable.com" },
      { protocol: "https", hostname: "www.opentable.com.mx" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    unoptimized: false,
  },

  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },

  async headers() {
    const immutable = [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ];

    return [
      { source: "/images/:path*", headers: immutable },
      { source: "/videos/:path*", headers: immutable },
      { source: "/fonts/:path*", headers: immutable },
      { source: "/icons/:path*", headers: immutable },
      { source: "/_next/static/:path*", headers: immutable },

      // Apply CSP + timing to all routes
      {
        source: "/:path*",
        headers: [
          { key: "Timing-Allow-Origin", value: "*" },
          { key: "Content-Security-Policy", value: STATIC_CSP },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },

  /**
   * KEY FIX FOR WHATSAPP PREVIEWS:
   * Use rewrites so "/" returns 200 HTML (no redirect),
   * allowing bots to read OG tags.
   */
  async rewrites() {
    // Resolve the admin hostname (configurable via env var)
    const adminHost = process.env.ADMIN_HOSTNAME ?? "admin.oliveafarmtotable.com";

    return {
      beforeFiles: [
        // ── Subdomain routing: block /admin on main domain ────────
        // If the hostname is NOT the admin subdomain, NOT localhost,
        // and NOT a Vercel preview → rewrite /admin/* to a 404 page.
        // This is a defense-in-depth layer on top of the server
        // component check in the admin layout.
        {
          source: "/admin/:path*",
          destination: "/not-found",
          has: [
            {
              type: "host" as const,
              value: `(?!${adminHost.replace(/\./g, "\\.")}$)(?!localhost$)(?!.*\\.vercel\\.app$).*`,
            },
          ],
        },
      ],
      afterFiles: [
        // Serve Spanish content at "/" without redirect
        { source: "/", destination: "/es" },

        // Legacy journal paths without redirects (bot-friendly)
        { source: "/journal", destination: "/es/journal" },
        { source: "/journal/:slug*", destination: "/es/journal/:slug*" },

        // Menu deep-link (opens Farmpop modal on farmtotable page)
        { source: "/menu", destination: "/es/menu" },
      ],
    };
  },

  /**
   * Keep only true redirects here (canonical / legacy cleanups).
   * Removed "/" and "/journal" redirects because they break unfurls.
   */
  async redirects() {
    return [
      {
        source: "/:lang/oliveafarmtotable",
        destination: PUBLIC_URL,
        permanent: true,
      },
    ];
  },
};

/* ────────────────────────────────────────────────────────────── */
/* 4) wrap it all: MDX first, then bundle-analyzer                */
/* ────────────────────────────────────────────────────────────── */
export default withBundleAnalyzer(withMDX(nextConfig));
