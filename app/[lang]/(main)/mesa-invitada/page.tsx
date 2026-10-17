// app/[lang]/(main)/mesa-invitada/page.tsx
//
// Mesa Invitada — the guest-chef dinner series. This is the link that gets
// shared (Instagram bio, WhatsApp, the site popup), so it has to say what the
// evening is, what it costs and how to book it, in one screen on a phone.
//
// The dinner books through its OpenTable experience; the stay package has no
// online checkout and goes to reception over WhatsApp. Each new volume only
// needs EVENT and the copy below changed, plus a new poster under
// /images/events/.
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { loadLocale, type Lang } from "@/lib/i18n";
import Reveal from "@/components/scroll/Reveal";
import { canonicalUrl, localeAlternates, withShare } from "@/lib/site";
import { jsonLdHtml } from "@/lib/seo/json-ld";
import ShareButton from "./ShareButton";

type Params = { params: Promise<{ lang: string }> };

const EVENT = {
  date: "2026-11-01",
  poster: "/images/events/mesa-invitada-03/poster-v4.jpg",
  share: "/images/seo/mesa-invitada-03-share-v4.jpg",
  openTable:
    "https://www.opentable.com.mx/booking/experiences-availability?rid=1313743&restref=1313743&experienceId=818362&utm_source=olivea&utm_medium=website&utm_campaign=mesa-invitada-03",
  // Casa Olivea reception.
  whatsapp: "526463882369",
  dinnerPrice: 2550,
  stayPrice: 10031,
} as const;

const COPY = {
  es: {
    metaTitle: "Mesa Invitada Vol. 03 · Cena de Día de Muertos + Estancia en Casa Olivea",
    metaDescription:
      "Domingo 1 de noviembre, cena de Día de Muertos con el chef Fernando Hernández (Moyuelo): $2,550 MXN por persona con maridaje. O la estancia completa: 2 noches en Casa Olivea + la cena por $10,031 MXN para 2 personas + impuestos y servicio.",
    kicker: "Mesa Invitada · Volumen 03",
    occasion: "Día de Muertos",
    title: "Cena de Día de Muertos y estancia en Casa Olivea",
    chefLabel: "Chef invitado",
    chef: "Fernando Hernández",
    chefOf: "Moyuelo · Estrella MICHELIN",
    when: "Domingo 1 de noviembre",
    where: "Olivea Farm To Table · Valle de Guadalupe, Baja California",
    intro:
      "Para el Día de Muertos abrimos nuestra mesa al chef Fernando Hernández, de Moyuelo. Juntos cocinamos un menú creado desde el huerto de Olivea, acompañado de su maridaje: una sola noche para recordar a quienes nos dieron de comer.",
    dinnerKicker: "Cena con maridaje",
    dinnerTitle: "La cena",
    dinnerBody: "Menú de temporada desde el huerto de Olivea, con maridaje del huerto incluido.",
    perPerson: "MXN por persona",
    dinnerCta: "Reservar cena",
    dinnerVia: "Vía OpenTable",
    stayKicker: "Estancia completa",
    stayTitle: "Cena + 2 noches en Casa Olivea",
    stayBody:
      "Para 2 personas: dos noches de hospedaje en Casa Olivea y la cena con maridaje del 1 de noviembre. Precio especial válido únicamente con esta cena de Mesa Invitada. Se reserva directamente con recepción.",
    plusTax: "MXN para 2 personas + impuestos y servicio",
    stayCta: "Reservar estancia",
    stayVia: "Vía WhatsApp con recepción",
    stayMessage:
      "Hola, me interesa la Estancia Completa de Mesa Invitada Vol. 03 con el chef Fernando Hernández (1 de noviembre): 2 noches en Casa Olivea + la cena con maridaje, para 2 personas.",
    limited: "Cupo limitado",
    share: "Compartir",
    copied: "Enlace copiado",
    shareText: "Mesa Invitada Vol. 03 en Olivea: cena de Día de Muertos con el chef Fernando Hernández.",
    posterAlt:
      "Cartel de Mesa Invitada Volumen 03: el chef Fernando Hernández, de Moyuelo, sentado en un sillón; cena de Día de Muertos el domingo 1 de noviembre en Olivea Farm To Table.",
  },
  en: {
    metaTitle: "Mesa Invitada Vol. 03 · Día de Muertos Dinner + Stay at Casa Olivea",
    metaDescription:
      "Sunday, November 1, a Día de Muertos dinner with chef Fernando Hernández (Moyuelo): $2,550 MXN per person with pairing. Or the full stay: 2 nights at Casa Olivea + the dinner for $10,031 MXN for 2 guests + tax and service.",
    kicker: "Mesa Invitada · Volume 03",
    occasion: "Día de Muertos",
    title: "A Día de Muertos dinner and a stay at Casa Olivea",
    chefLabel: "Guest chef",
    chef: "Fernando Hernández",
    chefOf: "Moyuelo · MICHELIN Star",
    when: "Sunday, November 1",
    where: "Olivea Farm To Table · Valle de Guadalupe, Baja California",
    intro:
      "For Día de Muertos we open our table to chef Fernando Hernández of Moyuelo. Together we cook a menu drawn from the Olivea garden, served with its pairing: one night to remember the people who fed us.",
    dinnerKicker: "Dinner with pairing",
    dinnerTitle: "The dinner",
    dinnerBody: "A seasonal menu from the Olivea garden, with the garden pairing included.",
    perPerson: "MXN per person",
    dinnerCta: "Book the dinner",
    dinnerVia: "Via OpenTable",
    stayKicker: "The full stay",
    stayTitle: "Dinner + 2 nights at Casa Olivea",
    stayBody:
      "For 2 guests: two nights at Casa Olivea and the November 1 dinner with pairing. Special rate valid only with this Mesa Invitada dinner. Booked directly with reception.",
    plusTax: "MXN for 2 guests + tax and service",
    stayCta: "Book the stay",
    stayVia: "Via WhatsApp with reception",
    stayMessage:
      "Hi, I'm interested in the Mesa Invitada Vol. 03 full stay with chef Fernando Hernández (November 1): 2 nights at Casa Olivea + the dinner with pairing, for 2 guests.",
    limited: "Limited seating",
    share: "Share",
    copied: "Link copied",
    shareText: "Mesa Invitada Vol. 03 at Olivea: a Día de Muertos dinner with chef Fernando Hernández.",
    posterAlt:
      "Mesa Invitada Volume 03 poster: chef Fernando Hernández of Moyuelo seated on a sofa; a Día de Muertos dinner on Sunday, November 1 at Olivea Farm To Table.",
  },
} as const;

