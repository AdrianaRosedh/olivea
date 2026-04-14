// lib/rate-limit.ts
//
// Lightweight in-memory per-IP token bucket. Best-effort only — in a serverless
// environment (Vercel) each instance has its own memory, so this doesn't
// replace a proper distributed limiter (Upstash, Vercel KV). It's intended as
// a cheap first line of defense against scripted abuse for endpoints that are
// already CDN-cached (s-maxage).
//
// Usage:
//   const { ok, retryAfter } = rateLimit(ip, { limit: 60, windowMs: 60_000 });
//   if (!ok) return new Response("Too Many Requests", { status: 429, headers: { "Retry-After": String(retryAfter) } });

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodic cleanup to prevent unbounded memory growth in a long-lived instance.
// Runs cheaply: O(n) where n = active IPs in the current window.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}

export interface RateLimitOptions {
  /** Max requests per window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  /** Remaining requests in the current window. */
  remaining: number;
  /** Seconds until window reset. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const ok = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);

  return { ok, remaining, retryAfter };
}

/**
 * Extract a client IP from a Request. Prefers `x-forwarded-for` (Vercel sets
 * this), falls back to `x-real-ip`, finally a placeholder so we never key by
 * `undefined`.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}
