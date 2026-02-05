// app/(linktree)/[lang]/team/[id]/page.tsx
import type { Metadata } from "next";
import LinktreeClient from "./LinktreeClient";
import { absoluteUrl } from "@/lib/site";

import {
  TEAM,
  type LeaderProfile,
} from "@/app/(main)/[lang]/team/teamData";

type Lang = "es" | "en";
const normalizeLang = (raw: string): Lang => (raw === "en" ? "en" : "es");
const safeStr = (x: unknown): string => (typeof x === "string" ? x : "");

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

function findMember(id: string): LeaderProfile | undefined {
  const t = TEAM as unknown;

  if (Array.isArray(t)) {
    const hit = t.find((m) => {
      const r = asRecord(m);
      return r && r.id === id;
    });
    return hit as LeaderProfile | undefined;
  }

  const r = asRecord(t);
  if (r) return r[id] as LeaderProfile | undefined;

  return undefined;
}

function pickStringProp(
  x: unknown,
  key: string
): string | undefined {
  if (!x || typeof x !== "object") return undefined;
  const v = (x as Record<string, unknown>)[key];
  return typeof v === "string" ? v : undefined;
}

function i18nPick(x: unknown, lang: Lang): string {
  const r = asRecord(x);
  return safeStr(r ? r[lang] : undefined);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang = normalizeLang(p.lang);
  const id = safeStr(p.id);

  const member = findMember(id);

  const name = safeStr(member?.name) || "Olivea";
  const role = i18nPick(member?.role, lang);
  const org = i18nPick(member?.org, lang);

  const title = `${name} | OLIVEA`;
  const description =
    (lang === "es"
      ? [role, org].filter(Boolean).join(" · ") || `Perfil de ${name} en Olivea.`
      : [role, org].filter(Boolean).join(" · ") ||
        `${name}'s profile at Olivea.`) || "";

  // ✅ match your app routing style: /es/... and /en/...
  const canonicalPath = `/${lang}/team/${id}`;
  const esPath = `/es/team/${id}`;
  const enPath = `/en/team/${id}`;

  const ogImage =
    pickStringProp(member, "ogImage") ||
    "/images/seo/seo-og.jpg";


  return {
    metadataBase: new URL(absoluteUrl("/")),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: { "es-MX": esPath, "en-US": enPath },
    },
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      url: absoluteUrl(canonicalPath),
      title,
      description,
      siteName: "Olivea",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${name} — Olivea` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const p = await params;
  const lang = normalizeLang(p.lang);
  const id = safeStr(p.id);

  const member = findMember(id);

  if (!member) {
    return (
      <main className="min-h-dvh grid place-items-center text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Not found</p>
          <p className="text-sm opacity-80">Member does not exist.</p>
        </div>
      </main>
    );
  }

  return <LinktreeClient lang={lang} member={member} />;
}
