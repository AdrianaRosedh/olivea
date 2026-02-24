// app/(main)/[lang]/sustainability/PhilosophyClient.tsx
"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lang, PhilosophySection } from "./philosophyTypes";
import PhilosophyDockLeft from "./PhilosophyDockLeft";
import FloatingPracticesCardGSAP from "./FloatingPracticesCardGSAP";
import { PracticesCard, SignalsRow } from "./ProofModules";
import PhilosophyMobileNav from "./PhilosophyMobileNav";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

function paragraphs(body: string) {
  return body
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ---------------- inline bio links (no MDX compile required) ---------------- */

const BIO_TARGETS: Array<{ name: string; id: string }> = [
  { name: "Ange Joy", id: "ange" },
  { name: "Cristina", id: "cristina" },
  { name: "Adriana Rose", id: "adrianarose" },
  { name: "Daniel Nates", id: "danielnates" },
];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function linkifyNames(text: string, lang: Lang): ReactNode {
  const pattern = BIO_TARGETS.map((x) => escapeRe(x.name)).join("|");
  if (!pattern) return text;

  const re = new RegExp(`(${pattern})`, "g");
  const parts = text.split(re);

  return parts.map((part, idx) => {
    const hit = BIO_TARGETS.find((x) => x.name === part);
    if (!hit) return part;

    const href = `/${lang}/team/${hit.id}`;

    return (
      <a
        key={`${hit.id}-${idx}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "underline underline-offset-4",
          "decoration-(--olivea-olive)/55",
          "hover:decoration-(--olivea-olive)",
          "transition-colors"
        )}
      >
        {hit.name}
      </a>
    );
  });
}

function MobilePractices({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items?.length) return null;

  return (
    <div className="lg:hidden mt-6">
      <details className="rounded-2xl bg-white/45 ring-1 ring-(--olivea-olive)/12 shadow-[0_10px_24px_rgba(40,60,35,0.08)] overflow-hidden">
        <summary className="cursor-pointer list-none px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-70">
              {title}
            </div>
            <div className="text-(--olivea-olive) opacity-60 text-[12px]">
              Ver
            </div>
          </div>
        </summary>

        <div className="px-5 pb-5">
          <ul className="mt-2 space-y-3 text-[15px] leading-relaxed text-(--olivea-clay)">
            {items.map((x) => (
              <li key={x} className="flex gap-3">
                <span className="opacity-40">—</span>
                <span className="flex-1">{x}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}

/* ---------- motion ---------- */

const heroV: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: EASE },
  },
};

const chapterV: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const headerV: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

const bodyV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
};

const pV: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE } },
};

const moduleV: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

// ✅ earlier reveal to avoid “blank gaps” on mobile
const VIEWPORT = {
  once: true,
  amount: 0.12,
  margin: "20% 0px -5% 0px",
} as const;

export default function PhilosophyClient({
  lang,
  sections,
}: {
  lang: Lang;
  sections: PhilosophySection[];
}) {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  // ✅ ensure we land at top when entering this page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  const { scrollYProgress } = useScroll();
  const glowY = useTransform(scrollYProgress, [0, 1], ["14%", "72%"]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    reduce ? [0.18, 0.14, 0.12] : [0.42, 0.22, 0.16]
  );

  const FULL_BLEED =
    "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]";
  const PAGE_PAD = "px-6 sm:px-10 md:px-12 lg:px-12";
  const RAIL = "max-w-[1200px]";

  const heroSignals = useMemo(
    () => [
      tt(lang, "Huerto primero", "Garden-first"),
      tt(lang, "Eficiencia como respeto", "Efficiency as respect"),
      tt(lang, "Tecnología consciente", "Conscious technology"),
      tt(lang, "Colibríes", "Colibríes"),
    ],
    [lang]
  );
  
  const sustainabilitySpine = useMemo(
    () =>
      tt(
        lang,
        "En Olivea, la sustentabilidad es eficiencia, no como tendencia, no como etiqueta, sino como respeto llevado a la práctica.",
        "At Olivea, sustainability is efficiency, not as a trend, not as a label, but as respect made practical."
      ),
    [lang]
  );

  const inkSoft = "text-(--olivea-olive) ";

  return (
    <main id="top" className="w-full pt-0 pb-38 sm:pb-28">
      <PhilosophyMobileNav lang={lang} sections={sections} />
      <PhilosophyDockLeft lang={lang} sections={sections} />

      <section className={FULL_BLEED}>
        <div className={PAGE_PAD}>
          <div
            className={cn(
              `${RAIL} mx-auto`,
              "md:mr-(--dock-right)",
              // 👇 only reserve a little space for the compact button at lg
              "lg:ml-16",
              // 👇 reserve full space for the full dock at xl+
              "xl:ml-86"
            )}
          >
            {/* Background spotlight */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-0"
              style={{ opacity: glowOpacity as unknown as number }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 52% ${glowY.get()}, rgba(94,118,88,0.18), rgba(94,118,88,0.0) 58%)`,
                }}
              />
            </motion.div>

            {/* HERO */}
            <motion.header
              className="relative z-10 mt-10 sm:mt-12 max-w-[82ch]"
              variants={heroV}
              initial="hidden"
              animate="show"
            >
              <div className="text-[12px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-70">
                {tt(lang, "Filosofía", "Philosophy")}
              </div>

              <h1
                className="mt-3 text-[38px] sm:text-[46px] md:text-[52px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {tt(
                  lang,
                  "Donde el huerto es la esencia",
                  "Where the garden is the essence"
                )}
              </h1>

              <p
                className={cn(
                  "mt-5 text-[16px] sm:text-[17px] leading-relaxed",
                  inkSoft
                )}
              >
                <span className="font-semibold text-(--olivea-olive)">
                  Olivea
                </span>{" "}
                <span className="opacity-85">
                  (IPA: <span className="font-semibold">/oˈli.βe.a/</span> —{" "}
                  <span className="font-semibold">o-LEE-beh-a</span>)
                </span>{" "}
                {tt(
                  lang,
                  "es un nombre femenino de origen latino, derivado de oliva, el olivo.",
                  "is a feminine name of Latin origin, derived from oliva, the olive."
                )}
              </p>

              <p
                className={cn(
                  "mt-4 text-[16px] sm:text-[17px] leading-relaxed",
                  inkSoft
                )}
              >
                {tt(
                  lang,
                  "El olivo simboliza paz, prosperidad, sabiduría y continuidad. Crece lento, se adapta, y perdura. Para nosotros, este significado no es simbólico — es estructural.",
                  "The olive tree symbolizes peace, prosperity, wisdom, and continuity. It grows slowly, adapts, and endures. For us, this meaning is not symbolic — it is structural."
                )}
              </p>

              <p
                className={cn(
                  "mt-4 text-[16px] sm:text-[17px] leading-relaxed",
                  inkSoft
                )}
              >
                {tt(
                  lang,
                  "Esta página reúne lo que es Olivea: valores, sistemas y decisiones. No como promesa, sino como práctica.",
                  "This page holds what Olivea is made of: values, systems, and decisions. Not as a promise, but as a practice."
                )}
              </p>

              {/* ✅ Sustainability spine highlight */}
              <motion.div
                className={cn(
                  "mt-6 w-full max-w-[82ch]",
                  "rounded-[22px]",
                  "bg-transparent",
                  "pl-5 sm:pl-6 py-2",
                  "border-l border-(--olivea-olive)/18"
                )}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
              >
                <div className="text-[11px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-60">
                  {tt(lang, "Principio rector", "Guiding principle")}
                </div>
              
                <p
                  className={cn(
                    "mt-2 text-[16px] sm:text-[17px] leading-[1.9]",
                    "text-(--olivea-olive)"
                  )}
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <span className="font-semibold">{sustainabilitySpine}</span>
                </p>
                
                <div className="mt-2 text-[12px] text-(--olivea-olive) opacity-55">
                  {tt(
                    lang,
                    "Presente en cada decisión, no solo en un capítulo.",
                    "Present in every decision, not confined to a single chapter."
                  )}
                </div>
              </motion.div>

              <div className="mt-7">
                <SignalsRow items={heroSignals} />
              </div>

              {/* ✅ subtle cue so users instantly know there is more */}
              <motion.div
                className="mt-10 flex items-center gap-3 text-(--olivea-olive) opacity-55"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
              >
                <span className="text-[12px] uppercase tracking-[0.34em]">
                  {tt(lang, "Desliza para leer", "Scroll to read")}
                </span>
                <span className="h-px flex-1 bg-(--olivea-olive)/20" />
              </motion.div>
            </motion.header>

            {/* CHAPTERS */}
            <div className="relative z-10 mt-18 sm:mt-20 space-y-20 sm:space-y-24">
              {/* ✅ ONE moving card (desktop only) */}
              <div className="hidden lg:block">
                <FloatingPracticesCardGSAP lang={lang} sections={sections} />
              </div>

              {sections.map((s, idx) => (
                <motion.section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-32"
                  variants={chapterV}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                >
                  {/* Header */}
                  <motion.div variants={headerV} className="max-w-[92ch]">
                    <div className="flex items-center gap-3">
                      <div className="text-[12px] uppercase tracking-[0.30em] text-(--olivea-olive) opacity-70">
                        {tt(lang, "Capítulo", "Chapter")}{" "}
                        <span className="tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-linear-to-r from-(--olivea-olive)/20 to-transparent" />
                    </div>

                    {/* ✅ Switch marker lives directly under the chapter # row (desktop only) */}
                    <div
                      data-practices-switch
                      data-section-id={s.id}
                      className="hidden lg:block h-px w-full opacity-0"
                      aria-hidden="true"
                    />

                    {/* ✅ Mobile practices (inline) */}
                    <MobilePractices
                      title={tt(lang, "Prácticas", "Practices")}
                      items={s.practices}
                    />

                    <h2
                      className="mt-4 text-[32px] sm:text-[36px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {s.title}
                    </h2>

                    {s.subtitle ? (
                      <p
                        className={cn(
                          "mt-2 text-[16px] leading-relaxed",
                          inkSoft
                        )}
                      >
                        {s.subtitle}
                      </p>
                    ) : null}

                    {s.signals?.length ? (
                      <div className="mt-4">
                        <SignalsRow items={s.signals} />
                      </div>
                    ) : null}
                  </motion.div>

                  {/* Body + right rail */}
                  <motion.div
                    variants={bodyV}
                    initial="hidden"
                    whileInView="show"
                    viewport={VIEWPORT}
                    className="mt-8 grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-12 items-start"
                  >
                    {/* Body */}
                    <div className="space-y-6">
                      {paragraphs(s.body).map((p, i) => (
                        <motion.p
                          key={i}
                          variants={pV}
                          className={cn(
                            "text-[16px] sm:text-[17px] leading-[1.9]",
                            inkSoft,
                            "max-w-[92ch]"
                          )}
                        >
                          {linkifyNames(p, lang)}
                        </motion.p>
                      ))}
                    </div>

                    {/* Right rail: invisible anchor (desktop only) */}
                    <motion.div
                      variants={moduleV}
                      className="space-y-6 hidden lg:block"
                    >
                      <div data-practices-anchor className="invisible">
                        <PracticesCard
                          title={tt(lang, "Prácticas", "Practices")}
                          items={s.practices}
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <div className="mt-14 h-px bg-linear-to-r from-transparent via-(--olivea-olive)/14 to-transparent" />
                </motion.section>
              ))}
            </div>

            {/* Closing */}
            <motion.section
              className="relative z-10 mt-22 sm:mt-24 max-w-[82ch]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: reduce ? 0.1 : 0.7, ease: EASE }}
            >
              <h3
                className="text-[26px] sm:text-[28px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {tt(lang, "Un sistema vivo", "A living system")}
              </h3>

              <p
                className={cn(
                  "mt-4 text-[16px] sm:text-[17px] leading-relaxed",
                  inkSoft
                )}
              >
                {tt(
                  lang,
                  "Olivea no está terminada. Las ideas fluyen, las preguntas aparecen, y con este equipo no hay límites, solo dirección. Medimos, reflexionamos, mejoramos. Y seguimos.",
                  "Olivea is not finished. Ideas keep flowing, questions keep appearing, and with this team there are no limits, only direction. We measure, reflect, improve. And we keep going."
                )}
              </p>
            </motion.section>
          </div>
        </div>
      </section>
    </main>
  );
}
