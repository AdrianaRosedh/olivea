// app/api/banner/route.ts
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { type Lang } from "@/lib/i18n";
import {
  isObject,
  isStringOrUndefined,
  passesTimeWindow,
  passesPathRules,
  validateBilingualBlock,
  validateOptionalPathList,
} from "@/lib/contentRules";
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

async function loadActiveBanner(): Promise<ActiveBannerFile | null> {
  try {
    const filePath = path.join(process.cwd(), "content", "banners", "active.json");
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return isActiveBannerFile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/* ── Handler ─────────────────────────────────────────────────────── */

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

const nullBanner = () =>
  NextResponse.json<{ banner: null }>({ banner: null }, { status: 200, headers: CACHE_HEADERS });

export async function GET(req: Request) {
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
