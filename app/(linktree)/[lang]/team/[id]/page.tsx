// app/(linktree)/[lang]/team/[id]/page.tsx
import type { Metadata } from "next";
import LinktreeClient from "./LinktreeClient";
import { absoluteUrl } from "@/lib/site";
import { type Lang } from "@/lib/i18n";

import {
  loadLeader,
  type LeaderProfile,
} from "@/app/(main)/[lang]/team/teamData";
const normalizeLang = (raw: string): Lang => (raw === "en" ? "en" : "es");
const safeStr = (x: unknown): string => (typeof x === "string" ? x : "");

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

async function findMember(id: string): Promise<LeaderProfile | undefined> {
  return loadLeader(id);
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

  const member = await findMember(id);

  const name = safeStr(member?.name) || "Olivea";
  const role = i18nPick(member?.role, lang);
  const org = i18nPick(member?.org, lang);

  const title = `${name} | OLIVEA`;
  const description =
    (lang === "es"
      ? [role, org].filter(Boolean).join(" · ") || `Perfil de ${name} en Olivea.`
      : [role, org].filter(Boolean).join(" · ") ||
        `${name}'s profile at Olivea.`) || "";

  // ✅ Canonical URL always uses the member's real id, not the alias the user typed.
  // This way `/team/adriana`, `/team/Adriana`, and `/team/adrianarose` all canonicalize
  // to the same URL — Google won't see them as duplicates.
  const canonicalId = safeStr(member?.id) || id;
  const canonicalPath = `/${lang}/team/${canonicalId}`;
  const esPath = `/es/team/${canonicalId}`;
  const enPath = `/en/team/${canonicalId}`;

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

  const member = await findMember(id);

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
