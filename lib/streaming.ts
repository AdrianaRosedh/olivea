/**
 * Utility functions for streaming data in React Server Components
 */

/**
 * Simulates a delay for demonstration purposes
 * @param ms Milliseconds to delay
 */
export async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  
  /**
   * Fetches data with a simulated delay to demonstrate streaming
   * @param fetchFn The actual fetch function to call
   * @param delayMs Optional delay in milliseconds
   */
  export async function fetchWithDelay<T>(fetchFn: () => Promise<T>, delayMs = 0): Promise<T> {
    if (delayMs > 0) {
      await delay(delayMs)
    }
    return fetchFn()
  }
  
  /**
   * Creates a promise that resolves after a specified time
   * Useful for artificial delays in development to test streaming
   * @param ms Milliseconds to delay
   */
  export function createDelayedPromise<T>(value: T, ms: number): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, ms)
    })
  }
  