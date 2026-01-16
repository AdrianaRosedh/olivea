// app/api/popup/route.ts
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

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

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}


function isStringOrUndefined(v: unknown): v is string | undefined {
  return v === undefined || typeof v === "string";
}

function parseTimeMs(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

// supports exact matches and "*" suffix wildcard ("/es/journal/*")
function matchPattern(pattern: string, currentPath: string): boolean {
  if (pattern === "/*") return true;
  if (pattern.endsWith("*")) return currentPath.startsWith(pattern.slice(0, -1));
  return currentPath === pattern;
}

function passesTimeRules(rules: ActivePopupFile["rules"], nowMs: number): boolean {
  const start = parseTimeMs(rules.startsAt);
  const end = parseTimeMs(rules.endsAt);
  if (start !== null && nowMs < start) return false;
  if (end !== null && nowMs > end) return false;
  return true;
}

function passesPathRules(rules: ActivePopupFile["rules"], currentPath: string): boolean {
  const include = rules.includePaths ?? ["/*"];
  const exclude = rules.excludePaths ?? [];

  const included = include.some((p) => matchPattern(p, currentPath));
  if (!included) return false;

  const excluded = exclude.some((p) => matchPattern(p, currentPath));
  if (excluded) return false;

  return true;
}

function isTranslationsBlock(v: unknown): v is ActivePopupFile["translations"] {
  if (!isObject(v)) return false;

  const es = v.es;
  const en = v.en;
  if (!isObject(es) || !isObject(en)) return false;

  for (const lang of ["es", "en"] as const) {
    const t = v[lang];
    if (!isObject(t)) return false;
    if (typeof t.title !== "string") return false;
    if (typeof t.excerpt !== "string") return false;
    if (!isStringOrUndefined(t.badge)) return false;
    if (!isStringOrUndefined(t.href)) return false;
  }
  return true;
}

function isRulesBlock(v: unknown): v is ActivePopupFile["rules"] {
  if (!isObject(v)) return false;

  if (!isStringOrUndefined(v.startsAt)) return false;
  if (!isStringOrUndefined(v.endsAt)) return false;

  const freq = v.frequency;
  if (freq !== "onceEver" && freq !== "oncePerPopupId" && freq !== "oncePerDays") return false;

  if (v.days !== undefined && typeof v.days !== "number") return false;

  if (v.includePaths !== undefined) {
    if (!Array.isArray(v.includePaths) || !v.includePaths.every((x) => typeof x === "string")) return false;
  }
  if (v.excludePaths !== undefined) {
    if (!Array.isArray(v.excludePaths) || !v.excludePaths.every((x) => typeof x === "string")) return false;
  }

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

  if (!isTranslationsBlock(v.translations)) return false;
  if (!isRulesBlock(v.rules)) return false;

  if (v.media !== undefined && !isMediaBlock(v.media)) return false;

  return true;
}

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang: Lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const currentPath = url.searchParams.get("path") ?? "/";

  const active = await loadActivePopup();
  if (!active || !active.enabled) {
    return NextResponse.json<{ popup: null }>({ popup: null }, { status: 200 });
  }

  const now = Date.now();
  if (!passesTimeRules(active.rules, now)) {
    return NextResponse.json<{ popup: null }>({ popup: null }, { status: 200 });
  }

  if (!passesPathRules(active.rules, currentPath)) {
    return NextResponse.json<{ popup: null }>({ popup: null }, { status: 200 });
  }

  const t = active.translations[lang];
  if (!t) return NextResponse.json<{ popup: null }>({ popup: null }, { status: 200 });

  if (active.kind === "journal") {
    if (!t.href) return NextResponse.json<{ popup: null }>({ popup: null }, { status: 200 });

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

    return NextResponse.json<{ popup: SitePopup | null }>({ popup }, { status: 200 });
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

  return NextResponse.json<{ popup: SitePopup | null }>({ popup }, { status: 200 });
}
