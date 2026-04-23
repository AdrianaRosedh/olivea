// app/api/popup/route.ts
//
// Edge runtime: content is bundled statically (no runtime file I/O), and the
// rate limit is a per-isolate best-effort guard. On edge, state is fragmented
// across more isolates than on Node lambdas, but the endpoint is CDN-cached
// with s-maxage=60, so most traffic never reaches a handler — this limit only
// catches obviously-scripted abuse behind the cache.
//
// To update popup content: edit content/popups/active.json and redeploy.
export const runtime = "edge";

import { NextResponse } from "next/server";
import { type Lang } from "@/lib/i18n";
import {
  isObject,
  isStringOrUndefined,
  passesTimeWindow,
  passesPathRules,
  validateBilingualBlock,
  validateOptionalPathList,
} from "@/lib/contentRules";
import { rateLimit, clientIp } from "@/lib/rate-limit";
// Content layer — single source of truth (was: @/content/popups/active.json)
import popupItems from "@/lib/content/data/popups";

// Pick the highest-priority enabled popup from the content layer
const activePopupData = (() => {
  const enabled = popupItems
    .filter((p) => p.enabled)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  if (!enabled.length) return null;
  const p = enabled[0];
  return {
    enabled: p.enabled,
    id: p.id,
    kind: p.kind,
    priority: p.priority,
    translations: p.translations,
    media: p.media
      ? { coverSrc: p.media.coverSrc, coverAlt: { es: p.media.coverAlt.es, en: p.media.coverAlt.en } }
      : undefined,
    rules: p.rules,
  };
})();

type ActivePopupFile = {
  enabled: boolean;
  id: string;
  kind: "journal" | "announcement";
  priority?: number;
  translations: Record<
    Lang,
    {
      badge?: string;
      title: string;
      excerpt: string;
      href?: string;
    }
  >;
  media?: {
    coverSrc?: string;
    coverAlt?: Record<Lang, string>;
  };
  rules: {
    startsAt?: string;
    endsAt?: string;
    includePaths?: string[];
    excludePaths?: string[];
    frequency: "onceEver" | "oncePerPopupId" | "oncePerDays";
    days?: number;
  };
};

type SitePopup =
  | {
      id: string;
      kind: "journal";
      lang: Lang;
      title: string;
      excerpt: string;
      href: string;
      coverSrc?: string;
      coverAlt?: string;
      badge?: string;
    }
  | {
      id: string;
      kind: "announcement";
      lang: Lang;
      title: string;
      excerpt: string;
      href?: string;
      badge?: string;
    };

/* ── Popup-specific validators ───────────────────────────────────── */

function isRulesBlock(v: unknown): v is ActivePopupFile["rules"] {
  if (!isObject(v)) return false;
  if (!isStringOrUndefined(v.startsAt)) return false;
  if (!isStringOrUndefined(v.endsAt)) return false;

  const freq = v.frequency;
  if (freq !== "onceEver" && freq !== "oncePerPopupId" && freq !== "oncePerDays") return false;
  if (v.days !== undefined && typeof v.days !== "number") return false;

  if (!validateOptionalPathList(v.includePaths)) return false;
  if (!validateOptionalPathList(v.excludePaths)) return false;

  return true;
}

function isMediaBlock(v: unknown): v is NonNullable<ActivePopupFile["media"]> {
  if (!isObject(v)) return false;
  if (!isStringOrUndefined(v.coverSrc)) return false;

  if (v.coverAlt !== undefined) {
    if (!isObject(v.coverAlt)) return false;
    if (v.coverAlt.es !== undefined && typeof v.coverAlt.es !== "string") return false;
    if (v.coverAlt.en !== undefined && typeof v.coverAlt.en !== "string") return false;
  }
  return true;
}

function isActivePopupFile(v: unknown): v is ActivePopupFile {
  if (!isObject(v)) return false;
  if (typeof v.enabled !== "boolean") return false;
  if (typeof v.id !== "string") return false;
  if (v.kind !== "journal" && v.kind !== "announcement") return false;
  if (v.priority !== undefined && typeof v.priority !== "number") return false;
  if (!validateBilingualBlock(v.translations, ["title", "excerpt"], ["badge", "href"])) return false;
  if (!isRulesBlock(v.rules)) return false;
  if (v.media !== undefined && !isMediaBlock(v.media)) return false;
  return true;
}

/* ── Loader ──────────────────────────────────────────────────────── */

// Static fallback — bundled at build time
const STATIC_POPUP: ActivePopupFile | null = isActivePopupFile(activePopupData)
  ? activePopupData
  : null;

// Try Supabase first (runtime), fall back to static import
async function loadActivePopup(): Promise<ActivePopupFile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const res = await fetch(
        `${url}/rest/v1/popups?enabled=eq.true&order=priority.desc&limit=1`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          next: { revalidate: 60 },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows.length > 0) {
          const p = rows[0];
          const mapped = {
            enabled: p.enabled,
            id: p.id,
            kind: p.kind,
            priority: p.priority,
            translations: p.translations,
            media: p.media,
            rules: p.rules,
          };
          if (isActivePopupFile(mapped)) return mapped;
        }
      }
    } catch {
      // Supabase unavailable — fall through to static
    }
  }

  return STATIC_POPUP;
}

/* ── Handler ─────────────────────────────────────────────────────── */

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

// Best-effort per-IP throttle. The response is CDN-cached (s-maxage=60),
// so most traffic never reaches this handler. Limit applies to cache-miss
// requests (worst case: one instance × 120/min).
const RATE_LIMIT = { limit: 120, windowMs: 60_000 };

const nullPopup = () =>
  NextResponse.json<{ popup: null }>({ popup: null }, { status: 200, headers: CACHE_HEADERS });

export async function GET(req: Request) {
  // Rate limit first — cheapest path out.
  const { ok, retryAfter } = rateLimit(clientIp(req), RATE_LIMIT);
  if (!ok) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(RATE_LIMIT.limit),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const currentPath = url.searchParams.get("path") ?? "/";

  const active = await loadActivePopup();
  if (!active || !active.enabled) return nullPopup();

  if (!passesTimeWindow(active.rules.startsAt, active.rules.endsAt)) return nullPopup();
  if (!passesPathRules(active.rules.includePaths, active.rules.excludePaths, currentPath)) return nullPopup();

  const t = active.translations[lang];
  if (!t) return nullPopup();

  if (active.kind === "journal") {
    if (!t.href) return nullPopup();

    const popup: SitePopup = {
      id: active.id,
      kind: "journal",
      lang,
      title: t.title,
      excerpt: t.excerpt,
      href: t.href,
      ...(t.badge ? { badge: t.badge } : {}),
      ...(active.media?.coverSrc ? { coverSrc: active.media.coverSrc } : {}),
      ...(active.media?.coverAlt?.[lang] ? { coverAlt: active.media.coverAlt[lang] } : {}),
    };

    return NextResponse.json<{ popup: SitePopup | null }>({ popup }, { status: 200, headers: CACHE_HEADERS });
  }

  const popup: SitePopup = {
    id: active.id,
    kind: "announcement",
    lang,
    title: t.title,
    excerpt: t.excerpt,
    ...(t.badge ? { badge: t.badge } : {}),
    ...(t.href ? { href: t.href } : {}),
  };

  return NextResponse.json<{ popup: SitePopup | null }>({ popup }, { status: 200, headers: CACHE_HEADERS });
}
