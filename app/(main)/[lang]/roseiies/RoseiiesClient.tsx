"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/scroll/Reveal";

export default function RoseiiesClient({ lang }: { lang: "en" | "es" }) {
  const t = (esText: string, enText: string) => (lang === "es" ? esText : enText);

  const beliefs = [
    t(
      "Las herramientas amplían la capacidad de un equipo, no la reducen.",
      "Tools expand a team's capacity — they don't diminish it.",
    ),
    t(
      "Diseñado para quienes operan, no para quienes miran tableros.",
      "Built for the people who operate, not the ones who watch dashboards.",
    ),
    t(
      "Una sola fuente de verdad para toda la propiedad.",
      "One source of truth for the whole property.",
    ),
    t(
      "Software calmado para un oficio inherentemente caótico.",
      "Calm software for an inherently chaotic craft.",
    ),
  ];

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
              {t("Volver a Innovación", "Back to Innovation")}
            </Link>
            {/* roseiies wordmark — the studio's main logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/roseiies-logo.svg"
              alt="roseiies"
              className="mt-8 h-9 sm:h-10 w-auto"
            />
            <div className="mt-8 text-[12px] uppercase tracking-[0.34em] text-(--olivea-honey)">
              {t("Tecnología", "Technology")}
            </div>
            <h1
              className="mt-3 text-[clamp(2.5rem,1.6rem_+_3.6vw,4rem)] font-semibold tracking-[-0.02em] text-(--olivea-forest)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("Construido con roseiies", "Built with roseiies")}
            </h1>
            <p className="mt-6 text-[17px] sm:text-[19px] leading-relaxed text-(--olivea-olive) max-w-[60ch]">
              {t(
                "Detrás de cada carta viva, cada reservación y el mapa del huerto en tiempo real hay un estudio: roseiies. Así es como Olivea innova — con tecnología que desaparece dentro del trabajo.",
                "Behind every living menu, every reservation, and the real-time garden map is a studio: roseiies. This is how Olivea innovates — with technology that disappears into the work.",
              )}
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
                  src="/images/team/adriana.jpg"
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
                {t("La fundadora", "The founder")}
              </div>
              <h2
                className="mt-3 text-[clamp(1.9rem,1.4rem_+_1.8vw,2.6rem)] font-semibold tracking-[-0.02em] text-(--olivea-forest)"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t("Una misma mente", "One mind")}
              </h2>
              <div className="mt-5 space-y-4 text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)">
                <p>
                  {t(
                    "Adriana Rose fundó roseiies y dirige Olivea como su CEO. Arquitecta del ecosistema Olivea, diseña la experiencia como un sistema vivo donde concepto, tecnología y sensibilidad estética convergen.",
                    "Adriana Rose founded roseiies and leads Olivea as its CEO. The architect of the Olivea ecosystem, she designs the experience as a living system where concept, technology, and aesthetic sensibility converge.",
                  )}
                </p>
                <p>
                  {t(
                    "Lo que aprende caminando el piso de Olivea — llevando los libros, abriendo el restaurante — moldea roseiies. Y lo que construye en roseiies regresa a Olivea.",
                    "What she learns walking the floor at Olivea — keeping the books, opening the restaurant — shapes roseiies. And what she builds in roseiies returns to Olivea.",
                  )}
                </p>
              </div>
              <blockquote
                className="mt-7 border-l-2 border-(--olivea-honey)/50 pl-5 text-[19px] sm:text-[22px] leading-snug text-(--olivea-forest)"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {t("Una hace mejor a la otra.", "Each makes the other better.")}
              </blockquote>
            </div>
          </section>
        </Reveal>

        {/* ───────── EDITORIAL SECTIONS ───────── */}
        <Section
          eyebrow={t("El estudio", "The studio")}
          title={t(
            "Un espacio de trabajo para toda la propiedad",
            "One workspace for the whole property",
          )}
          body={[
            t(
              "roseiies nació de una frustración simple: las herramientas para administrar un lugar como Olivea estaban dispersas, ruidosas y diseñadas para tableros — no para personas.",
              "roseiies began from a simple frustration: the tools to run a place like Olivea were scattered, noisy, and built for dashboards — not for people.",
            ),
            t(
              "La idea es una sola: reunir el huerto, la cocina, el comedor y el hotel bajo una misma fuente de verdad. Software calmado para un oficio inherentemente caótico.",
              "The idea is singular: bring the garden, the kitchen, the dining room, and the stay under one source of truth. Calm software for an inherently chaotic craft.",
            ),
          ]}
        />

        <Section
          eyebrow={t("En la práctica", "In practice")}
          title={t("Cómo Olivea funciona con roseiies", "How Olivea runs on roseiies")}
          body={[
            t(
              "Lo que ves vivo en Olivea, vive en roseiies: las cartas que se actualizan solas — maridaje, vinos —, el mapa del huerto en tiempo real, y el conocimiento que permite que un equipo pequeño sostenga una visión grande.",
              "Everything you see live at Olivea lives on roseiies: the menus that update themselves — pairings, wine — the real-time garden map, and the knowledge that lets a small team hold a large vision.",
            ),
            t(
              "Y lo que no ves, también: la organización de tareas, el monitoreo de energía, los ciclos de retroalimentación. La capa digital viva de un ecosistema vivo.",
              "And what you don't see, too: scheduling, energy monitoring, feedback loops. The living digital layer of a living ecosystem.",
            ),
          ]}
        />

        <Section
          eyebrow={t("Principios", "Principles")}
          title={t("Tecnología silenciosa", "Quiet technology")}
          body={[
            t(
              "En Olivea, la tecnología es intencionalmente silenciosa. roseiies comparte esa creencia. Innovar, aquí, es menos fricción — no más pantallas.",
              "At Olivea, technology is intentionally quiet. roseiies shares that belief. Innovation, here, is less friction — not more screens.",
            ),
          ]}
        >
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {beliefs.map((b) => (
              <li
                key={b}
                className="flex gap-3 rounded-2xl bg-(--olivea-ivory)/55 ring-1 ring-(--olivea-olive)/10 px-5 py-4 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--olivea-honey)"
                  aria-hidden="true"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* ───────── CTA ───────── */}
        <Reveal preset="up" delay={0.05}>
          <div className="mt-24 rounded-[28px] bg-(--olivea-ivory)/50 ring-1 ring-(--olivea-honey)/20 px-7 py-9 sm:px-10 sm:py-11">
            <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.28em] text-(--olivea-olive)/70">
              <span>{t("Hecho con", "Built with")}</span>
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
              {t(
                "Conoce el estudio detrás de la capa viva de Olivea.",
                "Meet the studio behind Olivea's living layer.",
              )}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a
                href="https://roseiies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 sm:py-3 bg-(--olivea-olive) text-white text-[12px] uppercase tracking-[0.28em] shadow-[0_14px_34px_-20px_rgba(0,0,0,0.45)] hover:opacity-95 transition"
              >
                {t("Conoce el estudio", "Meet the studio")}
              </a>
              <Link
                href={`/${lang}/sustainability`}
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 sm:py-3 bg-white/60 ring-1 ring-(--olivea-honey)/30 text-[12px] uppercase tracking-[0.28em] text-(--olivea-honey) hover:bg-white/80 transition"
              >
                {t("Nuestra filosofía", "Our philosophy")}
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
