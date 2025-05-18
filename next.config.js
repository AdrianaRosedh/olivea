/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizeCss: true,
    serverActions: { enabled: true },
  },

  turbopack: {
    rules: {
      "*.svg": { loaders: ["@svgr/webpack"], as: "*.js" },
    },
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "olivea.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },

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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src    'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com https://plugins.whistle.cloudbeds.com",
              "style-src     'self' 'unsafe-inline' https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "style-src-elem 'self' 'unsafe-inline' https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "font-src      'self' https://www.exploretock.com",
              "frame-src     'self' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com",
              "connect-src   'self' https://*.supabase.co https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com https://*.execute-api.us-west-2.amazonaws.com",
              "img-src       'self' data: blob: https://static1.cloudbeds.com https://www.exploretock.com",
            ].join("; "),
          },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "X-Frame-Options",            value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/", destination: "/es", permanent: false },
    ];
  },
};

export default nextConfig;