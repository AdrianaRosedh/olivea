// app/(main)/[lang]/contact/page.tsx
import type { Metadata } from "next";
import {
  getDictionary,
  normalizeLang,
  type Lang,
} from "@/app/[lang]/(main)/dictionaries";
import { applyCmsOverlay } from "@/app/[lang]/(main)/dictionaries/cms-overlay";
import { getContent } from "@/lib/content";
import { canonicalUrl, withShare } from "@/lib/site";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqProse from "@/components/seo/FaqProse";
import { contactFaq } from "./faq";
import ContactClient from "./ContactClient";

// Confirmed with ownership (June 2026): main contact is the Casa line.
// Farm To Table's direct line is separate: it is the phone in the restaurant's
// Google listing (/admin → Olivea Farm to Table → Google listing). The CMS
// (global_settings.contact_info) holds the main line.
const FALLBACK_CONTACT = {
  email: "hola@casaolivea.com",
  phone: "+52 646 388 2369",
  restaurantPhone: "+52 646 383 6402",
};

async function loadContactInfo() {
  const [g, ftt] = await Promise.all([
    getContent("global").catch(() => null),
    getContent("farmtotable").catch(() => null),
  ]);
  const email = g?.contactInfo?.email?.trim();
  const phone = g?.contactInfo?.phone?.trim();
  const restaurantPhone = ftt?.listing?.telephone?.trim() || FALLBACK_CONTACT.restaurantPhone;
  if (email && phone) return { email, phone, restaurantPhone };
  return FALLBACK_CONTACT;
}
import ArticleEn from "./ArticleEn";
import ArticleEs from "./ArticleEs";

type PageProps = {
  params: Promise<{ lang: string }>;
};

async function pageMetadata({ params }: PageProps): Promise<Metadata> {
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
  const contactInfo = await loadContactInfo();

  // Hours come from the same overlay the page renders, so the answers cannot
  // drift from what a visitor sees when someone edits /admin/hours.
  const faq = contactFaq(lang, {
    hours: t?.hours ?? {},
    email: contactInfo.email,
    phone: contactInfo.phone,
  });

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <Article />
      <div className="ssr-article">
        <FaqProse
          items={faq}
          heading={lang === "es" ? "Preguntas frecuentes" : "Common questions"}
          label={lang === "es" ? "Preguntas frecuentes" : "Common questions"}
        />
      </div>
      <ContactClient lang={lang} t={t} contactInfo={contactInfo} />
      <FaqJsonLd id={canonicalUrl(`/${lang}/contact#faq`)} items={faq} />
    </>
  );
}

export async function generateMetadata(
  props: Parameters<typeof pageMetadata>[0]
): Promise<Metadata> {
  const { lang } = await props.params;
  return withShare(await pageMetadata(props), { lang, path: "/contact" });
}
