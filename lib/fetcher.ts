/** Shared SWR fetcher with error handling, status checks, and timeout. */

class FetchError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.info = info;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

export const fetcher = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      let info: unknown;
      try {
        info = await res.json();
      } catch {
        /* body may not be JSON */
      }
      throw new FetchError(
        `Fetch failed: ${res.status} ${res.statusText}`,
        res.status,
        info
      );
    }

    return await res.json();
  } catch (err) {
    if (err instanceof FetchError) throw err;

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new FetchError("Request timed out", 408);
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
};
