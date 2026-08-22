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

/**
 * A flag that expires.
 *
 * setFlag/isFlagSet store "1" forever, which silently turned every popup
 * frequency into "once, ever". Storing the timestamp instead lets the caller
 * decide how long the flag counts for.
 */
export function setStamp(key: string): void {
  safeSet(key, String(Date.now()));
}

/**
 * True when the flag was set within the last `days`. A flag with no expiry
 * (days omitted) counts forever, which is what "once ever" means.
 */
export function isStampFresh(key: string, days?: number): boolean {
  const raw = safeGet(key);
  if (!raw) return false;
  if (days === undefined) return true;

  // Values written by the previous setFlag() are "1"; treat them as "seen
  // long ago" rather than "seen now", so an expiring popup returns rather
  // than staying suppressed forever from a legacy flag.
  const ts = Number(raw);
  if (!Number.isFinite(ts) || ts <= 1) return false;

  return Date.now() - ts < days * 24 * 60 * 60 * 1000;
}
