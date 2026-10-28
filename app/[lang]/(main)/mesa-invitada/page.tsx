// app/[lang]/(main)/mesa-invitada/page.tsx
//
// Mesa Invitada — the guest-chef dinner series. This is the link that gets
// shared (Instagram bio, WhatsApp, the site popup), so it has to say what the
// evening is, what it costs and how to book it, in one screen on a phone.
//
// Everything about each volume — text in both languages, date, prices, poster,
// OpenTable link — lives in public.events, edited in /admin → Events. The page
// shows the next upcoming Mesa Invitada; once its date has passed (Baja
// California time) and no newer one is published, it shows that dinner as past:
// no prices, no booking, and no Event markup telling Google it is scheduled.
// The dinner books through its OpenTable experience; the stay package goes to
// Casa Olivea's reception over WhatsApp, on Casa's phone from its Google listing.
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { loadLocale, type Lang } from "@/lib/i18n";
import Reveal from "@/components/scroll/Reveal";
import { canonicalUrl, localeAlternates, withShare } from "@/lib/site";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import ShareButton from "./ShareButton";
import { currentEvent, type OliveaEvent } from "@/lib/events";
import { getContent } from "@/lib/content";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ lang: string }> };

const SERIES = "mesa-invitada";

/** One line of the event's copy in the reader's language. */
const line = (e: OliveaEvent, key: string, lang: Lang) => (e.copy[key]?.[lang] || e.copy[key]?.es || "").trim();

