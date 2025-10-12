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

/** 2) bundle analyzer (never in prod) */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: process.env.ANALYZE === "true",
  analyzerMode: "static",
});

/** 3) Next config */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],

  experimental: {
    optimizeCss: true,
    // ↓ add framer-motion to shrink client chunks
    optimizePackageImports: ["lucide-react", "react-icons", "framer-motion"],
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "oliveafarmtotable.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "static1.cloudbeds.com" },
      { protocol: "https", hostname: "www.opentable.com" },
      { protocol: "https", hostname: "www.opentable.com.mx" },
      { protocol: "https", hostname: "maps.gstatic.com" },
    ],
    unoptimized: false,
  },

  compiler: {
    styledComponents: true,
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  /** 4) Long-cache headers for static assets (repeat-visit speed) */
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  /** 5) Redirects (as-is) */
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
