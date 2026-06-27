"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { NavigationProvider } from "@/contexts/NavigationContext";
import MobileSectionNav from "@/components/navigation/MobileSectionNav";

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

export default function InnovationClient({ lang }: { lang: "en" | "es" }) {
  const t = (es: string, en: string) => (lang === "es" ? es : en);

  const navSections = [
    { id: "craft", label: t("El oficio", "The craft") },
    { id: "technology", label: t("La tecnología", "Technology") },
    { id: "method", label: t("El método", "The method") },
  ];

  const craft: { n: string; title: string; line: string }[] = [
    {
      n: "01",
      title: t("Salsa de soya", "Soy sauce"),
      line: t(
        "Fermentada en casa durante meses. Hace años que no compramos una botella.",
        "Fermented in-house over months. We haven't bought a bottle in years.",
      ),
    },
    {
      n: "02",
      title: t("Curados y preservados", "Aged & preserved"),
      line: t(
        "La cosecha detenida en su punto, para que la temporada nunca termine.",
        "The harvest held at its peak, so the season never fully ends.",
      ),
    },
    {
      n: "03",
      title: t("La carta líquida", "The liquid menu"),
      line: t(
        "Compuesta con el mismo rigor que el plato.",
        "Composed with the same rigor as the plate.",
      ),
    },
    {
      n: "04",
      title: t("Fermentación", "Fermentation"),
      line: t(
        "Una investigación constante: registrada, probada, corregida.",
        "An ongoing investigation: logged, tasted, corrected.",
      ),
    },
    {
      n: "05",
      title: t("La tierra", "The land"),
      line: t(
        "Recorrida a diario. No se toma nada que no se comprenda.",
        "Walked daily. Nothing is taken that isn't understood.",
      ),
    },
  ];

  const quiet: string[] = [
    t("Agendas y los libros", "Scheduling & the books"),
    t("Inventario y abasto", "Inventory & supply"),
    t("Reservaciones", "Reservations"),
    t("La carta viva, sincronizada", "The living menu, in sync"),
  ];

  return (
    <NavigationProvider>
      <main className="relative w-full overflow-clip px-6 sm:px-10 md:px-12 pt-24 sm:pt-32 pb-40 sm:pb-32">
        <div className="mx-auto max-w-[1100px]">
          {/* ───────── HERO ───────── */}
          <motion.header initial="hidden" animate="show" variants={stagger} className="max-w-[60ch]">
            <motion.div variants={fadeUp} className={EYEBROW}>
              {t("Innovación", "Innovation")}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-4 text-[clamp(2.4rem,1.5rem_+_3.8vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("Donde el arte encuentra la tecnología", "Where art meets technology")}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-[17px] sm:text-[19px] leading-relaxed">
              {t(
                "Nada de esto es decoración. El trabajo detrás del plato se sostiene con el mismo rigor que el plato mismo — el oficio sigue siendo humano, la tecnología permanece en silencio, y cada uno protege el tiempo del otro.",
                "None of this is decoration. The work behind the plate is held to the same standard as the plate itself — the craft kept human, the technology kept quiet, each protecting the other's time.",
              )}
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
              <div className={EYEBROW}>{t("El oficio", "The craft")}</div>
              <h2
                className="mt-2 text-[clamp(1.7rem,1.3rem_+_1.4vw,2.2rem)] font-semibold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t("El laboratorio", "The laboratory")}
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)/85">
                {t(
                  "Todo aquí se hace, no se compra — y nada se hace a la ligera.",
                  "Everything here is made, not bought — and nothing is made casually.",
                )}
              </p>
              <ul className="mt-7 space-y-5">
                {craft.map(({ n, title, line }) => (
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
              <div className={EYEBROW}>{t("La tecnología", "The technology")}</div>
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
                {t(
                  "Junto al laboratorio, invisible, el estudio que absorbe el trabajo que ningún oficio debería cargar.",
                  "Beside the laboratory, unseen, the studio that absorbs the work no craft should carry.",
                )}
              </p>
              <ul className="mt-6 space-y-3">
                {quiet.map((label) => (
                  <li key={label} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 text-(--olivea-olive)/40">—</span>
                    <span className="text-[15px] sm:text-[16px] leading-snug">{label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href={`/${lang}/roseiies`}
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-(--olivea-olive) text-white text-[12px] uppercase tracking-[0.26em] shadow-[0_14px_30px_-18px_rgba(40,60,35,0.6)] hover:opacity-95 transition"
                >
                  {t("Construido con roseiies", "Built with roseiies")}
                </Link>
                <a
                  href="https://roseiies.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white/55 ring-1 ring-(--olivea-olive)/25 text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) hover:bg-white/80 transition"
                >
                  {t("Conoce roseiies", "Visit roseiies")}
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
            {t("Ninguno se apodera del otro.", "Neither takes over the other.")}
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
                {t("El método", "The method")}
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="mt-5 text-[clamp(1.35rem,1.1rem_+_1.3vw,2rem)] leading-[1.32]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(
                  "roseiies absorbe la fricción — y el laboratorio conserva lo único de lo que un oficio no puede prescindir: tiempo, y atención sin reservas.",
                  "roseiies absorbs the friction — and the laboratory keeps the one thing a craft cannot do without: time, and undivided attention.",
                )}
              </motion.p>
              <motion.p
                variants={fadeUp}
                className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)/90"
              >
                {t(
                  "Lo que la cocina aprende, la tecnología lo recuerda. Lo que la tecnología resuelve, la cocina nunca tiene que cargarlo.",
                  "What the kitchen learns, the technology remembers. What the technology handles, the kitchen never has to.",
                )}
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
              {t(
                "El mismo rigor recorre toda la propiedad.",
                "The same standard runs through the whole property.",
              )}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] uppercase tracking-[0.18em]">
              <Link
                href={`/${lang}/farmtotable`}
                className="underline decoration-(--olivea-olive)/35 underline-offset-4 hover:decoration-(--olivea-olive) transition"
              >
                {t("La mesa", "The table")}
              </Link>
              <Link
                href={`/${lang}/sustainability`}
                className="underline decoration-(--olivea-olive)/35 underline-offset-4 hover:decoration-(--olivea-olive) transition"
              >
                {t("Nuestra filosofía", "Our philosophy")}
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
