// app/(main)/[lang]/contact/page.tsx
import type { Metadata } from "next";
import {
  getDictionary,
  normalizeLang,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";
import ContactClient from "./ContactClient";

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

  const dict = getDictionary(lang);

  // ✅ Force to plain JSON so Next never crashes on RSC -> Client boundary
  const t = JSON.parse(JSON.stringify(dict.contact));

  return <ContactClient lang={lang} t={t} />;
}