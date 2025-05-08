// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimal CSS handling
  experimental: {
    optimizeCss: true,
    serverActions: { enabled: true },
  },

  // Turbopack stable configuration (Next.js 15.3+)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Explicit SVG handling fallback via Webpack (necessary for SSR stability)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // Image optimization settings
  images: {
    domains: ["olivea.com", "images.unsplash.com"],
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },

  // Compiler optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    styledComponents: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/cloudbeds-immersive.html",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com",
              "style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com",
              "style-src-elem 'self' 'unsafe-inline' https://hotels.cloudbeds.com",
              "img-src 'self' data: blob: https://static1.cloudbeds.com https://images.unsplash.com",
              "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com https://*.supabase.co",
              "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
              "font-src 'self' data:",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [{ source: "/", destination: "/es", permanent: false }];
  },

  // Build error handling
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Privacy & security
  poweredByHeader: false,
};

export default nextConfig;