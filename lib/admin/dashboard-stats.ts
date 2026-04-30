// lib/admin/dashboard-stats.ts
// ─────────────────────────────────────────────────────────────────────
// Server-side dashboard stat fetchers — pulls real counts from Supabase.
// Falls back to mock data if Supabase is not configured.
// ─────────────────────────────────────────────────────────────────────
"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { selectRows, countRows } from "@/lib/supabase/client";
import { requireSession } from "@/lib/auth/session";

export interface DashboardData {
  stats: {
    label: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
  }[];
  /** "Live now" — things currently visible on the public site. */
  liveNow: {
    id: string;
    kind: "banner" | "popup" | "promotion";
    label: string;
    /** Direct edit link for this item */
    href: string;
  }[];
  /** Most recent admin actions, pulled from admin_audit_log. */
  recentActivity: {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
  }[];
}

export async function getDashboardData(): Promise<DashboardData> {
  // Require authenticated admin session
  await requireSession();

  if (!isSupabaseConfigured) {
    // Return mock data for local dev without Supabase
    return {
      stats: [
        { label: "Journal posts", value: "—", trend: "neutral" },
        { label: "Team members", value: "—", trend: "neutral" },
      ],
      liveNow: [],
      recentActivity: [],
    };
  }

  // Fetch all counts in parallel
  const [
    journalCount,
    teamCount,
    pageCount,
    liveOpeningsCount,
    applicationsCount,
  ] = await Promise.all([
    countRows("journal_posts"),
    countRows("admin_users"),
    countRows("page_content"),
    countRows("job_openings", { filter: "status=eq.live" }),
    countRows("job_applications"),
  ]);

  const stats = [
    {
      label: "Journal posts",
      value: String(journalCount),
      change: journalCount > 0 ? "Published articles" : undefined,
      trend: "neutral" as const,
    },
    {
      label: "Team members",
      value: String(teamCount),
      trend: "neutral" as const,
    },
    {
      label: "Pages managed",
      value: String(pageCount),
      change: pageCount > 0 ? "Content sections via CMS" : undefined,
      trend: "neutral" as const,
    },
    {
      label: "Job openings",
      value: String(liveOpeningsCount),
      change: applicationsCount > 0 ? `${applicationsCount} application${applicationsCount !== 1 ? "s" : ""}` : undefined,
      trend: "neutral" as const,
    },
  ];

  // ── "Live now" — items currently visible on the public site ──
  const liveNow: DashboardData["liveNow"] = [];

  try {
    const [activeBanners, activePopups, activePromos] = await Promise.all([
      selectRows<{ id: string; translations: { es?: { text?: string }; en?: { text?: string } } | null }>(
        "banners",
        {
          role: "service_role",
          query: "select=id,translations&enabled=eq.true&order=created_at.desc&limit=10",
        }
      ).catch(() => []),
      selectRows<{ id: string; translations: { es?: { text?: string }; en?: { text?: string } } | null }>(
        "popups",
        {
          role: "service_role",
          query: "select=id,translations&enabled=eq.true&order=created_at.desc&limit=10",
        }
      ).catch(() => []),
      selectRows<{ id: string; title_es?: string; title_en?: string; enabled: boolean }>(
        "promotions",
        {
          role: "service_role",
          query: "select=id,title_es,title_en,enabled&enabled=eq.true&order=created_at.desc&limit=10",
        }
      ).catch(() => []),
    ]);

    for (const b of activeBanners) {
      const text = b.translations?.es?.text ?? b.translations?.en?.text ?? b.id;
      liveNow.push({
        id: `banner-${b.id}`,
        kind: "banner",
        label: text,
        href: "/admin/banners",
      });
    }
    for (const p of activePopups) {
      const text = p.translations?.es?.text ?? p.translations?.en?.text ?? p.id;
      liveNow.push({
        id: `popup-${p.id}`,
        kind: "popup",
        label: text,
        href: "/admin/popups",
      });
    }
    for (const pr of activePromos) {
      liveNow.push({
        id: `promo-${pr.id}`,
        kind: "promotion",
        label: pr.title_es ?? pr.title_en ?? pr.id,
        href: "/admin/promotions",
      });
    }
  } catch {
    // Non-critical — leave liveNow empty
  }

  // ── Recent activity — pulled from admin_audit_log ──
  const activity: DashboardData["recentActivity"] = [];
  try {
    const logs = await selectRows<{
      id: string;
      user_id: string | null;
      action: string;
      resource_type: string | null;
      resource_id: string | null;
      created_at: string;
    }>("admin_audit_log", {
      role: "service_role",
      query: "select=id,user_id,action,resource_type,resource_id,created_at&order=created_at.desc&limit=8",
    });

    // Hydrate user names in one batch
    const userIds = [...new Set(logs.map((l) => l.user_id).filter((id): id is string => !!id))];
    let userMap = new Map<string, string>();
    if (userIds.length > 0) {
      const inList = userIds.map((id) => `"${id}"`).join(",");
      const users = await selectRows<{ id: string; full_name: string }>("admin_users", {
        role: "service_role",
        query: `select=id,full_name&id=in.(${inList})`,
      });
      userMap = new Map(users.map((u) => [u.id, u.full_name]));
    }

    for (const log of logs) {
      const date = new Date(log.created_at);
      const minutesAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      const timeStr =
        minutesAgo < 1 ? "Just now"
          : minutesAgo < 60 ? `${minutesAgo}m ago`
          : minutesAgo < 1440 ? `${Math.floor(minutesAgo / 60)}h ago`
          : date.toLocaleDateString();

      const target = log.resource_type
        ? `${log.resource_type}${log.resource_id ? ` · ${log.resource_id.slice(0, 24)}` : ""}`
        : "(unspecified)";

      activity.push({
        id: log.id,
        user: log.user_id ? userMap.get(log.user_id) ?? "Admin" : "System",
        action: log.action,
        target,
        timestamp: timeStr,
      });
    }
  } catch {
    // Audit log might be unavailable — fall back to empty list
  }

  return { stats, liveNow, recentActivity: activity };
}
