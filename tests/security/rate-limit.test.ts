import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit, rateLimitDistributed } from "@/lib/rate-limit";

afterEach(() => vi.unstubAllEnvs());

describe("rate limiting", () => {
  it("enforces the local fallback limit", () => {
    const key = `local-test:${crypto.randomUUID()}`;
    expect(rateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(true);
    expect(rateLimit(key, { limit: 2, windowMs: 60_000 }).ok).toBe(false);
  });

  it("fails safely to local limiting when distributed storage is unconfigured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const key = `distributed-fallback-test:${crypto.randomUUID()}`;
    expect((await rateLimitDistributed(key, { limit: 1, windowMs: 60_000 })).ok).toBe(true);
    expect((await rateLimitDistributed(key, { limit: 1, windowMs: 60_000 })).ok).toBe(false);
  });

  it("uses the first forwarded address as the client IP", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.2" },
    });
    expect(clientIp(request)).toBe("203.0.113.7");
  });
});
