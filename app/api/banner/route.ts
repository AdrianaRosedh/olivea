// app/api/banner/route.ts
//
// Banners are managed at /admin/banners (Supabase `banners` table) — the
// loader below reads Supabase first (60s revalidate) and only falls back
// to the static seed in lib/content/data/banners.ts when Supabase is
// unavailable/unconfigured. No deploy needed for banner changes.
export const runtime = "edge";

import { NextResponse } from "next/server";
import { rateLimitDistributed, clientIp } from "@/lib/rate-limit";
import { type Lang } from "@/lib/i18n";
import {
  isObject,
  isStringOrUndefined,
  passesTimeWindow,
  passesPathRules,
  validateBilingualBlock,
  validateOptionalPathList,
} from "@/lib/contentRules";
// Content layer — single source of truth (was: @/content/banners/active.json)
import bannerItems from "@/lib/content/data/banners";
type BannerType = "notice" | "promo" | "warning";

type ActiveBannerFile = {
  enabled: boolean;
  id: string;
  type: BannerType;
  translations: Record<
    Lang,
    {
      text: string;
      ctaLabel?: string;
      ctaHref?: string;
    }
  >;
  startsAt?: string;
  endsAt?: string;
  dismissible?: boolean;
  includePaths?: string[];
  excludePaths?: string[];
};

type BannerPayload = {
  id: string;
  type: BannerType;
  lang: Lang;
  text: string;
  ctaLabel?: string;
  ctaHref?: string;
  dismissible: boolean;
};

/* ── Banner-specific validator ───────────────────────────────────── */

function isBannerType(v: unknown): v is BannerType {
  return v === "notice" || v === "promo" || v === "warning";
}

function isActiveBannerFile(v: unknown): v is ActiveBannerFile {
  if (!isObject(v)) return false;
  if (typeof v.enabled !== "boolean") return false;
  if (typeof v.id !== "string") return false;
  if (!isBannerType(v.type)) return false;
  if (!validateBilingualBlock(v.translations, ["text"], ["ctaLabel", "ctaHref"])) return false;
  if (!isStringOrUndefined(v.startsAt)) return false;
  if (!isStringOrUndefined(v.endsAt)) return false;
  if (v.dismissible !== undefined && typeof v.dismissible !== "boolean") return false;
  if (!validateOptionalPathList(v.includePaths)) return false;
  if (!validateOptionalPathList(v.excludePaths)) return false;
  return true;
}

/* ── Loader ──────────────────────────────────────────────────────── */

// Static fallback — bundled at build time
const staticBannerData = (() => {
  const enabled = bannerItems.filter((b) => b.enabled);
  if (!enabled.length) return null;
  const b = enabled[0];
  return {
    enabled: b.enabled,
    id: b.id,
    type: b.type,
    translations: b.translations,
    startsAt: b.startsAt,
    endsAt: b.endsAt,
    dismissible: b.dismissible,
    includePaths: b.includePaths,
    excludePaths: b.excludePaths,
  };
})();

const STATIC_BANNER: ActiveBannerFile | null = isActiveBannerFile(staticBannerData)
  ? staticBannerData
  : null;

// Try Supabase first (runtime), fall back to static import.
// Returns ALL enabled candidates (newest first) — the handler picks the
// first one whose time window + path rules pass for the current request.
// (Previously limit=1: an expired-but-still-enabled banner shadowed any
// valid banner behind it, and nothing showed.)
async function loadActiveBanners(): Promise<ActiveBannerFile[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      // Same reasoning as the popup route: this fetch was cached at the data
      // layer and served edits back stale for far longer than its stated TTL,
      // so a banner published in the admin appeared not to publish. The
      // response still carries s-maxage=60, so the CDN absorbs the traffic
      // and this runs on a cache miss rather than per visitor.
      const res = await fetch(
        `${url}/rest/v1/banners?enabled=eq.true&order=created_at.desc&limit=10`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows
            .map((b) => ({
              enabled: b.enabled,
              id: b.id,
              type: b.type,
              translations: b.translations,
              // DB NULL (= "always on" / "everywhere") must become undefined,
              // or isActiveBannerFile rejects the row and the banner vanishes.
              startsAt: b.starts_at ?? undefined,
              endsAt: b.ends_at ?? undefined,
              dismissible: b.dismissible ?? true,
              includePaths: b.include_paths ?? undefined,
              excludePaths: b.exclude_paths ?? undefined,
            }))
            .filter(isActiveBannerFile);
          if (mapped.length > 0) return mapped;
        }
      }
    } catch {
      // Supabase unavailable — fall through to static
    }
  }

  return STATIC_BANNER ? [STATIC_BANNER] : [];
}

/* ── Handler ─────────────────────────────────────────────────────── */

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

const nullBanner = () =>
  NextResponse.json<{ banner: null }>({ banner: null }, { status: 200, headers: CACHE_HEADERS });

export async function GET(req: Request) {
  const ip = clientIp(req);
  const { ok, retryAfter } = await rateLimitDistributed(`banner:${ip}`, {
    limit: 120,
    windowMs: 60_000,
  });
  if (!ok) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const currentPath = url.searchParams.get("path") ?? "/";

  // First enabled banner (newest first) whose schedule + path rules pass.
  const candidates = await loadActiveBanners();
  const active = candidates.find(
    (b) =>
      b.enabled &&
      passesTimeWindow(b.startsAt, b.endsAt) &&
      passesPathRules(b.includePaths, b.excludePaths, currentPath)
  );
  if (!active) return nullBanner();

  const t = active.translations[lang];
  const banner: BannerPayload = {
    id: active.id,
    type: active.type,
    lang,
    text: t.text,
    ...(t.ctaLabel ? { ctaLabel: t.ctaLabel } : {}),
    ...(t.ctaHref ? { ctaHref: t.ctaHref } : {}),
    dismissible: active.dismissible ?? true,
  };

  return NextResponse.json<{ banner: BannerPayload | null }>({ banner }, { status: 200, headers: CACHE_HEADERS });
}
