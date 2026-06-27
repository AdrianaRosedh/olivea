"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Droplet,
  Carrot,
  Martini,
  FlaskConical,
  Sprout,
  CalendarDays,
  Boxes,
  CalendarCheck,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

export default function InnovationClient({ lang }: { lang: "en" | "es" }) {
  const t = (es: string, en: string) => (lang === "es" ? es : en);
  const reduce = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  const glowA = useTransform(scrollY, [0, 900], [0, -160]);
  const glowB = useTransform(scrollY, [0, 900], [0, 120]);

  // The art — what only hands can do (Olivea's laboratory).
  const craft: { Icon: LucideIcon; title: string; line: string }[] = [
    { Icon: Droplet, title: t("Salsa de soya", "Soy sauce"), line: t("Fermentada en casa, desde el grano.", "Brewed in-house, from the bean up.") },
    { Icon: Carrot, title: t("Vegetales curados", "Aged & preserved"), line: t("La cosecha, guardada en el tiempo.", "The harvest, kept in time.") },
    { Icon: Martini, title: t("Carta líquida", "A liquid menu"), line: t("Diseñada a mano, trago a trago.", "Designed by hand, pour by pour.") },
    { Icon: FlaskConical, title: t("Fermentaciones", "Fermentations"), line: t("En investigación, siempre.", "Always under investigation.") },
    { Icon: Sprout, title: t("La tierra", "The land"), line: t("Recorrida por lo que ofrece.", "Foraged for what it offers.") },
  ];

  // The technology — the friction roseiies carries so the craft keeps its time.
  const quiet: { Icon: LucideIcon; label: string }[] = [
    { Icon: CalendarDays, label: t("Agendas y libros", "Scheduling & books") },
    { Icon: Boxes, label: t("Inventario", "Inventory") },
    { Icon: CalendarCheck, label: t("Reservaciones", "Reservations") },
    { Icon: RefreshCw, label: t("Carta viva, sincronizada", "Living menu, in sync") },
  ];

  const titleWords = t("Donde el arte encuentra la tecnología", "Where art meets technology").split(" ");

  return (
    <main className="relative w-full overflow-clip">
      {/* ═════════════ HERO ═════════════ */}
      <section className="relative px-6 sm:px-10 md:px-12 pt-28 sm:pt-36 pb-12">
        {/* animated ambient glows */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: glowA }}
          className="pointer-events-none absolute -top-24 left-[18%] -z-10 h-[540px] w-[540px] rounded-full"
        >
          <div
            className="h-full w-full rounded-full"
            style={{ background: "radial-gradient(circle, rgba(182,137,74,0.18), rgba(231,234,225,0) 66%)" }}
          />
        </motion.div>
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: glowB }}
          className="pointer-events-none absolute top-8 right-[12%] -z-10 h-[480px] w-[480px] rounded-full"
        >
          <div
            className="h-full w-full rounded-full"
            style={{ background: "radial-gradient(circle, rgba(94,118,88,0.13), rgba(231,234,225,0) 70%)" }}
          />
        </motion.div>

        <div className="mx-auto max-w-[1080px]">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div
              variants={fadeUp}
              className="text-[12px] uppercase tracking-[0.4em] text-(--olivea-honey)"
            >
              {t("Innovación", "Innovation")}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-5 max-w-[20ch] text-[clamp(2.7rem,1.5rem_+_4.6vw,5rem)] font-semibold leading-[0.98] tracking-[-0.025em] text-(--olivea-forest)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {titleWords.map((w, i) => {
                const accent = /^(art|arte|technology|tecnología)$/i.test(w);
                return (
                  <span key={`${w}-${i}`}>
                    <span className={accent ? "italic text-(--olivea-honey)" : undefined}>{w}</span>
                    {i < titleWords.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-[58ch] text-[17px] sm:text-[20px] leading-relaxed text-(--olivea-olive)"
            >
              {t(
                "Una sola regla: ninguno se apodera del otro. El oficio sigue siendo humano. La tecnología permanece en silencio. Cada uno existe para dejarle espacio al otro.",
                "One rule: neither takes over the other. The craft stays human. The technology stays quiet. Each exists to make room for the other.",
              )}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═════════════ THE ART — laboratory cards ═════════════ */}
      <section className="relative px-6 sm:px-10 md:px-12 py-14 sm:py-20">
        <div className="mx-auto max-w-[1080px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3"
          >
            <div>
              <div className="text-[12px] uppercase tracking-[0.32em] text-(--olivea-honey)">
                {t("El arte", "The art")}
              </div>
              <h2
                className="mt-2 text-[clamp(2rem,1.4rem_+_2.4vw,3rem)] font-semibold tracking-[-0.02em] text-(--olivea-forest)"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t("El laboratorio", "The laboratory")}
              </h2>
            </div>
            <p className="max-w-[34ch] text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)/90">
              {t("Por un pasillo, lo que solo las manos pueden hacer.", "Down one hall — what only hands can do.")}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            variants={stagger}
            className="mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {craft.map(({ Icon, title, line }) => (
              <motion.article
                key={title}
                variants={fadeUp}
                whileHover={reduce ? undefined : { y: -6, transition: { type: "spring", stiffness: 280, damping: 20 } }}
                className="group relative overflow-hidden rounded-[28px] bg-(--olivea-ivory)/60 ring-1 ring-(--olivea-olive)/10 p-7 sm:p-8 transition-shadow duration-300 hover:shadow-[0_36px_70px_-34px_rgba(40,40,30,0.45)] hover:ring-(--olivea-honey)/30"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(182,137,74,0.20), rgba(182,137,74,0) 70%)" }}
                />
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-(--olivea-honey)/12 text-(--olivea-honey) ring-1 ring-(--olivea-honey)/20 transition-colors duration-300 group-hover:bg-(--olivea-honey)/20">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3
                  className="mt-6 text-[22px] sm:text-[24px] text-(--olivea-forest)"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {title}
                </h3>
                <p className="mt-2 text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)">
                  {line}
                </p>
              </motion.article>
            ))}

            {/* thesis tile — fills the 6th cell */}
            <motion.div
              variants={fadeUp}
              className="relative grid place-items-center overflow-hidden rounded-[28px] bg-(--olivea-forest) p-8 text-center"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{ background: "radial-gradient(120% 90% at 80% 0%, rgba(182,137,74,0.22), rgba(51,66,46,0) 60%)" }}
              />
              <p
                className="relative text-[19px] sm:text-[21px] leading-snug text-(--olivea-ivory)"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {t("Ninguno se apodera del otro.", "Neither takes over the other.")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═════════════ THE TECHNOLOGY — the quiet layer ═════════════ */}
      <section className="relative px-6 sm:px-10 md:px-12 py-4">
        <div className="mx-auto max-w-[1080px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="relative overflow-hidden rounded-[32px] bg-(--olivea-ivory)/45 ring-1 ring-(--olivea-honey)/20 px-7 py-10 sm:px-12 sm:py-14"
          >
            <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <div className="text-[12px] uppercase tracking-[0.32em] text-(--olivea-honey)">
                  {t("La tecnología", "The technology")}
                </div>
                {/* roseiies wordmark — the studio's main logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/roseiies-logo.svg" alt="roseiies" className="mt-3 h-8 sm:h-9 w-auto" />
                <p className="mt-5 max-w-[42ch] text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)">
                  {t(
                    "Justo al lado, en silencio, roseiies. Carga con todo lo que no debería robarle tiempo al oficio.",
                    "Right beside it, quietly, roseiies. It carries everything that shouldn't steal time from the craft.",
                  )}
                </p>
              </div>
              <motion.ul
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
                className="grid gap-3 sm:grid-cols-2"
              >
                {quiet.map(({ Icon, label }) => (
                  <motion.li
                    key={label}
                    variants={fadeUp}
                    className="flex items-center gap-3 rounded-2xl bg-white/55 ring-1 ring-(--olivea-olive)/10 px-4 py-3.5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-(--olivea-olive)/10 text-(--olivea-olive)">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </span>
                    <span className="text-[14px] sm:text-[15px] leading-snug text-(--olivea-olive)">
                      {label}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═════════════ HOW THEY DO IT ═════════════ */}
      <section className="relative px-6 sm:px-10 md:px-12 py-16 sm:py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-[12px] uppercase tracking-[0.32em] text-(--olivea-honey)">
              {t("Cómo lo hacen", "How they do it")}
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-[clamp(1.4rem,1.1rem_+_1.5vw,2.1rem)] leading-[1.3] text-(--olivea-forest)"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t(
                "roseiies absorbe la fricción — y el laboratorio recupera lo único que el oficio necesita: tiempo y atención.",
                "roseiies absorbs the friction — and the laboratory gets back the one thing craft needs: time and attention.",
              )}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-(--olivea-olive)">
              {t(
                "Lo que la cocina aprende, la tecnología lo recuerda.",
                "What the kitchen learns, the technology remembers.",
              )}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${lang}/roseiies`}
                className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 bg-(--olivea-olive) text-white text-[12px] uppercase tracking-[0.28em] shadow-[0_18px_38px_-20px_rgba(0,0,0,0.5)] hover:opacity-95 transition"
              >
                {t("Construido con roseiies", "Built with roseiies")}
              </Link>
              <a
                href="https://roseiies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 bg-white/60 ring-1 ring-(--olivea-honey)/30 text-[12px] uppercase tracking-[0.28em] text-(--olivea-honey) hover:bg-white/80 transition"
              >
                {t("Conoce roseiies", "Visit roseiies")}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═════════════ CLOSE ═════════════ */}
      <section className="relative px-6 sm:px-10 md:px-12 pb-40 sm:pb-32">
        <div className="mx-auto max-w-[1080px]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-4 border-t border-(--olivea-honey)/20 pt-8"
          >
            <p className="max-w-[46ch] text-[15px] sm:text-[16px] leading-relaxed text-(--olivea-olive)">
              {t(
                "El mismo equilibrio recorre toda la propiedad.",
                "The same balance runs through the whole property.",
              )}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] uppercase tracking-[0.18em]">
              <Link
                href={`/${lang}/farmtotable`}
                className="text-(--olivea-forest) underline decoration-(--olivea-honey)/40 underline-offset-4 hover:decoration-(--olivea-honey) transition"
              >
                {t("La mesa", "The table")}
              </Link>
              <Link
                href={`/${lang}/sustainability`}
                className="text-(--olivea-forest) underline decoration-(--olivea-honey)/40 underline-offset-4 hover:decoration-(--olivea-honey) transition"
              >
                {t("Nuestra filosofía", "Our philosophy")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
