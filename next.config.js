// next.config.js (explicitly cleaned up and optimized)
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowServerActionsInClientComponents: true },
    optimizeCss: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    domains: ["olivea.com", "images.unsplash.com"],
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },
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
              "img-src 'self' data: blob: https://static1.cloudbeds.com",
              "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com https://*.supabase.co",
              "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/", destination: "/es", permanent: false }];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
    styledComponents: true,
  },
  poweredByHeader: false,
};

export default nextConfig;