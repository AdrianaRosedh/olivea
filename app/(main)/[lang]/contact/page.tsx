// app/(main)/[lang]/contact/page.tsx
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { getDictionary, normalizeLang, type Lang } from "@/app/(main)/[lang]/dictionaries";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Lang = normalizeLang(raw);
  const dict = getDictionary(lang);
  const t = dict.contact;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: {
        "es-MX": "/es/contact",
        en: "/en/contact",
      },
    },
    openGraph: {
      title: t.metaTitle,
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

  return (
    <main className="-mt-16 md:mt-0 pt-12 sm:pt-16 md:pt-10 pb-10">
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="px-4 sm:px-8 lg:px-12 2xl:px-16 2xl:pr-28">
          <div className="mx-auto w-full max-w-[2200px]">
            <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr] xl:grid-cols-[0.60fr_0.40fr] items-start">
              <div className="flex flex-col gap-4">
                <header className="max-w-[980px] mt-4 sm:mt-6 lg:mt-10">
                  <p className="text-olive-900/60 text-[12px] tracking-[0.32em] uppercase">
                    {t.kicker}
                  </p>
                  <h1 className="mt-1 text-olive-900 text-3xl md:text-4xl font-semibold leading-[1.05]">
                    OLIVEA
                  </h1>
                  <p className="mt-2 text-olive-✅900/70 text-base md:text-lg leading-snug">
                    {t.subtitle}
                  </p>
                </header>

                <div className="grid grid-cols-3 gap-3">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-white/50 backdrop-blur ring-1 ring-black/5 px-3 py-3 text-sm text-olive-900/90 shadow-[0_8px_24px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 hover:bg-white/60"
                  >
                    <MapPin className="w-4 h-4 text-olive-700" />
                    {t.actions.maps}
                  </a>

                  <a
                    href={`mailto:${email}`}
                    className="rounded-2xl bg-white/50 backdrop-blur ring-1 ring-black/5 px-3 py-3 text-sm text-olive-900/90 shadow-[0_8px_24px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 hover:bg-white/60"
                  >
                    <Mail className="w-4 h-4 text-olive-700" />
                    {t.actions.email}
                  </a>

                  <a
                    href="tel:+5246463882369"
                    className="rounded-2xl bg-white/50 backdrop-blur ring-1 ring-black/5 px-3 py-3 text-sm text-olive-900/90 shadow-[0_8px_24px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 hover:bg-white/60"
                  >
                    <Phone className="w-4 h-4 text-olive-700" />
                    {t.actions.call}
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/55 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] p-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 text-olive-700" />
                      <div className="space-y-1">
                        <p className="text-sm text-olive-900/70">{t.labels.address}</p>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-olive-900 underline decoration-olive-700/35 hover:decoration-olive-700"
                        >
                          {address}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/55 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] p-5">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-0.5 text-olive-700" />
                      <div className="space-y-1">
                        <p className="text-sm text-olive-900/70">{t.labels.email}</p>
                        <a
                          href={`mailto:${email}`}
                          className="text-sm text-olive-900 underline decoration-olive-700/35 hover:decoration-olive-700 break-all"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/55 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] p-5">
                    <p className="text-olive-900 font-semibold text-base">
                      {t.sections.farmToTableTitle}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-olive-700" />
                      <a href="tel:+5246463836402" className="text-sm underline">
                        (646) 383-6402
                      </a>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-olive-700 mt-0.5" />
                      <div className="text-sm text-olive-900/80 leading-6">
                        {t.hours.farmToTable}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/55 backdrop-blur ring-1 ring-black/5 shadow-[0_10px_28px_rgba(0,0,0,0.05)] p-5">
                    <p className="text-olive-900 font-semibold text-base">
                      {t.sections.casaCafeTitle}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-olive-700" />
                      <a href="tel:+5246463882369" className="text-sm underline">
                        (646) 388-2369
                      </a>
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-olive-700 mt-0.5" />
                      <div className="text-sm text-olive-900/80 leading-6">
                        {t.hours.casaCafe}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-olive-900/60 leading-relaxed">
                  {t.footerNote}
                </p>
              </div>

              <aside className="relative">
                <div className="relative overflow-hidden rounded-3xl bg-(--olivea-mist)/80 ring-1 ring-black/5 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
                  <div className="relative h-[340px] sm:h-[420px] lg:h-[min(700px,calc(100vh-210px))] min-h-[560px]">
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
                        <p className="text-[10px] tracking-[0.3em] uppercase text-olive-900/70 font-semibold">
                          {t.map.badgeLabel}
                        </p>
                        <p className="mt-0.5 text-xs text-olive-900/90">
                          {t.map.badgeValue}
                        </p>
                      </div>
                    </div>

                    <div className="absolute right-4 top-4">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-2 ring-1 ring-black/5 text-xs text-olive-900/80 hover:text-olive-900"
                      >
                        {t.map.googleMapsCta}
                        <ExternalLink className="w-3.5 h-3.5 text-olive-700/80" />
                      </a>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}