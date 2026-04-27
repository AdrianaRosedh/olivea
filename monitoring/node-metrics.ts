export function registerNodeMetrics() {
  // Hook for OpenTelemetry / Sentry / custom Node-runtime instrumentation.
  // Browser Web Vitals are collected by @vercel/analytics in app/layout.tsx —
  // do not duplicate that here.
  if (process.env.NODE_ENV === "development") {
    console.log("Node.js metrics instrumentation initialized");
  }
}
