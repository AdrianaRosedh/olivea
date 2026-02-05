// lib/performance.ts

/** Debounce: limit how often a function can be called */
export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: TArgs) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/** Throttle: limit the rate at which a function is executed */
export function throttle<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  limit: number
): (...args: TArgs) => void {
  let inThrottle = false;

  return (...args: TArgs) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/** Measure component render time */
export function measureRenderTime(componentName: string): () => void {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${endTime - startTime}ms`);
  };
}

/** Detect slow network connections */
export function isSlowConnection(): boolean {
  if (typeof navigator !== "undefined") {
    type NetworkInformation = { effectiveType?: string; downlink?: number };
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

    if (connection) {
      if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") return true;
      if (typeof connection.downlink === "number" && connection.downlink < 1) return true; // < 1 Mbps
    }
  }
  return false;
}