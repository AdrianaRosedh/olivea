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

// Confirmed with ownership (June 2026): main contact is the Casa line
// (global_settings.contact_info, with the email and address). Farm To Table's
// direct line is separate: the phone in the restaurant's Google listing
// (/admin → Olivea Farm to Table → Google listing). Each venue's phone and
// hours come from its listing and /admin/hours.
async function loadContactData() {
  const [content, global, farmtotable, cafe, casa] = await Promise.all([
    getContent("contact"),
    getContent("global").catch(() => null),
    getContent("farmtotable").catch(() => null),
    getContent("cafe").catch(() => null),
    getContent("casa").catch(() => null),
  ]);
  return {
    content,
    global,
    listings: { farmtotable: farmtotable?.listing, cafe: cafe?.listing, casa: casa?.listing },
  };
}
import ContactArticle from "./ContactArticle";

type PageProps = {
  params: Promise<{ lang: string }>;
};

async function pageMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = normalizeLang(raw);
  const dict = getDictionary(lang);
  const t = dict.contact;
  // Contact's SEO fields in /admin first; the static dictionary only covers a
  // missing row.
  const meta = (await getContent("contact").catch(() => null))?.meta;

  const withBrand = (s: string) => {
    const x = (s || "").trim();
    if (!x) return "OLIVEA";
    if (/\bolivea\b/i.test(x)) return x;
    return `${x} | OLIVEA`;
  };

  const pageTitle = withBrand(meta?.title?.[lang] || t.metaTitle);
  const description = meta?.description?.[lang] || t.metaDescription;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
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

  const { content, global, listings } = await loadContactData();
  const pick = (b?: { en?: string; es?: string }) => (b?.[lang] || b?.en || "").trim();
  const info = global?.contactInfo;
  const contactInfo = {
    email: info?.email?.trim() || "",
    phone: info?.phone?.trim() || "",
    restaurantPhone: listings.farmtotable?.telephone?.trim() || "",
    address: pick(info?.address),
    mapsUrl: info?.googleMapsUrl?.trim() || "",
  };

  // The FAQ wording is edited in /admin → Contact; its facts are filled from
  // /admin/hours, site settings and the restaurant's listing, so the answers
  // cannot drift from what a visitor sees.
  const hoursLine = [...(global?.hours ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((h) => h.venue === "farmtotable" || h.venue === "cafe" || h.venue === "casa")
    .map((h) => (pick(h.schedule) ? `${pick(h.label)}: ${pick(h.schedule)}.` : ""))
    .filter(Boolean)
    .join(" ");
  const faq = contactFaq(lang, content.faq, {
    hours: hoursLine,
    address: contactInfo.address,
    email: contactInfo.email,
    phone: contactInfo.phone,
    restaurantPhone: contactInfo.restaurantPhone,
  });
  const faqHeading = pick(content.labels?.faqHeading);

  return (
    <>
      {/* Server-rendered article: full semantic content for crawlers,
          AI assistants, screen readers, and no-JS clients.
          Hidden via CSS once JS hydrates (see .ssr-article in globals.css). */}
      <ContactArticle lang={lang} content={content} global={global} listings={listings} />
      <div className="ssr-article">
        <FaqProse
          items={faq}
          heading={faqHeading}
          label={faqHeading}
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
