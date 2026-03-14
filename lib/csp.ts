// lib/csp.ts
//
// Static CSP string for next.config.js headers().
// The middleware (proxy.ts) builds its own CSP dynamically per-route;
// this file only provides the catch-all header value.

const isDev = process.env.NODE_ENV !== "production";

/**
 * STATIC_CSP matches proxy.ts buildCsp() with default flags:
 *   allowEmbeddingSelf: false
 *   allowCloudbedsPage: true
 *   allowLocatorPage: false
 */
function buildStaticCsp(): string {
  const scriptUnsafeEval = isDev ? " 'unsafe-eval'" : "";

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `connect-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://challenges.cloudflare.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://*.execute-api.us-west-2.amazonaws.com https://www.canva.com https://connect.facebook.net https://*.canva.com https://clientstream.launchdarkly.com https://events.launchdarkly.com https://app.launchdarkly.com https://api.cloudbeds.com https://tile.openstreetmap.org`,
    `script-src 'self' 'unsafe-inline'${scriptUnsafeEval} https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://connect.facebook.net https://www.opentable.com.mx`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,
    `img-src 'self' data: blob: https://www.google-analytics.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com https://www.opentable.com.mx https://*.canva.com https://lh3.googleusercontent.com https://tile.openstreetmap.org https://*.cloudbeds.com`,
    "media-src 'self' blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `frame-src 'self' https://challenges.cloudflare.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com`,
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];

  return directives.join("; ");
}

export const STATIC_CSP = buildStaticCsp();
