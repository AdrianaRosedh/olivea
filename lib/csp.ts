// lib/csp.ts
//
// Static CSP string for next.config.js headers().
// The middleware (proxy.ts) builds its own CSP dynamically per-route;
// this file only provides the catch-all header value.

const isDev = process.env.NODE_ENV !== "production";

/**
 * Single site-wide CSP, emitted via next.config.ts headers() on every route.
 * Includes the Google Maps domains the /olivea-locator map iframe needs
 * (extended component library on ajax.googleapis.com + Maps JS API + tiles).
 */
function buildStaticCsp(): string {
  const scriptUnsafeEval = isDev ? " 'unsafe-eval'" : "";

  // Payment domains (tokenex / stripe / braintree / paypal / payment-element)
  // are required by the Cloudbeds payment SDK. The booking engine renders its
  // card fields INLINE — see public/cloudbeds-immersive.html — so those hosted
  // card-number/CVV iframes load under this CSP, not under Cloudbeds'. Without
  // them window.TokenEx never defines and the card input silently never renders.
  //
  // NOTE: `form-action 'self'` still blocks a top-level 3-D Secure redirect
  // POST to an issuing bank. That path is currently gated off by Cloudbeds'
  // `handle-payment-redirects` flag, so we keep the restriction; if 3DS
  // redirects are ever enabled, this is the directive to relax.
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    `connect-src 'self' data: https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.google.com.mx https://challenges.cloudflare.com https://www.facebook.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://*.execute-api.us-west-2.amazonaws.com https://www.canva.com https://connect.facebook.net https://*.canva.com https://clientstream.launchdarkly.com https://events.launchdarkly.com https://app.launchdarkly.com https://api.cloudbeds.com https://api.us1.cloudbeds.com https://api.us2.cloudbeds.com https://payment-element.cloudbeds.com https://*.tokenex.com https://api.stripe.com https://js.stripe.com https://m.stripe.network https://api.braintreegateway.com https://client-analytics.braintreegateway.com https://www.paypal.com https://checkoutshopper-live.adyen.com https://maf.pagosonline.net https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://maps.googleapis.com https://maps.gstatic.com https://roseiies.com https://roseiies-tenant.vercel.app`,
    `script-src 'self' 'unsafe-inline'${scriptUnsafeEval} https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://connect.facebook.net https://www.opentable.com.mx https://ajax.googleapis.com https://maps.googleapis.com https://roseiies.com https://*.tokenex.com https://js.stripe.com https://m.stripe.network https://js.braintreegateway.com https://assets.braintreegateway.com https://www.paypal.com https://www.paypalobjects.com https://payment-element.cloudbeds.com https://checkoutshopper-live.adyen.com https://maf.pagosonline.net https://js.authorize.net https://js.dlocal.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx`,
    `img-src 'self' data: blob: https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.google.com.mx https://www.facebook.com https://static1.cloudbeds.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://images.unsplash.com https://www.opentable.com https://www.opentable.com.mx https://*.canva.com https://lh3.googleusercontent.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://*.cloudbeds.com https://maps.gstatic.com https://*.googleapis.com https://roseiies.com https://roseiies-tenant.vercel.app`,
    "media-src 'self' blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `frame-src 'self' https://challenges.cloudflare.com https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.opentable.com https://www.opentable.com.mx https://www.google.com https://maps.google.com https://www.google.com/maps/embed https://maps.gstatic.com https://www.canva.com https://*.canva.com https://roseiies.com https://*.tokenex.com https://js.stripe.com https://hooks.stripe.com https://m.stripe.network https://assets.braintreegateway.com https://www.paypal.com https://c.paypal.com https://payment-element.cloudbeds.com https://checkoutshopper-live.adyen.com https://maf.pagosonline.net`,
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];

  return directives.join("; ");
}

export const STATIC_CSP = buildStaticCsp();
