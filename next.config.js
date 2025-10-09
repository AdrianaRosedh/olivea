// next.config.js (ESM; your project has "type":"module")
import bundleAnalyzer from '@next/bundle-analyzer'
import withMDX        from '@next/mdx'
import remarkGfm      from 'remark-gfm'
import rehypeSlug     from 'rehype-slug'

// MDX image speed-ups / quality-of-life
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkFrontmatter       from 'remark-frontmatter'
import remarkMdxFrontmatter    from 'remark-mdx-frontmatter'
import remarkUnwrapImages      from 'remark-unwrap-images'
import rehypeImgSize           from 'rehype-img-size'   // injects width/height for local images in /public

/** 1) MDX loader setup (kept close to your original) */
const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    // You had this originally; okay to keep:
    providerImportSource: '@mdx-js/react',
    // Add frontmatter + unwrap images so rehype-img-size can set w/h
    remarkPlugins: [
      remarkFrontmatter,
      remarkMdxFrontmatter,
      remarkGfm,
      remarkUnwrapImages,
    ],
    // Add autolinked headings + inject width/height for local images (from /public)
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypeImgSize, { dir: 'public' }],
    ],
  },
})

/** 2) bundle-analyzer setup (unchanged) */
const withBundleAnalyzer = bundleAnalyzer({
  enabled:      process.env.ANALYZE === 'true',
  openAnalyzer: true,
  analyzerMode: 'static',
})

/** 3) unified Next.js config (kept as-is, with small image-domain additions) */
const nextConfig = {
  reactStrictMode: true,

  pageExtensions: ['ts','tsx','mdx'],

  // ─── SVG Loader for SSR (kept your original rule) ─────────────
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(mdx|jsx?|tsx?)$/,
      use: ['@svgr/webpack'],
    })
    return config
  },

  // ─── Image Optimization ───────────────────────────────────────
  images: {
    formats: ['image/avif','image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // drop 2048/3840
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'oliveafarmtotable.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      // add a couple you already allow in CSP to avoid silent blocks:
      { protocol: 'https', hostname: 'static1.cloudbeds.com' },
      { protocol: 'https', hostname: 'www.opentable.com' },
      { protocol: 'https', hostname: 'www.opentable.com.mx' },
      { protocol: 'https', hostname: 'maps.gstatic.com' },
    ],
    unoptimized: false,
  },

  // ─── Compiler Optimizations (kept) ────────────────────────────
  compiler: {
    styledComponents: true,
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error','warn'] }
        : false,
  },

  poweredByHeader: false,
  eslint:          { ignoreDuringBuilds: false },
  typescript:      { ignoreBuildErrors: false },

  // ─── Security Headers (kept as you had) ───────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://*.canva.com",
              "style-src 'self' 'unsafe-inline' https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com",
              "style-src-elem 'self' https://www.opentable.com.mx https://www.opentable.com",
              "font-src 'self' data: https://www.opentable.com.mx https://www.opentable.com",
              "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com",
              "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com.mx https://www.opentable.com https://*.execute-api.us-west-2.amazonaws.com https://*.canva.com",
              "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com.mx https://www.opentable.com https://*.canva.com",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ]
  },

  // ─── Redirects (kept) ─────────────────────────────────────────
  async redirects() {
    return [
      { source: '/', destination: '/es', permanent: false },
      {
        source: '/:lang/oliveafarmtotable',
        destination: 'https://www.oliveafarmtotable.com',
        permanent: true,
      },
    ]
  },
}

/** 4) wrap it all: MDX first, then bundle-analyzer (kept) */
export default withBundleAnalyzer(
  withMDXConfig(nextConfig)
)