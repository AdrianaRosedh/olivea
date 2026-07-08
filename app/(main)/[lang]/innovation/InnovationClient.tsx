"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { NavigationProvider } from "@/contexts/NavigationContext";
import MobileSectionNav from "@/components/navigation/MobileSectionNav";
import type { InnovationContent, Bilingual } from "@/lib/content/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

// lifted from the Philosophy page so this reads as the same brand
const EYEBROW = "text-[11px] uppercase tracking-[0.3em] text-(--olivea-olive)/70";
const PANEL =
  "rounded-2xl bg-white/45 ring-1 ring-(--olivea-olive)/12 shadow-[0_10px_24px_rgba(40,60,35,0.08)]";

export default function InnovationClient({
  lang,
  content,
}: {
  lang: "en" | "es";
  content: InnovationContent;
}) {
  // Content comes from the CMS (Supabase row, falling back to the static
  // seed in lib/content/data/innovation.ts) — edit it at /admin/content/innovation.
  const t = (b: Bilingual) => (lang === "es" ? b.es : b.en);

  const navSections = [
    { id: "craft", label: t(content.craft.eyebrow) },
    { id: "technology", label: t(content.technology.eyebrow) },
    { id: "method", label: t(content.method.eyebrow) },
  ];

  const craftItems = content.craft.items.map((item, i) => ({
    n: String(i + 1).padStart(2, "0"),
    title: t(item.title),
    line: t(item.line),
  }));

  return (
    <NavigationProvider>
      <main className="relative w-full overflow-clip px-6 sm:px-10 md:px-12 pt-24 sm:pt-32 pb-40 sm:pb-32">
        <div className="mx-auto max-w-[1100px]">
          {/* ───────── HERO ───────── */}
          <motion.header initial="hidden" animate="show" variants={stagger} className="max-w-[60ch]">
            <motion.div variants={fadeUp} className={EYEBROW}>
              {t(content.hero.eyebrow)}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-4 text-[clamp(2.4rem,1.5rem_+_3.8vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t(content.hero.headline)}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-[17px] sm:text-[19px] leading-relaxed">
              {t(content.hero.intro)}
            </motion.p>
          </motion.header>

          {/* ───────── TWO FORCES — laboratory + roseiies, side by side ───────── */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            variants={stagger}
            className="mt-16 sm:mt-24 grid gap-4 sm:gap-5 lg:grid-cols-2 lg:items-start"
          >
            {/* LEFT — the craft */}
            <motion.div
              variants={fadeUp}
              id="craft"
              className={`main-section scroll-mt-28 ${PANEL} p-7 sm:p-9`}
            >
              <div className={EYEBROW}>{t(content.craft.eyebrow)}</div>
              <h2
                className="mt-2 text-[clamp(1.7rem,1.3rem_+_1.4vw,2.2rem)] font-semibold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(content.craft.title)}
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)/85">
                {t(content.craft.intro)}
              </p>
              <ul className="mt-7 space-y-5">
                {craftItems.map(({ n, title, line }) => (
                  <li key={n} className="flex gap-4">
                    <span className="mt-1 text-[12px] tabular-nums tracking-[0.14em] text-(--olivea-olive)/45">
                      {n}
                    </span>
                    <div>
                      <h3
                        className="text-[17px] sm:text-[18px]"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {title}
                      </h3>
                      <p className="mt-1 text-[14px] sm:text-[15px] leading-relaxed text-(--olivea-olive)/80">
                        {line}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* RIGHT — roseiies */}
            <motion.div
              variants={fadeUp}
              id="technology"
              className={`main-section scroll-mt-28 ${PANEL} p-7 sm:p-9`}
            >
              <div className={EYEBROW}>{t(content.technology.eyebrow)}</div>
              {/* roseiies wordmark — masked in Olivea olive so the page stays one brand */}
              <span
                role="img"
                aria-label="roseiies"
                className="mt-2 inline-block bg-(--olivea-olive)"
                style={{
                  height: "1.9rem",
                  width: "8.66rem",
                  maskImage: "url(/images/roseiies-logo.svg)",
                  WebkitMaskImage: "url(/images/roseiies-logo.svg)",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskPosition: "left center",
                  WebkitMaskPosition: "left center",
                }}
              />
              <p className="mt-4 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)/85">
                {t(content.technology.intro)}
              </p>
              <ul className="mt-6 space-y-3">
                {content.technology.items.map((label, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 text-(--olivea-olive)/40">—</span>
                    <span className="text-[15px] sm:text-[16px] leading-snug">{t(label)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href={`/${lang}/roseiies`}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-(--olivea-olive) text-white text-[12px] uppercase tracking-[0.26em] shadow-[0_14px_30px_-18px_rgba(40,60,35,0.6)] hover:opacity-95 transition"
                >
                  {lang === "es" ? "Construido con roseiies" : "Built with roseiies"}
                </Link>
                <a
                  href="https://roseiies.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white/55 ring-1 ring-(--olivea-olive)/25 text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) hover:bg-white/80 transition"
                >
                  {lang === "es" ? "Conoce roseiies" : "Visit roseiies"}
                </a>
              </div>
            </motion.div>
          </motion.section>

          {/* the rule, stated plainly */}
          <motion.blockquote
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={fadeUp}
            className="mx-auto mt-16 sm:mt-20 max-w-[24ch] text-center text-[clamp(1.6rem,1.2rem_+_1.8vw,2.4rem)] leading-[1.2]"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            {t(content.quote)}
          </motion.blockquote>

          {/* ───────── THE METHOD ───────── */}
          <section id="method" className="main-section scroll-mt-28 mt-20 sm:mt-28">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={stagger}
              className="mx-auto max-w-[680px] text-center"
            >
              <motion.div variants={fadeUp} className={EYEBROW}>
                {t(content.method.eyebrow)}
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="mt-5 text-[clamp(1.35rem,1.1rem_+_1.3vw,2rem)] leading-[1.32]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(content.method.lead)}
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)/90"
              >
                {t(content.method.body)}
              </motion.p>
            </motion.div>
          </section>

          {/* ───────── CLOSE ───────── */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mt-20 sm:mt-28 flex flex-wrap items-center justify-between gap-4 border-t border-(--olivea-olive)/15 pt-8"
          >
            <p className="max-w-[46ch] text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)/90">
              {t(content.closing.line)}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] uppercase tracking-[0.18em]">
              <Link
                href={`/${lang}/farmtotable`}
                className="underline decoration-(--olivea-olive)/35 underline-offset-4 hover:decoration-(--olivea-olive) transition"
              >
                {lang === "es" ? "La mesa" : "The table"}
              </Link>
              <Link
                href={`/${lang}/sustainability`}
                className="underline decoration-(--olivea-olive)/35 underline-offset-4 hover:decoration-(--olivea-olive) transition"
              >
                {lang === "es" ? "Nuestra filosofía" : "Our philosophy"}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* mobile section bar — same control Philosophy + Team use */}
      <MobileSectionNav
        items={navSections}
        pageTitle={{ es: "Innovación", en: "Innovation" }}
        lang={lang}
        enableSubRow={false}
      />
    </NavigationProvider>
  );
}
