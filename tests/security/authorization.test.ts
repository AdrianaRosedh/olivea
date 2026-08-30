import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  requireSectionAccess: vi.fn(async () => undefined),
  requireRole: vi.fn(async () => undefined),
}));

vi.mock("@/lib/auth/session", () => authMocks);
vi.mock("@/lib/supabase/config", () => ({ isSupabaseConfigured: false }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  deleteJobOpening,
  getJobApplications,
  getJobOpenings,
  getResumeDownloadUrl,
  saveJobOpening,
} from "@/lib/supabase/careers-actions";
import {
  getJournalPosts,
  publishJournalPost,
  saveJournalPost,
} from "@/lib/supabase/content-actions";

describe("server-action authorization boundaries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows careers reads only through the careers section viewer guard", async () => {
    await getJobOpenings();
    expect(authMocks.requireSectionAccess).toHaveBeenCalledWith("pages.careers", "viewer");
    expect(authMocks.requireRole).not.toHaveBeenCalled();
  });

  it("requires careers editor access to change an opening", async () => {
    await saveJobOpening({ titleEs: "Chef", titleEn: "Chef" });
    expect(authMocks.requireSectionAccess).toHaveBeenCalledWith("pages.careers", "editor");
  });

  it.each([
    ["applicant records", () => getJobApplications()],
    ["resume links", () => getResumeDownloadUrl("00000000-0000-4000-8000-000000000000")],
    ["destructive opening changes", () => deleteJobOpening("00000000-0000-4000-8000-000000000000")],
  ])("requires manager role for %s", async (_name, action) => {
    await action();
    expect(authMocks.requireSectionAccess).toHaveBeenCalledWith("pages.careers", "editor");
    expect(authMocks.requireRole).toHaveBeenCalledWith("manager");
  });

  it("requires journal viewer access to read drafts", async () => {
    await getJournalPosts();
    expect(authMocks.requireSectionAccess).toHaveBeenCalledWith("content.journal", "viewer");
  });

  it.each([
    [
      "save",
      () => saveJournalPost({
        id: "00000000-0000-4000-8000-000000000000",
        status: "draft",
      } as never),
    ],
    ["publish", () => publishJournalPost("00000000-0000-4000-8000-000000000000")],
  ])("requires journal editor access to %s", async (_name, action) => {
    await action();
    expect(authMocks.requireSectionAccess).toHaveBeenCalledWith("content.journal", "editor");
  });
});
