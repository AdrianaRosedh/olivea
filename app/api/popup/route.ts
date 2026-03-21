// app/api/popup/route.ts
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  isObject,
  isStringOrUndefined,
  passesTimeWindow,
  passesPathRules,
  validateBilingualBlock,
  validateOptionalPathList,
} from "@/lib/contentRules";

type Lang = "es" | "en";

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

async function loadActivePopup(): Promise<ActivePopupFile | null> {
  try {
    const filePath = path.join(process.cwd(), "content", "popups", "active.json");
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return isActivePopupFile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/* ── Handler ─────────────────────────────────────────────────────── */

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

const nullPopup = () =>
  NextResponse.json<{ popup: null }>({ popup: null }, { status: 200, headers: CACHE_HEADERS });

export async function GET(req: Request) {
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
