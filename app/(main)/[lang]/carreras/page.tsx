// app/(main)/[lang]/carreras/page.tsx
import type { Metadata } from "next";
import { loadLocale } from "@/lib/i18n";
import Reveal from "@/components/scroll/Reveal";
import CardParallax from "@/components/mdx/CardParallax";
import ContactForm from "./contact-form";
import LiveOpenings from "./live-openings";
import { getContent, t } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await params;
  const { lang } = await loadLocale({ lang: p.lang });
  const c = await getContent("careers");

  return {
    title: t(lang as Lang, c.meta.title),
    description: t(lang as Lang, c.meta.description),
  };
}

function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "h-px bg-linear-to-r from-transparent via-black/10 to-transparent " + className
      }
    />
  );
}

export default async function CarrerasPage({ params }: Params) {
  const p = await params;
  const { lang } = await loadLocale({ lang: p.lang });
  const L = lang as Lang;
  const c = await getContent("careers");

  const wrap =
    "mx-auto w-full max-w-[1600px] px-6 sm:px-8 lg:px-10";

  const ctaPrimary =
    "rounded-full px-7 py-3 text-[12px] tracking-[0.22em] uppercase font-semibold bg-(--olivea-olive) text-white hover:bg-(--olivea-clay) ring-1 ring-white/10 shadow-[0_14px_40px_rgba(0,0,0,0.16)] transition-transform duration-300 hover:-translate-y-px";

  const ctaGhost =
    "rounded-full px-7 py-3 text-[12px] tracking-[0.22em] uppercase font-semibold bg-white/65 text-(--olivea-ink) hover:bg-white/80 ring-1 ring-black/10 shadow-[0_10px_26px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-px";

  const tile =
    "rounded-[26px] bg-white/22 backdrop-blur-sm ring-1 ring-black/8 shadow-[0_26px_70px_-50px_rgba(0,0,0,0.45)]";

  const pill =
    "inline-flex items-center rounded-full px-3 py-1 text-[12px] bg-white/65 ring-1 ring-black/8 text-(--olivea-ink)/75";

  const principles = c.principles.map((p) => ({
    k: t(L, p.title),
    v: t(L, p.description),
  }));

  const tracks = c.tracks.map((tr) => ({
    title: t(L, tr.title),
    desc: t(L, tr.description),
    chips: tr.chips,
  }));

  return (
    <main className="w-full">
      {/* HERO — wide, modern, not boxed */}
      <section className={wrap + " pt-10 md:pt-14"}>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
          {/* Copy */}
          <div className="lg:col-span-5 lg:pr-2 flex flex-col justify-center">
            <Reveal preset="fade">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-(--olivea-olive)" />
                <span className="text-[12px] uppercase tracking-[0.24em] text-(--olivea-olive)/85">
                  {t(L, c.hero.kicker)}
                </span>
              </div>
            </Reveal>

            <Reveal preset="up" delay={0.06}>
              <h1 className="mt-4 text-[42px] leading-[1.05] md:text-[56px] md:leading-[1.03] font-semibold tracking-[-0.02em] text-(--olivea-ink)">
                {t(L, c.hero.headline)}
              </h1>
            </Reveal>

            <Reveal preset="fade" delay={0.12}>
              <p className="mt-5 max-w-[62ch] text-[16px] md:text-[17px] leading-[1.9] text-(--olivea-ink)/76">
                {t(L, c.hero.description)}
              </p>
            </Reveal>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#vacantes" className={ctaPrimary}>
                {t(L, c.openings.title)}
              </a>
              <a href="#aplicar" className={ctaGhost}>
                {t(L, c.application.title)}
              </a>
            </div>

            {/* Minimal standards — clean list, not a big box */}
            <div className="mt-8">
              <div className="text-[12px] uppercase tracking-[0.22em] text-(--olivea-olive)/80">
                {t(L, c.standards.title)}
              </div>
              <ul className="mt-3 space-y-2 text-[14.5px] leading-[1.8] text-(--olivea-ink)/74">
                {c.standards.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2.25 h-1.5 w-1.5 rounded-full bg-(--olivea-olive)/70" />
                    <span>{t(L, item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hero image — big, premium, uses width */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[34px] ring-1 ring-black/10 h-64 sm:h-80 md:h-115">
              <CardParallax
                src={c.hero.image.src}
                alt={t(L, c.hero.image.alt)}
                speed={0.14}
                fit="cover"
                objectPosition="50% 62%"
                sizes="(max-width: 1024px) 100vw, 1000px"
                loading="lazy"
                placeholder="empty"
                className="-inset-12 md:-inset-10"
                surfaceClassName="h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/22 via-transparent to-transparent" />

              {/* Floating signals — clean, not chunky */}
              <div className="absolute left-5 right-5 bottom-5 grid gap-3 md:grid-cols-3">
                {c.hero.signals.map((s, i) => (
                  <div key={i} className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-(--olivea-olive)/85">
                      {t(L, s.label)}
                    </div>
                    <div className="mt-2 text-[14px] leading-[1.6] text-(--olivea-ink)/75">
                      {t(L, s.text)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring steps — horizontal + clean */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {c.hiringSteps.map((step) => t(L, step)).map((label, i) => (
                <div key={label} className="rounded-2xl bg-white/35 ring-1 ring-black/8 p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 ring-1 ring-black/10 text-[12px] text-(--olivea-ink)/75">
                      {i + 1}
                    </span>
                    <div className="text-[13px] uppercase tracking-[0.18em] text-(--olivea-ink)/70">
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider className="mt-12 md:mt-14" />
      </section>

      {/* PRINCIPLES — make it editorial (not 6 boxes) */}
      <section className={wrap + " pt-10 md:pt-12"}>
        <Reveal preset="up">
          <h2 className="text-2xl md:text-3xl font-semibold text-(--olivea-ink)">
            {t(L, c.principlesTitle ?? { es: "Cómo se ve la excelencia aquí", en: "What excellence looks like here" })}
          </h2>
        </Reveal>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {principles.map((p) => (
            <div key={p.k} className="rounded-[22px] bg-white/20 ring-1 ring-black/8 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="text-[12px] uppercase tracking-[0.22em] text-(--olivea-olive)/85">
                  {p.k}
                </div>
                <div className="h-px flex-1 bg-black/10" />
              </div>
              <p className="mt-3 text-[15px] leading-[1.85] text-(--olivea-ink)/76">
                {p.v}
              </p>
            </div>
          ))}
        </div>

        <Divider className="mt-12 md:mt-14" />
      </section>

      {/* TRACKS — big tiles, uses width */}
      <section className={wrap + " pt-10 md:pt-12"}>
        <Reveal preset="up">
          <h2 className="text-2xl md:text-3xl font-semibold text-(--olivea-ink)">
            {t(L, c.tracksTitle ?? { es: "Áreas", en: "Tracks" })}
          </h2>
        </Reveal>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((tr) => (
            <div key={tr.title} className={tile + " p-6"}>
              <div className="text-[12px] uppercase tracking-[0.24em] text-(--olivea-olive)/85">
                {tr.title}
              </div>
              <p className="mt-3 text-[15px] leading-[1.85] text-(--olivea-ink)/76">
                {tr.desc}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {tr.chips.map((c) => (
                  <span key={c} className={pill}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Divider className="mt-12 md:mt-14" />
      </section>

      {/* OPENINGS — wide, simple */}
      <section id="vacantes" className={wrap + " pt-10 md:pt-12 scroll-mt-28"}>
        <Reveal preset="up">
          <h2 className="text-2xl md:text-3xl font-semibold text-(--olivea-ink)">
            {t(L, c.openings.title)}
          </h2>
        </Reveal>

        {/* Live job openings from Supabase */}
        <div className="mt-6">
          <LiveOpenings lang={L} />
        </div>

        <div className="mt-6 rounded-[28px] bg-white/18 ring-1 ring-black/8 p-7 md:p-9">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              <div className="text-[13px] uppercase tracking-[0.22em] text-(--olivea-olive)/85">
                {t(L, c.openings.openApplication.label)}
              </div>

              <p className="mt-3 text-[16px] leading-[1.9] text-(--olivea-ink)/76 max-w-[70ch]">
                {t(L, c.openings.openApplication.description)}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#aplicar" className={ctaPrimary}>
                  {t(L, c.openings.openApplication.ctaLabel)}
                </a>
                <span className="inline-flex items-center text-[12.5px] text-(--olivea-ink)/60">
                  {t(L, c.openings.openApplication.responseTime)}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[22px] bg-white/40 ring-1 ring-black/10 p-5">
                <div className="text-[12px] uppercase tracking-[0.22em] text-(--olivea-olive)/85">
                  {t(L, c.openings.qualifications.title)}
                </div>
                <ul className="mt-3 space-y-2.5 text-[14.5px] leading-[1.8] text-(--olivea-ink)/74">
                  {c.openings.qualifications.items.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-2.25 h-1.5 w-1.5 rounded-full bg-(--olivea-olive)/70" />
                      <span>{t(L, item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Divider className="mt-12 md:mt-14" />
      </section>

      {/* APPLY — two column, wide, premium */}
      <section id="aplicar" className={wrap + " pt-10 md:pt-12 pb-18 md:pb-24 scroll-mt-28"}>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 items-start">
          <div className="lg:col-span-4">
            <Reveal preset="up">
              <h2 className="text-2xl md:text-3xl font-semibold text-(--olivea-ink)">
                {t(L, c.application.title)}
              </h2>
            </Reveal>

            <Reveal preset="fade" delay={0.06}>
              <p className="mt-4 text-[15.5px] leading-[1.95] text-(--olivea-ink)/74">
                {t(L, c.application.description)}
              </p>
            </Reveal>

            <div className="mt-6 rounded-[22px] bg-white/20 ring-1 ring-black/8 p-5">
              <div className="text-[12px] uppercase tracking-[0.22em] text-(--olivea-olive)/85">
                {t(L, c.application.tip.label)}
              </div>
              <p className="mt-3 text-[14.5px] leading-[1.85] text-(--olivea-ink)/74">
                {t(L, c.application.tip.text)}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="rounded-[30px] bg-white/22 backdrop-blur-sm ring-1 ring-black/8 shadow-[0_26px_70px_-50px_rgba(0,0,0,0.45)] p-5 md:p-8">
              <ContactForm lang={lang} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