const mxn = (n: number) => `$${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await loadLocale({ lang: (await params).lang });
  const c = COPY[lang === "en" ? "en" : "es"];
  return withShare(
    {
      title: c.metaTitle,
      description: c.metaDescription,
      alternates: localeAlternates(lang, "/mesa-invitada"),
    },
    { lang, path: "/mesa-invitada", image: EVENT.share, alt: c.posterAlt }
  );
}

export default async function MesaInvitadaPage({ params }: Params) {
  const { lang } = await loadLocale({ lang: (await params).lang });
  const L: Lang = lang === "en" ? "en" : "es";
  const c = COPY[L];
  const pageUrl = canonicalUrl(`/${L}/mesa-invitada`);
  const whatsappHref = `https://wa.me/${EVENT.whatsapp}?text=${encodeURIComponent(c.stayMessage)}`;

  // Event markup lets Google show the date, place and price as a rich result.
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "FoodEvent",
    name: `Mesa Invitada Vol. 03 — ${c.chef}`,
    description: c.metaDescription,
    startDate: EVENT.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [canonicalUrl(EVENT.poster), canonicalUrl(EVENT.share)],
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
        price: EVENT.dinnerPrice,
        priceCurrency: "MXN",
        availability: "https://schema.org/LimitedAvailability",
        url: EVENT.openTable,
      },
      {
        "@type": "Offer",
        name: c.stayTitle,
        price: EVENT.stayPrice,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(eventLd) }}
      />

      <section className="mx-auto w-full max-w-300 px-6 sm:px-8 lg:px-10 pt-8 md:pt-14 pb-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Poster */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[22px] ring-1 ring-black/10 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.55)] bg-(--olivea-forest)">
              <Image
                src={EVENT.poster}
                alt={c.posterAlt}
                width={1620}
                height={2025}
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="h-auto w-full"
              />
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
                      {mxn(EVENT.dinnerPrice)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] opacity-80">{c.perPerson}</span>
                  </div>
                  <div className="mt-auto pt-6">
                    <a href={EVENT.openTable} target="_blank" rel="noopener" className={primary}>
                      {c.dinnerCta}
                      <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
                    </a>
                    <span className="mt-2.5 block text-[11px] uppercase tracking-[0.2em] text-(--olivea-olive)/70">{c.dinnerVia}</span>
                  </div>
                </div>
              </Reveal>

              {/* Stay */}
              <Reveal preset="up" delay={0.18}>
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
                      {mxn(EVENT.stayPrice)}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] opacity-80">{c.plusTax}</span>
                  </div>
                  <div className="mt-auto pt-6">
                    <a href={whatsappHref} target="_blank" rel="noopener" className={primary}>
                      <MessageCircle size={15} strokeWidth={1.75} aria-hidden />
                      {c.stayCta}
                    </a>
                    <span className="mt-2.5 block text-[11px] uppercase tracking-[0.2em] text-(--olivea-olive)/70">{c.stayVia}</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className={`${label} text-(--olivea-olive)`}>{c.limited}</span>
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
