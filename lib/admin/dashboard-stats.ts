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
      recentActivity: [],
    };
  }

  // Fetch all counts in parallel
  const [
    journalCount,
    teamCount,
    bannerCount,
    popupCount,
    pageCount,
    liveOpeningsCount,
    applicationsCount,
  ] = await Promise.all([
    countRows("journal_posts"),
    countRows("admin_users"),
    countRows("banners", { filter: "enabled=eq.true" }),
    countRows("popups", { filter: "enabled=eq.true" }),
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

  // Build real activity from recent data changes
  const activity: DashboardData["recentActivity"] = [];

  // Recent banners
  if (bannerCount > 0) {
    activity.push({
      id: "banner-active",
      user: "System",
      action: "active",
      target: `${bannerCount} banner${bannerCount !== 1 ? "s" : ""} currently live on site`,
      timestamp: "Now",
    });
  }

  // Active popups
  if (popupCount > 0) {
    activity.push({
      id: "popup-active",
      user: "System",
      action: "active",
      target: `${popupCount} popup${popupCount !== 1 ? "s" : ""} currently enabled`,
      timestamp: "Now",
    });
  }

  // Page content entries
  if (pageCount > 0) {
    activity.push({
      id: "pages-managed",
      user: "Content",
      action: "managed",
      target: `${pageCount} page content sections managed via CMS`,
      timestamp: "Live",
    });
  }

  // Journal articles
  if (journalCount > 0) {
    try {
      const posts = await selectRows<{ title_es: string; updated_at: string }>("journal_posts", {
        role: "service_role",
        query: "select=title_es,updated_at&order=updated_at.desc&limit=3",
      });
      for (const post of posts) {
        const date = new Date(post.updated_at);
        const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
        const timeStr = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
        activity.push({
          id: `journal-${post.title_es}`,
          user: "Journal",
          action: "published",
          target: post.title_es,
          timestamp: timeStr,
        });
      }
    } catch {
      // Non-critical
    }
  }

  // Careers pipeline
  if (liveOpeningsCount > 0 || applicationsCount > 0) {
    activity.push({
      id: "careers-pipeline",
      user: "Careers",
      action: "managed",
      target: `${liveOpeningsCount} live opening${liveOpeningsCount !== 1 ? "s" : ""}, ${applicationsCount} application${applicationsCount !== 1 ? "s" : ""}`,
      timestamp: "Live",
    });
  }

  return { stats, recentActivity: activity };
}
