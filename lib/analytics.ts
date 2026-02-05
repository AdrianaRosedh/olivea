// lib/analytics.ts

type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Track a page view */
export async function trackPageView(url: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // Example implementation - replace with your analytics provider
    console.log(`[Analytics] Page view: ${url}`);
    // window.gtag?.("config", "GA_MEASUREMENT_ID", { page_path: url });
  } catch (error) {
    console.error("[Analytics] Error tracking page view:", error);
  }
}

/** Track a custom event */
export async function trackEvent(
  eventName: string,
  properties?: AnalyticsParams
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    console.log(`[Analytics] Event: ${eventName}`, properties);
    // window.gtag?.("event", eventName, properties);
  } catch (error) {
    console.error(`[Analytics] Error tracking event ${eventName}:`, error);
  }
}

/** Initialize analytics */
export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[Analytics] Initialized");
    // Example GA bootstrap here…
  } catch (error) {
    console.error("[Analytics] Error initializing analytics:", error);
  }
}
