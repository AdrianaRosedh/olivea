// lib/rate-limit.ts
//
// Fast in-memory limiter plus a Supabase-backed distributed variant for abuse-
// sensitive operations. The distributed helper fails safely to this local
// limiter when Supabase or its migration is temporarily unavailable.
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

type DistributedRateLimitResponse = {
  ok: boolean;
  remaining: number;
  retry_after: number;
};

let hmacKeyPromise: Promise<CryptoKey> | null = null;
let distributedUnavailableUntil = 0;

async function opaqueKey(rawKey: string, secret: string): Promise<string> {
  hmacKeyPromise ??= crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKeyPromise,
    new TextEncoder().encode(rawKey),
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Atomic, cross-instance rate limit. Requires the
 * `20260829_distributed_rate_limits.sql` migration. Raw IPs/emails never leave
 * the app: the database sees only an HMAC digest. A short circuit-breaker keeps
 * an unavailable RPC from adding latency to every request.
 */
export async function rateLimitDistributed(
  key: string,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const fallback = () => rateLimit(key, options);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || Date.now() < distributedUnavailableUntil) {
    return fallback();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);
  try {
    const keyHash = await opaqueKey(key, process.env.RATE_LIMIT_SALT || serviceKey);
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_rate_limit`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key_hash: keyHash,
        p_limit: options.limit,
        p_window_seconds: Math.max(1, Math.ceil(options.windowMs / 1_000)),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`rate-limit RPC returned ${response.status}`);

    const data = (await response.json()) as Partial<DistributedRateLimitResponse>;
    if (
      typeof data.ok !== "boolean" ||
      typeof data.remaining !== "number" ||
      typeof data.retry_after !== "number"
    ) {
      throw new Error("invalid rate-limit RPC response");
    }
    return {
      ok: data.ok,
      remaining: Math.max(0, data.remaining),
      retryAfter: Math.max(0, data.retry_after),
    };
  } catch {
    distributedUnavailableUntil = Date.now() + 60_000;
    return fallback();
  } finally {
    clearTimeout(timeout);
  }
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
