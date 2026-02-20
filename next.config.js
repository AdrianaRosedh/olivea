import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkUnwrapImages from "remark-unwrap-images";
import rehypeImgSize from "rehype-img-size";

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
/* 1) MDX loader                                                  */
/* ────────────────────────────────────────────────────────────── */
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkUnwrapImages,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypeImgSize, { dir: "public" }],
    ],
  },
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
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,
  pageExtensions: ["ts", "tsx", "mdx"],

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "date-fns",
      "lodash-es",
      "react-icons",
    ],
  },

  modularizeImports: {
    "date-fns": { transform: "date-fns/{{member}}" },
    "lodash-es": { transform: "lodash-es/{{member}}" },
    "lucide-react": { transform: "lucide-react/dist/esm/icons/{{member}}" },
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(mdx|jsx?|tsx?)$/,
      use: ["@svgr/webpack"],
    });
    return config;
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

      /**
       * IMPORTANT:
       * Do NOT mark /_next/image as immutable.
       * It serves many variants (w/q/etc). Let Next/Vercel manage caching correctly.
       */

      {
        source: "/:path*",
        headers: [{ key: "Timing-Allow-Origin", value: "*" }],
      },
    ];
  },

  /**
   * ✅ KEY FIX FOR WHATSAPP PREVIEWS:
   * Use rewrites so "/" returns 200 HTML (no redirect),
   * allowing bots to read OG tags.
   */
  async rewrites() {
    return [
      // Serve Spanish content at "/" without redirect
      { source: "/", destination: "/es" },

      // Legacy journal paths without redirects (bot-friendly)
      { source: "/journal", destination: "/es/journal" },
      { source: "/journal/:slug*", destination: "/es/journal/:slug*" },
    ];
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