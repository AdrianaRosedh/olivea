/**
 * Utility functions for performance optimization
 */

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function to limit the rate at which a function is executed
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Measure component render time
export function measureRenderTime(componentName: string) {
  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    console.log(`[Performance] ${componentName} rendered in ${endTime - startTime}ms`)
  }
}

// Detect slow network connections
export function isSlowConnection(): boolean {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = (navigator as any).connection

    if (connection) {
      // 'slow-2g', '2g', '3g', or '4g'
      if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
        return true
      }

      // If downlink is less than 1 Mbps
      if (connection.downlink < 1) {
        return true
      }
    }
  }

  return false
}
