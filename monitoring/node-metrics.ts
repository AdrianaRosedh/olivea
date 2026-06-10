export function registerNodeMetrics() {
  // Hook for OpenTelemetry / Sentry / custom Node-runtime instrumentation.
  // Browser Web Vitals are collected by @vercel/analytics in app/layout.tsx —
  // do not duplicate that here. Server errors are reported by onRequestError
  // in instrumentation.ts.

  // Boot-time env sanity: the app degrades gracefully without these (static
  // content fallback), so warn loudly instead of crashing the deploy.
  const expected = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
  ];
  const missing = expected.filter((k) => !process.env[k]);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(
      `[env] Missing in production (CMS/admin features fall back or fail): ${missing.join(", ")}`
    );
  }

  if (process.env.ADMIN_AUTH_BYPASS && process.env.NODE_ENV === "production") {
    console.error(
      "[env] ADMIN_AUTH_BYPASS is set in production — the admin portal auth is bypassed. Unset it immediately."
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Node.js metrics instrumentation initialized");
  }
}
