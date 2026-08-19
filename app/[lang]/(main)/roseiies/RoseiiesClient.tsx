"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/scroll/Reveal";
import type { RoseiiesContent, Bilingual } from "@/lib/content/types";

export default function RoseiiesClient({
  lang,
  content,
}: {
  lang: "en" | "es";
  content: RoseiiesContent;
}) {
  // Content comes from the CMS (Supabase row, falling back to the static
  // seed in lib/content/data/roseiies.ts) — edit it at /admin/content/roseiies.
  const t = (b: Bilingual) => (lang === "es" ? b.es : b.en);

  const [studioSection, practiceSection, principlesSection] = content.sections;

  return (
    <main className="relative w-full overflow-clip px-6 sm:px-10 md:px-12 pt-24 sm:pt-28 pb-40 sm:pb-32">
      {/* Soft warm glow echoing the roseiies orb — quiet, elevated */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
        style={{
          background:
            "radial-gradient(58% 100% at 50% 0%, rgba(182,137,74,0.12), rgba(231,234,225,0) 72%)",
        }}
      />

      <div className="mx-auto max-w-[1000px]">
        {/* ───────── HERO ───────── */}
        <Reveal preset="fade">
          <header className="max-w-[68ch]">
            <Link
              href={`/${lang}/innovation`}
              className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-(--olivea-olive)/70 hover:text-(--olivea-honey) transition"
            >
              <span aria-hidden="true">←</span>
              {t(content.hero.back)}
            </Link>
            {/* roseiies wordmark — the studio's main logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/roseiies-logo.svg"
              alt="roseiies"
              className="mt-8 h-9 sm:h-10 w-auto"
            />
            <div className="mt-8 text-[12px] uppercase tracking-[0.34em] text-(--olivea-honey)">
              {t(content.hero.eyebrow)}
            </div>
            <h1
              className="mt-3 text-[clamp(2.5rem,1.6rem_+_3.6vw,4rem)] font-semibold tracking-[-0.02em] text-(--olivea-forest)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t(content.hero.headline)}
            </h1>
            <p className="mt-6 text-[17px] sm:text-[19px] leading-relaxed text-(--olivea-olive) max-w-[60ch]">
              {t(content.hero.intro)}
            </p>
          </header>
        </Reveal>

        {/* ───────── FOUNDER — Adriana ───────── */}
        <Reveal preset="up" delay={0.05}>
          <section className="mt-20 sm:mt-28 grid items-center gap-10 lg:gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
            {/* Portrait with soft warm halo */}
            <div className="relative mx-auto w-full max-w-[420px]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px]"
                style={{
                  background:
                    "radial-gradient(70% 70% at 50% 30%, rgba(182,137,74,0.18), rgba(231,234,225,0) 70%)",
                }}
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] ring-1 ring-(--olivea-honey)/25 shadow-[0_40px_80px_-40px_rgba(40,40,30,0.5)]">
                <Image
                  src={content.founder.image || "/images/team/adriana.jpg"}
                  alt="Adriana Rose"
                  fill
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="object-cover object-center"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--olivea-forest)/15 via-transparent to-transparent" />
              </div>
            </div>

            {/* Narrative */}
            <div className="max-w-[56ch]">
              <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-honey)">
                {t(content.founder.eyebrow)}
              </div>
              <h2
                className="mt-3 text-[clamp(1.9rem,1.4rem_+_1.8vw,2.6rem)] font-semibold tracking-[-0.02em] text-(--olivea-forest)"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(content.founder.title)}
              </h2>
              <div className="mt-5 space-y-4 text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)">
                {content.founder.paragraphs.map((p, i) => (
                  <p key={i}>{t(p)}</p>
                ))}
              </div>
              <blockquote
                className="mt-7 border-l-2 border-(--olivea-honey)/50 pl-5 text-[19px] sm:text-[22px] leading-snug text-(--olivea-forest)"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {t(content.founder.quote)}
              </blockquote>
            </div>
          </section>
        </Reveal>

        {/* ───────── EDITORIAL SECTIONS ───────── */}
        {studioSection && (
          <Section
            eyebrow={t(studioSection.eyebrow)}
            title={t(studioSection.title)}
            body={studioSection.body.map(t)}
          />
        )}

        {practiceSection && (
          <Section
            eyebrow={t(practiceSection.eyebrow)}
            title={t(practiceSection.title)}
            body={practiceSection.body.map(t)}
          />
        )}

        {principlesSection && (
          <Section
            eyebrow={t(principlesSection.eyebrow)}
            title={t(principlesSection.title)}
            body={principlesSection.body.map(t)}
          >
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {content.beliefs.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-2xl bg-(--olivea-ivory)/55 ring-1 ring-(--olivea-olive)/10 px-5 py-4 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--olivea-honey)"
                    aria-hidden="true"
                  />
                  <span>{t(b)}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* ───────── CTA ───────── */}
        <Reveal preset="up" delay={0.05}>
          <div className="mt-24 rounded-[28px] bg-(--olivea-ivory)/50 ring-1 ring-(--olivea-honey)/20 px-7 py-9 sm:px-10 sm:py-11">
            <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.28em] text-(--olivea-olive)/70">
              <span>{t(content.cta.kicker)}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/roseiies-logo.svg"
                alt="roseiies"
                className="h-4 w-auto"
              />
            </div>
            <p
              className="mt-4 max-w-[48ch] text-[18px] sm:text-[20px] leading-snug text-(--olivea-forest)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t(content.cta.line)}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="https://roseiies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 sm:py-3 bg-(--olivea-olive) text-white text-[12px] uppercase tracking-[0.28em] shadow-[0_14px_34px_-20px_rgba(0,0,0,0.45)] hover:opacity-95 transition"
              >
                {t(content.cta.primary)}
              </a>
              <Link
                href={`/${lang}/sustainability`}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 sm:py-3 bg-white/60 ring-1 ring-(--olivea-honey)/30 text-[12px] uppercase tracking-[0.28em] text-(--olivea-honey) hover:bg-white/80 transition"
              >
                {t(content.cta.secondary)}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string[];
  children?: ReactNode;
}) {
  return (
    <Reveal preset="up" delay={0.05}>
      <section className="mt-16 sm:mt-20 max-w-[72ch]">
        <div className="flex items-center gap-3">
          <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-honey)">
            {eyebrow}
          </div>
          <div className="h-px flex-1 bg-linear-to-r from-(--olivea-honey)/30 to-transparent" />
        </div>
        <h2
          className="mt-4 text-[clamp(1.6rem,1.3rem_+_1.4vw,2.1rem)] font-semibold tracking-[-0.02em] text-(--olivea-forest)"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h2>
        <div className="mt-4 space-y-4">
          {body.map((p, i) => (
            <p
              key={i}
              className="text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)"
            >
              {p}
            </p>
          ))}
        </div>
        {children}
      </section>
    </Reveal>
  );
}
