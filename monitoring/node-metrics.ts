export function registerNodeMetrics() {
  // This is where you would initialize your monitoring tools
  // For example, with OpenTelemetry, Sentry, etc.
  if (process.env.NODE_ENV === "development") {
    console.log("Node.js metrics instrumentation initialized");
  }

  // Track page load performance
  if (typeof window !== "undefined") {
    window.addEventListener("load", () => {
      const navigationTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (process.env.NODE_ENV === "development") {
        console.log(`Page loaded in ${navigationTiming.loadEventEnd}ms`);
      }
    });
  }
}
