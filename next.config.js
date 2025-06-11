// next.config.js
import bundleAnalyzer from '@next/bundle-analyzer'
import withMDX        from '@next/mdx'
import remarkGfm      from 'remark-gfm'
import rehypeSlug     from 'rehype-slug'

/** 1) MDX loader setup */
const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    // required so MDXProvider comes from @mdx-js/react under the hood:
    providerImportSource: '@mdx-js/react',
    remarkPlugins:       [remarkGfm],
    rehypePlugins:       [rehypeSlug],
  },
})

/** 2) bundle-analyzer setup */
const withBundleAnalyzer = bundleAnalyzer({
  enabled:      process.env.ANALYZE === 'true',
  openAnalyzer: true,
  analyzerMode: 'static',
})

/** 3) your unified Next.js config */
const nextConfig = {
  reactStrictMode: true,

  // make Next pick up .ts, .tsx and .mdx files as routes/components
  pageExtensions: ['ts','tsx','mdx'],

  // ─── Experimental / Turbopack ────────────────────────────────
  experimental: {
    optimizeCss: true,
    serverActions: { enabled: true },
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // ─── SVG Loader for SSR ────────────────────────────────────────
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    return config
  },

  // ─── Image Optimization ────────────────────────────────────────
  images: {
    formats: ['image/avif','image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'olivea.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    unoptimized: false, // ← same as your original
  },

  // ─── Compiler Optimizations ────────────────────────────────────
  compiler: {
    styledComponents: true,
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error','warn'] }
        : false,
  },

  poweredByHeader: false,
  eslint:          { ignoreDuringBuilds: true },
  typescript:      { ignoreBuildErrors: true },

  // ─── Security Headers ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "style-src 'self' 'unsafe-inline' https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "style-src-elem 'self' https://www.exploretock.com",
              "font-src 'self' data: https://www.exploretock.com",
              "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com https://*.execute-api.us-west-2.amazonaws.com",
              "img-src 'self' data: blob: https://static1.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.exploretock.com",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy',value: 'same-origin' },
        ],
      },
    ]
  },

  // ─── Redirects ────────────────────────────────────────────────
  async redirects() {
    return [
      { source: '/', destination: '/es', permanent: false },
    ]
  },
}

/** 4) wrap it all: MDX first, then bundle-analyzer */
export default withBundleAnalyzer(
  withMDXConfig(nextConfig)
)