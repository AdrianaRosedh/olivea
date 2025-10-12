// next.config.js (ESM)
import bundleAnalyzer from "@next/bundle-analyzer";
import withMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkUnwrapImages from "remark-unwrap-images";
import rehypeImgSize from "rehype-img-size";

/** 1) MDX loader */
const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: "@mdx-js/react",
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm, remarkUnwrapImages],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypeImgSize, { dir: "public" }],
    ],
  },
});

/** 2) bundle analyzer (disabled by default) */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: process.env.ANALYZE === "true",
  analyzerMode: "static",
});

/** 3) Next config */
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

  // ✅ modularizeImports belongs at the top level in Next 15
  modularizeImports: {
    "date-fns": { transform: "date-fns/{{member}}" },
    "lodash-es": { transform: "lodash-es/{{member}}" },
    // lucide-react icon paths differ per icon; this pattern works with ESM icon paths
    "lucide-react": { transform: "lucide-react/dist/esm/icons/{{member}}" },
    // react-icons is a collection of subpackages; keeping it here is optional.
    // If you use specific packs (e.g., fa/fi), consider importing directly from them in code.
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
      { protocol: "https", hostname: "oliveafarmtotable.com" },
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
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/images/:path*", headers: immutable },
      { source: "/videos/:path*", headers: immutable },
      { source: "/fonts/:path*",  headers: immutable },
      { source: "/icons/:path*",  headers: immutable },
      { source: "/_next/static/:path*", headers: immutable },
      { source: "/:path*", headers: [{ key: "Timing-Allow-Origin", value: "*" }] },
    ];
  },

  async redirects() {
    return [
      { source: "/", destination: "/es", permanent: false },
      {
        source: "/:lang/oliveafarmtotable",
        destination: "https://www.oliveafarmtotable.com",
        permanent: true,
      },
    ];
  },
};

/** 6) wrap it all: MDX first, then bundle-analyzer */
export default withBundleAnalyzer(withMDXConfig(nextConfig));