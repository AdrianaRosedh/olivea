import { beforeEach, describe, expect, it, vi } from "vitest";

// The admin login actions are public endpoints. They limit attempts per
// visitor and per email, send a magic link only to existing admins, and give
// every other email the same answer, so the form cannot list who is an admin.

const mocks = vi.hoisted(() => ({
  limitOk: true,
  admins: [] as { id: string }[],
  generateLink: vi.fn(async () => ({ data: { properties: { hashed_token: "h" } }, error: null })),
  sendMagicLinkEmail: vi.fn(async () => undefined),
  signInWithPassword: vi.fn(async () => ({ error: null })),
  selectRows: vi.fn(async () => mocks.admins),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.7"], ["host", "localhost:3000"]]),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({
  rateLimitDistributed: vi.fn(async () => ({ ok: mocks.limitOk, remaining: 0, retryAfter: 60 })),
}));
vi.mock("@/lib/auth/supabase-server", () => ({
  createClient: async () => ({
    auth: { signInWithPassword: mocks.signInWithPassword, getUser: async () => ({ data: { user: null } }) },
  }),
  createAdminClient: () => ({ auth: { admin: { generateLink: mocks.generateLink } } }),
}));
vi.mock("@/lib/supabase/client", () => ({
  selectRows: mocks.selectRows,
  insertRows: vi.fn(),
  updateRows: vi.fn(),
  deleteRows: vi.fn(),
  assertUUID: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({ requireRole: vi.fn() }));
vi.mock("@/lib/email/send", () => ({ sendMagicLinkEmail: mocks.sendMagicLinkEmail }));

import { loginWithEmail, loginWithMagicLink } from "@/lib/auth/actions";

describe("magic link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limitOk = true;
    mocks.admins = [];
  });

  it("sends nothing to an email that is not an admin, with the usual answer", async () => {
    await expect(loginWithMagicLink("stranger@example.com")).resolves.toEqual({ error: null });
    expect(mocks.generateLink).not.toHaveBeenCalled();
    expect(mocks.sendMagicLinkEmail).not.toHaveBeenCalled();
  });

  it("sends the link to an admin, matching the email case-insensitively", async () => {
    mocks.admins = [{ id: "a1" }];
    await expect(loginWithMagicLink("  Admin@Example.com ")).resolves.toEqual({ error: null });
    expect(mocks.selectRows).toHaveBeenCalledWith(
      "admin_users",
      expect.objectContaining({ query: expect.stringContaining("email=eq.admin%40example.com") }),
    );
    expect(mocks.generateLink).toHaveBeenCalledWith(expect.objectContaining({ email: "admin@example.com" }));
    expect(mocks.sendMagicLinkEmail).toHaveBeenCalledTimes(1);
  });

  it("ignores malformed input without touching anything", async () => {
    await expect(loginWithMagicLink("not-an-email")).resolves.toEqual({ error: null });
    await expect(loginWithMagicLink(42 as never)).resolves.toEqual({ error: null });
    expect(mocks.selectRows).not.toHaveBeenCalled();
  });

  it("stops when the attempt limit is reached", async () => {
    mocks.limitOk = false;
    mocks.admins = [{ id: "a1" }];
    const res = await loginWithMagicLink("admin@example.com");
    expect(res.error).toMatch(/Too many attempts/);
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });
});

describe("password login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.limitOk = true;
  });

  it("stops when the attempt limit is reached, before asking Supabase", async () => {
    mocks.limitOk = false;
    const res = await loginWithEmail("admin@example.com", "pw");
    expect(res.error).toMatch(/Too many attempts/);
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects malformed input without asking Supabase", async () => {
    await expect(loginWithEmail("nope", "pw")).resolves.toEqual({ error: "Invalid login credentials" });
    await expect(loginWithEmail("a@b.co", "")).resolves.toEqual({ error: "Invalid login credentials" });
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs in with the normalized email", async () => {
    await expect(loginWithEmail(" Admin@Example.com", "pw")).resolves.toEqual({ error: null });
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: "admin@example.com", password: "pw" });
  });
});
