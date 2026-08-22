// app/api/popup/route.ts
//
// Popups are managed at /admin/popups (Supabase `popups` table) — the loader
// below reads Supabase first (60s revalidate) and only falls back to the
// static seed in lib/content/data/popups.ts when Supabase is unavailable/
// unconfigured. No deploy needed for popup changes.
//
// Edge runtime: the rate limit is a per-isolate best-effort guard. On edge,
// state is fragmented across more isolates than on Node lambdas, but the
// endpoint is CDN-cached with s-maxage=60, so most traffic never reaches a
// handler — this limit only catches obviously-scripted abuse behind the cache.
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
      ? {
          coverSrc: p.media.coverSrc,
          coverAlt: { es: p.media.coverAlt.es, en: p.media.coverAlt.en },
          ...(p.media.videoSrc ? { videoSrc: p.media.videoSrc } : {}),
        }
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
    videoSrc?: string;
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
      videoSrc?: string;
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
  if (!isStringOrUndefined(v.videoSrc)) return false;

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

// Try Supabase first (runtime), fall back to static import.
// Returns ALL enabled candidates (highest priority first) — the handler
// picks the first one whose time window + path rules pass for the current
// request. (Previously limit=1: an expired-but-still-enabled popup
// shadowed any valid popup behind it, and nothing showed.)
async function loadActivePopups(): Promise<ActivePopupFile[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      // Deliberately uncached at this layer. With `next: { revalidate: 60 }`
      // this fetch served a stale row for well over ten minutes in
      // production — an edit in the admin reached the database immediately and
      // then simply did not appear, with no way for an editor to tell whether
      // the save had worked. The same code returned fresh data instantly when
      // run locally, which is what isolated the cache as the cause.
      //
      // Freshness is not free, but it is cheap here: the response carries
      // s-maxage=60, so the CDN still absorbs the traffic and this only runs
      // on a cache miss — roughly once a minute per region, not once a
      // visitor.
      const res = await fetch(
        `${url}/rest/v1/popups?enabled=eq.true&order=priority.desc&limit=10`,
        {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
          cache: "no-store",
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows
            .map((p) => ({
              enabled: p.enabled,
              id: p.id,
              kind: p.kind,
              priority: p.priority,
              translations: p.translations,
              media: p.media,
              rules: p.rules,
            }))
            .filter(isActivePopupFile);
          if (mapped.length > 0) return mapped;
        }
      }
    } catch {
      // Supabase unavailable — fall through to static
    }
  }

  return STATIC_POPUP ? [STATIC_POPUP] : [];
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

  // First enabled popup (highest priority first) whose schedule + path rules pass.
  const candidates = await loadActivePopups();
  const active = candidates.find(
    (p) =>
      p.enabled &&
      passesTimeWindow(p.rules.startsAt, p.rules.endsAt) &&
      passesPathRules(p.rules.includePaths, p.rules.excludePaths, currentPath)
  );
  if (!active) return nullPopup();

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
      ...(active.media?.videoSrc ? { videoSrc: active.media.videoSrc } : {}),
    };

    return NextResponse.json<{ popup: SitePopup | null }>({ popup }, { status: 200, headers: CACHE_HEADERS });
  }

  // Announcements previously shipped no media, so anything uploaded for one
  // was stored and never rendered. They now carry the same fields a journal
  // popup does.
  const popup: SitePopup = {
    id: active.id,
    kind: "announcement",
    lang,
    title: t.title,
    excerpt: t.excerpt,
    ...(t.badge ? { badge: t.badge } : {}),
    ...(t.href ? { href: t.href } : {}),
    ...(active.media?.coverSrc ? { coverSrc: active.media.coverSrc } : {}),
    ...(active.media?.coverAlt?.[lang] ? { coverAlt: active.media.coverAlt[lang] } : {}),
    ...(active.media?.videoSrc ? { videoSrc: active.media.videoSrc } : {}),
  };

  return NextResponse.json<{ popup: SitePopup | null }>({ popup }, { status: 200, headers: CACHE_HEADERS });
}
