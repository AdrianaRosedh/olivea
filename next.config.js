// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── Experimental / Turbopack ────────────────────────────────
  experimental: {
    optimizeCss: true,
    serverActions: { enabled: true },
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // ─── Webpack Overrides for SVGs (SSR safety) ──────────────────
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // ─── Image Optimization ────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "olivea.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },

  // ─── Compiler Optimizations ────────────────────────────────────
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    styledComponents: true,
  },

  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ─── Security Headers (including CSP & X-Frame-Options) ─────────
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com https://plugins.whistle.cloudbeds.com",
              // allow Tock’s stylesheet…
              "style-src 'self' 'unsafe-inline' https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              // …and explicitly allow style elements loaded from Tock (CSP level-3)
              "style-src-elem 'self' https://www.exploretock.com",
              // open up Tock’s web-fonts if they serve any
              "font-src 'self' https://www.exploretock.com",
              // your frame/connect/img rules…
              "frame-src 'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "connect-src 'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "img-src 'self' data: blob: https://static1.cloudbeds.com https://www.exploretock.com",
              // etc…
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",         value: "SAMEORIGIN" }, // fallback for older browsers
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },

  // ─── Redirects ────────────────────────────────────────────────
  async redirects() {
    return [
      { source: "/", destination: "/es", permanent: false },
    ];
  },
};

export default nextConfig;