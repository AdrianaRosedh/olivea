// app/(main)/[lang]/press/PressClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import PressDockLeft from "./PressDockLeft";
import type { Identity, ItemKind, Lang, PressItem, PressManifest } from "./pressTypes";

import YearTabs from "./components/YearTabs";
import ItemCard from "./components/ItemCard";

import { usePressFilters } from "./hooks/usePressFilters";
import { usePressSections } from "./hooks/usePressSections";
import { tt } from "./lib/pressText";

import PressKitHero from "./PressKitHero";
import PressMediaGallery from "./PressMediaGallery";

/* ---------------- motion ---------------- */
const sectionStaggerV: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.02,
    },
  },
};

const CARD_VIEWPORT = {
  once: true,
  amount: 0.22,
  margin: "0px 0px -18% 0px",
} as const;

export default function PressClient({
  lang,
  items,
  manifest,
}: {
  lang: Lang;
  items: PressItem[];
  manifest: PressManifest;
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<ItemKind>("all");
  const [identity, setIdentity] = useState<Identity>("all");
  const [year, setYear] = useState<number | "all">("all");

  const filteredBase = usePressFilters({ items, kind, identity, year, q });

  const {
    featured,
    awardsYears,
    mentionsYears,
    awardsYearTab,
    setAwardsYearTab,
    mentionsYearTab,
    setMentionsYearTab,
    awardsShown,
    mentionsShown,
    __debug,
  } = usePressSections(filteredBase);

  const count = filteredBase.length;

  // Layout geometry
  const FULL_BLEED =
    "w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]";
  const PAGE_PAD = "px-6 sm:px-10 md:px-12 lg:px-12";
  const RAIL = "max-w-[1400px]";

  return (
    <main id="top" className="w-full pt-0 pb-36 sm:pb-24">
      <PressDockLeft
        lang={lang}
        items={items}
        kind={kind}
        setKind={setKind}
        identity={identity}
        setIdentity={setIdentity}
        year={year}
        setYear={setYear}
        q={q}
        setQ={setQ}
        count={count}
      />

      <section className="mt-0 sm:mt-2">
        <div className={FULL_BLEED}>
          <div className={PAGE_PAD}>
            <div
              className={cn(
                `${RAIL} mx-auto`,
                "md:ml-(--press-dock-left,20rem)",
                "transition-[margin-left] duration-300 ease-out",
                "md:mr-(--dock-right)",
                "pr-2 sm:pr-0"
              )}
            >
              {/* Featured / Most recent */}
              <div className="mt-6 sm:mt-10">
                <div className="text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) opacity-75">
                  {tt(lang, "Más reciente", "Most recent")}
                </div>

                {featured ? (
                  <motion.div
                    className="mt-4 w-full"
                    variants={sectionStaggerV}
                    initial="hidden"
                    whileInView="show"
                    viewport={CARD_VIEWPORT}
                  >
                    <ItemCard lang={lang} it={featured} index={0} />
                  </motion.div>
                ) : (
                  <div className="mt-4 text-(--olivea-clay) opacity-85">
                    {tt(lang, "Aún no hay elementos.", "No items yet.")}
                  </div>
                )}
              </div>

              {/* Awards */}
              <section id="awards" className="mt-12 sm:mt-14">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2
                    className="text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {tt(lang, "Reconocimientos", "Awards & Recognition")}
                  </h2>

                  <YearTabs
                    lang={lang}
                    years={awardsYears}
                    value={awardsYearTab}
                    onChange={setAwardsYearTab}
                  />
                </div>

                {process.env.NODE_ENV === "development" ? (
                  <div className="mt-3 rounded-2xl bg-white/35 ring-1 ring-(--olivea-olive)/14 px-4 py-3 text-[12px] text-(--olivea-olive)">
                    <div className="font-medium">DEBUG (awardsAll)</div>
                    <div className="mt-2 font-mono whitespace-pre-wrap wrap-break-words">
                      {(__debug?.awardsAll ?? [])
                        .map(
                          (x: PressItem) =>
                            `${x.id} • ${x.publishedAt} • ${x.for} • pinned=${String(
                              x.starred
                            )}`
                        )
                        .join("\n")}
                    </div>
                  </div>
                ) : null}

                <motion.div
                  key={`awards-${awardsYearTab}`}
                  className="mt-6 sm:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10"
                  variants={sectionStaggerV}
                  initial="hidden"
                  animate="show"
                >
                  {awardsShown.map((it, idx) => (
                    <ItemCard key={it.id} lang={lang} it={it} index={idx} />
                  ))}
                </motion.div>
              </section>

              {/* Mentions */}
              <section id="mentions" className="mt-12 sm:mt-14">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2
                    className="text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {tt(lang, "Menciones en Prensa", "Press Mentions")}
                  </h2>

                  <YearTabs
                    lang={lang}
                    years={mentionsYears}
                    value={mentionsYearTab}
                    onChange={setMentionsYearTab}
                  />
                </div>

                <motion.div
                  key={`mentions-${mentionsYearTab}`}
                  className="mt-6 sm:mt-8 flex flex-col gap-6 sm:gap-10"
                  variants={sectionStaggerV}
                  initial="hidden"
                  animate="show"
                >
                  {mentionsShown.map((it, idx) => (
                    <ItemCard key={it.id} lang={lang} it={it} index={idx} />
                  ))}
                </motion.div>
              </section>

              {/* ✅ Press Kit + Media Library moved to bottom */}
              <PressKitHero lang={lang} manifest={manifest} />
              <PressMediaGallery lang={lang} manifest={manifest} />

              {/* Contact */}
              <section id="contact" className="mt-12 sm:mt-14">
                <div className="rounded-3xl border border-(--olivea-olive)/12 bg-white/40 shadow-[0_16px_40px_rgba(40,60,35,0.10)] p-7 sm:p-10">
                  <div className="text-[12px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-75">
                    {tt(lang, "Contacto", "Contact")}
                  </div>

                  <h2
                    className="mt-2 text-[24px] sm:text-[26px] md:text-[30px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {tt(lang, "Medios & PR", "Media & PR")}
                  </h2>

                  <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-(--olivea-clay) opacity-95 max-w-[78ch]">
                    {tt(
                      lang,
                      "Para entrevistas, historias o solicitudes de prensa:",
                      "For interviews, stories, or press requests:"
                    )}
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <a
                      href={`mailto:${manifest.contactEmail}`}
                      className={cn(
                        "inline-flex items-center justify-center gap-2",
                        "rounded-2xl px-5 py-3",
                        "bg-(--olivea-olive) text-(--olivea-cream)",
                        "ring-1 ring-black/10 transition hover:brightness-[1.03]"
                      )}
                    >
                      <span className="text-sm font-medium">{manifest.contactEmail}</span>
                      <span className="opacity-90">↗</span>
                    </a>

                    <Link
                      href={`/${lang}/contact`}
                      className={cn(
                        "inline-flex items-center justify-center",
                        "rounded-2xl px-5 py-3",
                        "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                        "text-(--olivea-olive) hover:bg-white/40 transition"
                      )}
                    >
                      {tt(lang, "Página de contacto", "Contact page")}
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}