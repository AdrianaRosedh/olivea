// app/(main)/[lang]/contact/page.tsx
import type { Metadata } from "next";
import {
  getDictionary,
  normalizeLang,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";
import { applyCmsOverlay } from "@/app/(main)/[lang]/dictionaries/cms-overlay";
import { getContent } from "@/lib/content";
import ContactClient from "./ContactClient";

// Confirmed with ownership (June 2026): main contact is the Casa line.
// Farm To Table's direct line (646 383 6402) is separate and stays in the
// component. The CMS (global_settings.contact_info) can override these.
const FALLBACK_CONTACT = {
  email: "hola@casaolivea.com",
  phone: "+52 646 388 2369",
};

async function loadContactInfo() {
  try {
    const g = await getContent("global");
    const email = g?.contactInfo?.email?.trim();
    const phone = g?.contactInfo?.phone?.trim();
    if (email && phone) return { email, phone };
  } catch {
    // fall through to static values
  }
  return FALLBACK_CONTACT;
}
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = normalizeLang(raw);
  const dict = getDictionary(lang);
  const t = dict.contact;

  const withBrand = (s: string) => {
    const x = (s || "").trim();
    if (!x) return "OLIVEA";
    if (/\bolivea\b/i.test(x)) return x;
    return `${x} | OLIVEA`;
  };

  const pageTitle = withBrand(t.metaTitle);

  return {
    title: pageTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: {
        "es-MX": "/es/contact",
        en: "/en/contact",
      },
    },
    openGraph: {
      title: pageTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Lang = normalizeLang(raw);

  // Static dictionary + admin-edited CMS overlay (labels, hours, footer note).
  // Metadata above intentionally stays on the static dictionary.
  const dict = await applyCmsOverlay(lang, getDictionary(lang));

  // ✅ Force to plain JSON so Next never crashes on RSC -> Client boundary
  const t = JSON.parse(JSON.stringify(dict.contact));

  const Article = lang === "en" ? ArticleEn : ArticleEs;

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />
      <ContactClient lang={lang} t={t} contactInfo={await loadContactInfo()} />
    </>
  );
}