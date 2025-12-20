// app/(linktree)/[lang]/layout.tsx
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

type Lang = "es" | "en";
const normalizeLang = (raw: string): Lang => (raw === "en" ? "en" : "es");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const p = await params;
  const lang = normalizeLang(p.lang);

  const canonical = `/${lang}/team`;
  const title = lang === "es" ? "Equipo — Olivea" : "Team — Olivea";
  const description =
    lang === "es"
      ? "Perfiles del equipo de Olivea y enlaces principales."
      : "Olivea team profiles and key links.";

  const og = "/images/seo/team-og.jpg";

  return {
    metadataBase: new URL(absoluteUrl("/")),
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "es-MX": "/es/team",
        "en-US": "/en/team",
      },
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonical),
      title,
      description,
      siteName: "Olivea",
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

export default function LinktreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
