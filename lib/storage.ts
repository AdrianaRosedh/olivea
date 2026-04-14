// lib/storage.ts
//
// Safe localStorage wrappers. Handles:
//   - SSR (no window)
//   - Safari private mode (throws on setItem)
//   - Quota exceeded
//   - Browsers with localStorage disabled
//
// All methods swallow errors and return fallbacks so callsites stay clean.

const hasWindow = () => typeof window !== "undefined";

export function safeGet(key: string): string | null {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): boolean {
  if (!hasWindow()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
}

/**
 * Convenience: check if a flag key is set to "1".
 * Used for one-shot dismissal patterns (popups, banners).
 */
export function isFlagSet(key: string): boolean {
  return safeGet(key) === "1";
}

export function setFlag(key: string): void {
  safeSet(key, "1");
}
