import { beforeEach, describe, expect, it, vi } from "vitest";

// Every export of lib/supabase/actions.ts is a server action the browser can
// call directly, and each one uses the service-role key. These tests pin that
// none of them reads or writes before an admin session is checked, and that the
// page-content pair accepts only its own singleton tables.

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(async () => {
    throw new Error("NEXT_REDIRECT /admin/login");
  }),
  requireRole: vi.fn(async () => {
    throw new Error("NEXT_REDIRECT /admin/login");
  }),
  requireSectionAccess: vi.fn(async () => undefined),
  selectRows: vi.fn(async () => []),
  selectOne: vi.fn(async () => null),
  upsertRows: vi.fn(async () => []),
  updateRows: vi.fn(async () => []),
  deleteRows: vi.fn(async () => []),
}));

vi.mock("@/lib/auth/session", () => ({
  requireSession: mocks.requireSession,
  requireRole: mocks.requireRole,
  requireSectionAccess: mocks.requireSectionAccess,
}));
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: true }));
vi.mock("@/lib/supabase/client", () => ({
  selectRows: mocks.selectRows,
  selectOne: mocks.selectOne,
  upsertRows: mocks.upsertRows,
  updateRows: mocks.updateRows,
  deleteRows: mocks.deleteRows,
}));
vi.mock("@/lib/auth/audit", () => ({ logAudit: vi.fn(async () => undefined) }));
vi.mock("@/lib/indexnow", () => ({ pingIndexNowForPaths: vi.fn(async () => undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import * as actions from "@/lib/supabase/actions";

const db = () =>
  mocks.selectRows.mock.calls.length +
  mocks.selectOne.mock.calls.length +
  mocks.upsertRows.mock.calls.length +
  mocks.updateRows.mock.calls.length +
  mocks.deleteRows.mock.calls.length;

describe("admin content actions without a session", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ["getPopups", () => actions.getPopups()],
    ["getPopup", () => actions.getPopup("x")],
    ["getBanners", () => actions.getBanners()],
    ["getBanner", () => actions.getBanner("x")],
    ["getCasaFaq", () => actions.getCasaFaq()],
    ["getCareersContent", () => actions.getCareersContent()],
    ["getHeroVideos", () => actions.getHeroVideos()],
    ["getHomeContent", () => actions.getHomeContent()],
    ["getPageContent", () => actions.getPageContent("cafe_content")],
    ["getSustainabilitySections", () => actions.getSustainabilitySections()],
    ["getPressItemsAdmin", () => actions.getPressItemsAdmin()],
  ])("%s refuses before touching the database", async (_name, call) => {
    await expect(call()).rejects.toThrow(/NEXT_REDIRECT/);
    expect(db()).toBe(0);
  });

  it("savePageContent refuses before touching the database", async () => {
    await expect(actions.savePageContent("cafe_content", {})).rejects.toThrow(/NEXT_REDIRECT/);
    expect(db()).toBe(0);
  });
});

describe("page-content table allow-list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSession.mockResolvedValue(undefined as never);
    mocks.requireRole.mockResolvedValue(undefined as never);
  });

  it.each(["admin_users", "job_applications", "secure_documents", "cafe_content?select=*"])(
    "getPageContent refuses %s",
    async (table) => {
      await expect(actions.getPageContent(table as never)).rejects.toThrow("Unknown page table.");
      expect(db()).toBe(0);
    },
  );

  it("savePageContent refuses a table outside the list", async () => {
    await expect(actions.savePageContent("admin_users" as never, { role: "owner" })).rejects.toThrow(
      "Unknown page table.",
    );
    expect(db()).toBe(0);
  });

  it("a signed-in admin can read a page singleton", async () => {
    await expect(actions.getPageContent("cafe_content")).resolves.toBeNull();
    expect(mocks.selectRows).toHaveBeenCalledWith("cafe_content", expect.anything());
  });
});
