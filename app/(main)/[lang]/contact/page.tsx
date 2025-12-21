// app/(main)/[lang]/contact/page.tsx
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import {
  getDictionary,
  normalizeLang,
  type Lang,
} from "@/app/(main)/[lang]/dictionaries";

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
    // avoid double-branding if translator already included it
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
  const t = dict.contact;

  const address = "México 3 Km 92.5, 22766 Villa de Juárez, B.C.";
  const mapsUrl = "https://maps.app.goo.gl/oySkL6k7G7t5VFus5";
  const email = "hola@casaolivea.com";

  // Lighter pills, consistent with your Journal glass language
  const pill =
    "rounded-full bg-white/34 backdrop-blur ring-1 ring-black/5 transition hover:bg-white/45";

  // Premium glass card
  const card =
    "rounded-3xl bg-white/48 backdrop-blur ring-1 ring-black/5 shadow-[0_16px_40px_rgba(40,60,35,0.10)]";

  return (
    <main className="pt-10 sm:pt-14 md:pt-12 pb-24">
      {/* FULL BLEED */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <section className="px-5 sm:px-10 lg:px-12 2xl:px-16 2xl:pr-28">
          {/* ✅ WIDE RAIL */}
          <div className="mx-auto w-full max-w-250">
            {/* ✅ LEFT-HEAVY SPLIT so content isn’t squeezed */}
            <div className="grid gap-10 lg:gap-12 items-start lg:grid-cols-[minmax(560px,1.15fr)_minmax(520px,0.85fr)]">
              {/* LEFT */}
              <div className="flex flex-col gap-7">
                <header className="pt-2 sm:pt-6">
                  <p className="text-(--olivea-ink)/55 text-[12px] tracking-[0.34em] uppercase">
                    {t.kicker}
                  </p>

                  <h1
                    className="mt-2 text-(--olivea-ink) text-4xl md:text-5xl font-semibold leading-[1.02] tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    OLIVEA
                  </h1>

                  <p className="mt-3 text-(--olivea-ink)/70 text-[15px] md:text-[17px] leading-relaxed max-w-[62ch]">
                    {t.subtitle}
                  </p>
                </header>

                {/* ACTIONS */}
                <div className="grid grid-cols-3 gap-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${pill} px-4 py-3.5 text-sm text-(--olivea-ink)/85 flex items-center justify-center gap-2`}
                  >
                    <MapPin className="w-4 h-4 text-(--olivea-olive)" />
                    {t.actions.maps}
                  </a>

                  <a
                    href={`mailto:${email}`}
                    className={`${pill} px-4 py-3.5 text-sm text-(--olivea-ink)/85 flex items-center justify-center gap-2`}
                  >
                    <Mail className="w-4 h-4 text-(--olivea-olive)" />
                    {t.actions.email}
                  </a>

                  <a
                    href="tel:+5246463882369"
                    className={`${pill} px-4 py-3.5 text-sm text-(--olivea-ink)/85 flex items-center justify-center gap-2`}
                  >
                    <Phone className="w-4 h-4 text-(--olivea-olive)" />
                    {t.actions.call}
                  </a>
                </div>

                {/* INFO GRID */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`${card} p-6`}>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 text-(--olivea-olive)" />
                      <div className="space-y-1">
                        <p className="text-sm text-(--olivea-ink)/60">
                          {t.labels.address}
                        </p>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-(--olivea-ink) underline decoration-(--olivea-olive)/30 hover:decoration-(--olivea-olive)"
                        >
                          {address}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={`${card} p-6`}>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-0.5 text-(--olivea-olive)" />
                      <div className="space-y-1">
                        <p className="text-sm text-(--olivea-ink)/60">
                          {t.labels.email}
                        </p>
                        <a
                          href={`mailto:${email}`}
                          className="text-sm text-(--olivea-ink) underline decoration-(--olivea-olive)/30 hover:decoration-(--olivea-olive) break-all"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={`${card} p-6`}>
                    <p className="text-(--olivea-ink) font-semibold text-[16px]">
                      {t.sections.farmToTableTitle}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-(--olivea-olive)" />
                      <a
                        href="tel:+5246463836402"
                        className="text-sm underline decoration-(--olivea-olive)/30 hover:decoration-(--olivea-olive)"
                      >
                        (646) 383-6402
                      </a>
                    </div>

                    <div className="mt-3 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-(--olivea-olive) mt-0.5" />
                      <div className="text-sm text-(--olivea-ink)/75 leading-6">
                        {t.hours.farmToTable}
                      </div>
                    </div>
                  </div>

                  <div className={`${card} p-6`}>
                    <p className="text-(--olivea-ink) font-semibold text-[16px]">
                      {t.sections.casaCafeTitle}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-(--olivea-olive)" />
                      <a
                        href="tel:+5246463882369"
                        className="text-sm underline decoration-(--olivea-olive)/30 hover:decoration-(--olivea-olive)"
                      >
                        (646) 388-2369
                      </a>
                    </div>

                    <div className="mt-3 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-(--olivea-olive) mt-0.5" />
                      <div className="text-sm text-(--olivea-ink)/75 leading-6">
                        {t.hours.casaCafe}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-(--olivea-ink)/55 leading-relaxed max-w-[75ch]">
                  {t.footerNote}
                </p>
              </div>

              {/* RIGHT */}
              <aside className="lg:sticky lg:top-28">
                <div className="lg:max-w-160 lg:ml-auto">
                  <div className={`${card} overflow-hidden`}>
                    <div className="relative h-130 lg:h-[min(720px,calc(100vh-220px))]">
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`/olivea-locator?lang=${lang}`}
                        title={t.map.iframeTitle}
                        loading="lazy"
                        style={{ border: 0 }}
                        referrerPolicy="no-referrer-when-downgrade"
                        allow="geolocation; fullscreen"
                      />

                      <div className="absolute left-4 top-4">
                        <div className="rounded-2xl bg-white/70 backdrop-blur px-3 py-2 ring-1 ring-black/5">
                          <p className="text-[10px] tracking-[0.3em] uppercase text-(--olivea-ink)/65 font-semibold">
                            {t.map.badgeLabel}
                          </p>
                          <p className="mt-0.5 text-xs text-(--olivea-ink)/90">
                            {t.map.badgeValue}
                          </p>
                        </div>
                      </div>

                      <div className="absolute right-4 top-4">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-2 ring-1 ring-black/5 text-xs text-(--olivea-ink)/75 hover:text-(--olivea-ink)"
                        >
                          {t.map.googleMapsCta}
                          <ExternalLink className="w-3.5 h-3.5 text-(--olivea-olive)/80" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