const mxn = (n: number) => `$${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await loadLocale({ lang: (await params).lang });
  const L: Lang = lang === "en" ? "en" : "es";
  const current = await currentEvent(SERIES);
  if (!current) return {};
  const { event, past } = current;
  return withShare(
    {
      title: line(event, "metaTitle", L),
      // A past dinner's description says it happened, not what it costs.
      description: past ? line(event, "pastNote", L) || line(event, "metaDescription", L) : line(event, "metaDescription", L),
      alternates: localeAlternates(lang, "/mesa-invitada"),
    },
    { lang, path: "/mesa-invitada", image: event.shareImage, alt: line(event, "posterAlt", L) }
  );
}

export default async function MesaInvitadaPage({ params }: Params) {
  const { lang } = await loadLocale({ lang: (await params).lang });
  const L: Lang = lang === "en" ? "en" : "es";
  const current = await currentEvent(SERIES);
  if (!current) notFound();
  const { event, past } = current;
  // Every line of the page in the reader's language, from the event's copy.
  const c: Record<string, string> = Object.fromEntries(Object.keys(event.copy).map((k) => [k, line(event, k, L)]));
  const pageUrl = canonicalUrl(`/${L}/mesa-invitada`);
  // Casa Olivea's reception, from its Google listing.
  const casaPhone = (await getContent("casa").catch(() => null))?.listing?.telephone?.replace(/\D/g, "");
  const whatsappHref = casaPhone ? `https://wa.me/${casaPhone}?text=${encodeURIComponent(c.stayMessage)}` : "";

  // Event markup lets Google show the date, place and price as a rich result.
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "FoodEvent",
    name: `${c.eventName || c.kicker} — ${c.chef}`,
    description: c.metaDescription,
    startDate: event.eventDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [event.poster, event.shareImage].filter((x): x is string => !!x).map((x) => canonicalUrl(x)),
    url: pageUrl,
    location: {
      "@type": "Restaurant",
      name: "Olivea Farm To Table",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Carretera Ensenada-Tecate Km 92.5",
        addressLocality: "Villa de Juárez",
        addressRegion: "Baja California",
        postalCode: "22766",
        addressCountry: "MX",
      },
    },
    performer: { "@type": "Person", name: c.chef },
    organizer: { "@type": "Organization", name: "Olivea", url: canonicalUrl("/") },
    offers: [
      {
        "@type": "Offer",
        name: c.dinnerKicker,
        price: event.dinnerPrice,
        priceCurrency: "MXN",
        availability: "https://schema.org/LimitedAvailability",
        url: event.bookingUrl,
      },
      {
        "@type": "Offer",
        name: c.stayTitle,
        price: event.stayPrice,
        priceCurrency: "MXN",
        availability: "https://schema.org/LimitedAvailability",
        url: pageUrl,
      },
    ],
  };

  const label = "text-[11.5px] uppercase tracking-[0.3em] font-semibold";
  const primary =
    "inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-3.5 text-[11.5px] sm:text-[12px] uppercase tracking-[0.12em] sm:tracking-[0.2em] font-semibold bg-(--olivea-olive) text-white hover:bg-(--olivea-forest) transition-colors shadow-[0_14px_34px_-20px_rgba(0,0,0,0.45)]";
  const card =
    "rounded-[26px] bg-white/45 ring-1 ring-(--olivea-olive)/14 p-6 md:p-7 shadow-[0_26px_70px_-50px_rgba(0,0,0,0.45)]";

  return (
    <main className="w-full">
      {/* Only while the dinner is ahead: after the date Google must not be
          told it is still scheduled, with prices. */}
      {!past && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(eventLd) }}
        />
      )}

      <section className="mx-auto w-full max-w-300 px-6 sm:px-8 lg:px-10 pt-8 md:pt-14 pb-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Poster */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[22px] ring-1 ring-black/10 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.55)] bg-(--olivea-forest)">
              {event.poster && <Image
                src={event.poster}
                alt={c.posterAlt}
                width={1620}
                height={2025}
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="h-auto w-full"
              />}
            </div>
          </div>

          {/* Details + booking */}
          <div className="lg:col-span-7">
            <Reveal preset="fade">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className={`${label} text-(--olivea-olive)`}>{c.kicker}</span>
                <span className={`${label} text-(--olivea-honey-text)`}>{c.occasion}</span>
              </div>
            </Reveal>

            <Reveal preset="up" delay={0.05}>
              <h1 className="mt-4 font-serif italic text-[44px] leading-[1.02] md:text-[62px] text-(--olivea-forest)">
                {c.title}
              </h1>
            </Reveal>

            <Reveal preset="fade" delay={0.1}>
              <div className="mt-7 flex flex-col gap-1">
                <span className={`${label} text-(--olivea-honey-text)`}>{c.chefLabel}</span>
                <span className="font-serif text-[30px] md:text-[34px] leading-tight text-(--olivea-forest)">
                  {c.chef}
                </span>
                <span className="text-[13px] uppercase tracking-[0.22em] text-(--olivea-olive)">
                  {c.chefOf}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-1 border-t border-(--olivea-olive)/15 pt-5 text-(--olivea-olive)">
                <span className="text-[17px] font-semibold">{c.when}</span>
                <span className="text-[14.5px] opacity-85">{c.where}</span>
              </div>

              <div className="mt-6 max-w-[60ch] text-[16px] md:text-[17px] leading-[1.8] text-(--olivea-ink)/90">
                {c.intro}
              </div>
            </Reveal>

            {past ? (
              <div className="mt-9 sm:max-w-xl rounded-[26px] bg-white/45 ring-1 ring-(--olivea-olive)/14 p-6 md:p-7 text-[15.5px] leading-[1.75] text-(--olivea-ink)/90">
                {c.pastNote}
              </div>
            ) : (
              <div className="mt-9 grid gap-5 sm:max-w-xl">
                {/* Dinner */}
                <Reveal preset="up" delay={0.12}>
                  <div className={card + " h-full flex flex-col"}>
                    <span className={`${label} text-(--olivea-honey-text)`}>{c.dinnerKicker}</span>
                    <span className="mt-3 font-serif text-[28px] leading-tight text-(--olivea-forest)">
                      {c.dinnerTitle}
                    </span>
                    <div className="mt-2 text-[14.5px] leading-[1.7] text-(--olivea-ink)/85">
                      {c.dinnerBody}
                    </div>
                    <div className="mt-5 flex items-baseline gap-2 text-(--olivea-forest)">
                      <span className="font-serif text-[38px] leading-none tabular-nums lining-nums">
                        {event.dinnerPrice != null && mxn(event.dinnerPrice)}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em]">{c.perPerson}</span>
                    </div>
                    <div className="mt-auto pt-6">
                      <a href={event.bookingUrl} target="_blank" rel="noopener" className={primary}>
                        {c.dinnerCta}
                        <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
                      </a>
                      <span className="mt-2.5 block text-[11px] uppercase tracking-[0.2em] text-(--olivea-olive)">{c.dinnerVia}</span>
                    </div>
                  </div>
                </Reveal>

                {/* Stay — only when there is a phone to book it on */}
                {whatsappHref && <Reveal preset="up" delay={0.18}>
                  <div className={card + " h-full flex flex-col"}>
                    <span className={`${label} text-(--olivea-honey-text)`}>{c.stayKicker}</span>
                    <span className="mt-3 font-serif text-[28px] leading-tight text-(--olivea-forest)">
                      {c.stayTitle}
                    </span>
                    <div className="mt-2 text-[14.5px] leading-[1.7] text-(--olivea-ink)/85">
                      {c.stayBody}
                    </div>
                    <div className="mt-5 flex flex-wrap items-baseline gap-x-2 text-(--olivea-forest)">
                      <span className="font-serif text-[38px] leading-none tabular-nums lining-nums">
                        {event.stayPrice != null && mxn(event.stayPrice)}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em]">{c.plusTax}</span>
                    </div>
                    <div className="mt-auto pt-6">
                      <a href={whatsappHref} target="_blank" rel="noopener" className={primary}>
                        <MessageCircle size={15} strokeWidth={1.75} aria-hidden />
                        {c.stayCta}
                      </a>
                      <span className="mt-2.5 block text-[11px] uppercase tracking-[0.2em] text-(--olivea-olive)">{c.stayVia}</span>
                    </div>
                  </div>
                </Reveal>}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {!past && <span className={`${label} text-(--olivea-olive)`}>{c.limited}</span>}
              <ShareButton
                url={pageUrl}
                title={c.metaTitle}
                text={c.shareText}
                label={c.share}
                copiedLabel={c.copied}
                className="inline-flex items-center gap-2 rounded-full bg-white/65 px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] font-semibold text-(--olivea-olive) ring-1 ring-(--olivea-olive)/18 hover:bg-white/85 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
