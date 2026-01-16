import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

type Lang = "es" | "en";
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

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isBannerType(v: unknown): v is BannerType {
  return v === "notice" || v === "promo" || v === "warning";
}

function isStringOrUndef(v: unknown): v is string | undefined {
  return v === undefined || typeof v === "string";
}

function parseTimeMs(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

function matchPattern(pattern: string, currentPath: string): boolean {
  if (pattern === "/*") return true;
  if (pattern.endsWith("*")) return currentPath.startsWith(pattern.slice(0, -1));
  return currentPath === pattern;
}

function passesPathRules(include: string[] | undefined, exclude: string[] | undefined, currentPath: string) {
  const inc = include ?? ["/*"];
  const exc = exclude ?? [];
  const included = inc.some((p) => matchPattern(p, currentPath));
  if (!included) return false;
  const excluded = exc.some((p) => matchPattern(p, currentPath));
  return !excluded;
}

function isActiveBannerFile(v: unknown): v is ActiveBannerFile {
  if (!isObject(v)) return false;

  if (typeof v.enabled !== "boolean") return false;
  if (typeof v.id !== "string") return false;
  if (!isBannerType(v.type)) return false;

  if (!isObject(v.translations)) return false;
  const tr = v.translations;

  for (const k of ["es", "en"] as const) {
    if (!isObject(tr[k])) return false;
    if (typeof tr[k].text !== "string") return false;
    if (!isStringOrUndef(tr[k].ctaLabel)) return false;
    if (!isStringOrUndef(tr[k].ctaHref)) return false;
  }

  if (v.startsAt !== undefined && typeof v.startsAt !== "string") return false;
  if (v.endsAt !== undefined && typeof v.endsAt !== "string") return false;

  if (v.dismissible !== undefined && typeof v.dismissible !== "boolean") return false;

  if (v.includePaths !== undefined) {
    if (!Array.isArray(v.includePaths) || !v.includePaths.every((x) => typeof x === "string")) return false;
  }

  if (v.excludePaths !== undefined) {
    if (!Array.isArray(v.excludePaths) || !v.excludePaths.every((x) => typeof x === "string")) return false;
  }

  return true;
}

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const currentPath = url.searchParams.get("path") ?? "/";

  const active = await loadActiveBanner();
  if (!active || !active.enabled) {
    return NextResponse.json<{ banner: null }>({ banner: null }, { status: 200 });
  }

  const now = Date.now();
  const start = parseTimeMs(active.startsAt);
  const end = parseTimeMs(active.endsAt);

  if (start !== null && now < start) {
    return NextResponse.json<{ banner: null }>({ banner: null }, { status: 200 });
  }
  if (end !== null && now > end) {
    return NextResponse.json<{ banner: null }>({ banner: null }, { status: 200 });
  }

  if (!passesPathRules(active.includePaths, active.excludePaths, currentPath)) {
    return NextResponse.json<{ banner: null }>({ banner: null }, { status: 200 });
  }

  const t = active.translations[lang];
  const banner: BannerPayload = {
    id: active.id,
    type: active.type,
    lang,
    text: t.text,
    ...(t.ctaLabel ? { ctaLabel: t.ctaLabel } : {}),
    ...(t.ctaHref ? { ctaHref: t.ctaHref } : {}),
    dismissible: active.dismissible ?? true
  };

  return NextResponse.json<{ banner: BannerPayload | null }>({ banner }, { status: 200 });
}
