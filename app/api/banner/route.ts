// app/api/banner/route.ts
//
// Edge runtime: this endpoint does no database I/O and no Node APIs.
// Content is bundled at build time via a static JSON import, so response
// time is bounded by handler execution + CDN latency.
//
// To update banner content: edit lib/content/data/banners.ts and redeploy.
export const runtime = "edge";

import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
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

// Try Supabase first (runtime), fall back to static import
async function loadActiveBanner(): Promise<ActiveBannerFile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const res = await fetch(
        `${url}/rest/v1/banners?enabled=eq.true&order=created_at.desc&limit=1`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          next: { revalidate: 60 },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows.length > 0) {
          const b = rows[0];
          const mapped = {
            enabled: b.enabled,
            id: b.id,
            type: b.type,
            translations: b.translations,
            startsAt: b.starts_at,
            endsAt: b.ends_at,
            dismissible: b.dismissible ?? true,
            includePaths: b.include_paths,
            excludePaths: b.exclude_paths,
          };
          if (isActiveBannerFile(mapped)) return mapped;
        }
      }
    } catch {
      // Supabase unavailable — fall through to static
    }
  }

  return STATIC_BANNER;
}

/* ── Handler ─────────────────────────────────────────────────────── */

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

const nullBanner = () =>
  NextResponse.json<{ banner: null }>({ banner: null }, { status: 200, headers: CACHE_HEADERS });

export async function GET(req: Request) {
  const ip = clientIp(req);
  const { ok, retryAfter } = rateLimit(`banner:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!ok) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const currentPath = url.searchParams.get("path") ?? "/";

  const active = await loadActiveBanner();
  if (!active || !active.enabled) return nullBanner();

  if (!passesTimeWindow(active.startsAt, active.endsAt)) return nullBanner();
  if (!passesPathRules(active.includePaths, active.excludePaths, currentPath)) return nullBanner();

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
