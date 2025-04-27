export function registerNodeMetrics() {
  // This is where you would initialize your monitoring tools
  // For example, with OpenTelemetry, Sentry, etc.
  console.log("Node.js metrics instrumentation initialized")

  // Track page load performance
  if (typeof window !== "undefined") {
    window.addEventListener("load", () => {
      const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      console.log(`Page loaded in ${navigationTiming.loadEventEnd}ms`)
    })
  }
}
