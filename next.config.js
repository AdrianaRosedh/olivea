// next.config.js
import animatePlugin from "tailwindcss-animate";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "olivea.com",
      "images.unsplash.com",
    ],
    formats: ["image/avif", "image/webp"],
    unoptimized: false,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to every route in your app
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              // 1) only allow our own origin by default
              "default-src 'self'",
              // 2) allow inline scripts + Cloudbeds loader
              "script-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com",
              // 3) allow iframes from Cloudbeds, ExploreTock & your café
              "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com https://your-cafe-reservation-system.com",
              // 4) allow XHR/fetch back to those domains
              "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com https://your-cafe-reservation-system.com",
              // 5) images & inline styles
              "img-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "X-Frame-Options",            value: "DENY"    },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Note: we omit COEP so third-party widgets can load correctly
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source:      "/",
        destination: "/es",
        permanent:   false,
      },
    ];
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    styledComponents: true,
  },
  poweredByHeader: false,
};

export default nextConfig;