// app/(main)/[lang]/press/PressClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import PressDockLeft from "./PressDockLeft";
import type { Identity, ItemKind, Lang, PressItem } from "./pressTypes";
import { PR_EMAIL, PRESS_ASSETS } from "./pressData";
import { Pin } from "lucide-react";

/* ---------------- motion ---------------- */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Same “slow rise” feel as Team
const cardInV: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: EASE,
      delay: Math.min(0.9, i * 0.08),
    },
  }),
};

// Section-level stagger (Awards grid / Mentions stack)
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

/* ---------------- helpers ---------------- */
function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

function fmtDate(lang: Lang, iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function identityLabel(lang: Lang, x: Identity) {
  if (x === "all") return tt(lang, "Todos", "All");
  if (x === "olivea") return "Olivea";
  if (x === "hotel") return tt(lang, "Hotel", "Hotel");
  if (x === "restaurant") return tt(lang, "Restaurante", "Restaurant");
  return tt(lang, "Café", "Café");
}

function yearOf(iso: string): number {
  const y = Number(iso.slice(0, 4));
  return Number.isFinite(y) ? y : 0;
}

function uniqYearsNewestFirst(items: PressItem[]): number[] {
  const ys = new Set<number>();
  for (const it of items) ys.add(yearOf(it.publishedAt));
  return Array.from(ys).filter(Boolean).sort((a, b) => b - a);
}

/* ---------------- sorting ---------------- */
function timeKey(iso: string): number {
  const d = new Date(`${iso}T00:00:00Z`);
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortNewestFirst(a: PressItem, b: PressItem): number {
  const bt = timeKey(b.publishedAt);
  const at = timeKey(a.publishedAt);
  if (bt !== at) return bt - at;

  // deterministic tie-breakers
  if (a.kind !== b.kind) return a.kind === "award" ? -1 : 1;
  const issuerCmp = (a.issuer || "").localeCompare(b.issuer || "");
  if (issuerCmp !== 0) return issuerCmp;
  return (a.title || "").localeCompare(b.title || "");
}

function isPinnedAward(it: PressItem): boolean {
  return it.kind === "award" && it.starred === true;
}

function sortPinnedAwardThenNewest(a: PressItem, b: PressItem): number {
  const aPinned = isPinnedAward(a);
  const bPinned = isPinnedAward(b);
  if (aPinned && !bPinned) return -1;
  if (!aPinned && bPinned) return 1;
  return sortNewestFirst(a, b);
}

/* ---------------- award badges (semantic) ---------------- */
const AWARD_BADGES: Array<{
  key: string;
  test: (it: PressItem) => boolean;
  label: (lang: Lang, it: PressItem) => string;
  src: string;
}> = [
  {
    key: "michelin-guide-hotel",
    test: (it) =>
      it.kind === "award" && it.for === "hotel" && /michelin/i.test(it.issuer),
    label: () => "MICHELIN Guide",
    src: "/images/press/awards/michelinGuide.svg",
  },
  {
    key: "michelin-star",
    test: (it) =>
      it.kind === "award" &&
      it.for === "restaurant" &&
      /michelin/i.test(it.issuer) &&
      (/star|estrella/i.test(it.title) ||
        (it.tags ?? []).some((t) => /star|estrella/i.test(t))),
    label: (lang) => (lang === "es" ? "Estrella MICHELIN" : "MICHELIN Star"),
    src: "/images/press/awards/michelin.svg",
  },
  {
    key: "green-star",
    test: (it) =>
      it.kind === "award" &&
      it.for === "restaurant" &&
      (it.tags ?? []).some((t) =>
        /green\s*star|estrella\s*verde|verde/i.test(t)
      ),
    label: () => "Green Star",
    src: "/images/press/awards/michelin-green-star.svg",
  },
  {
    key: "mb100",
    test: (it) =>
      it.kind === "award" &&
      (/mb100/i.test(it.issuer) ||
        (it.tags ?? []).some((t) => /mb100/i.test(t))),
    label: () => "MB100",
    src: "/images/press/awards/MB100.svg",
  },
];

function getAwardBadges(it: PressItem, lang: Lang) {
  if (it.kind !== "award") return [];
  return AWARD_BADGES.filter((b) => b.test(it)).map((b) => ({
    key: b.key,
    src: b.src,
    label: b.label(lang, it),
  }));
}

/* ---------------- year tabs ---------------- */
function YearTabs({
  lang,
  years,
  value,
  onChange,
  align = "right",
}: {
  lang: Lang;
  years: number[];
  value: number;
  onChange: (y: number) => void;
  align?: "right" | "left";
}) {
  if (!years.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        align === "right" ? "justify-start sm:justify-end" : "justify-start"
      )}
      aria-label={tt(lang, "Filtrar por año", "Filter by year")}
    >
      {years.map((y) => {
        const active = y === value;
        return (
          <button
            key={y}
            type="button"
            onClick={() => onChange(y)}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2 text-[12px]",
              "ring-1 transition",
              active
                ? "bg-(--olivea-olive) text-(--olivea-cream) ring-black/10"
                : "bg-white/30 text-(--olivea-olive) ring-(--olivea-olive)/14 hover:bg-white/40"
            )}
          >
            <span className="tabular-nums">{y}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- card ---------------- */
function ItemCard({
  lang,
  it,
  index = 0,
}: {
  lang: Lang;
  it: PressItem;
  index?: number;
}) {
  const glass = cn(
    "rounded-3xl border border-(--olivea-olive)/12",
    "bg-white/62 sm:bg-white/56",
    "shadow-[0_12px_32px_rgba(40,60,35,0.10)] sm:shadow-[0_16px_40px_rgba(40,60,35,0.10)]"
  );

  const hasThumb = it.kind === "mention" && !!it.cover?.src;
  const awardBadges = it.kind === "award" ? getAwardBadges(it, lang) : [];
  const tagsTiny = (it.tags ?? []).slice(0, 2);
  const pinned = it.kind === "award" && it.starred === true;

  return (
    <motion.article
      variants={cardInV}
      custom={index}
      className={cn(glass, "overflow-hidden")}
      style={{ willChange: "transform, opacity" }}
    >
      <div
        className={cn(
          "p-5 sm:p-8",
          hasThumb ? "grid gap-5 lg:grid-cols-[260px_1fr]" : ""
        )}
      >
        {hasThumb ? (
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white/20 h-48 sm:h-55 lg:h-full">
            <Image
              src={it.cover!.src}
              alt={it.cover?.alt || it.title}
              fill
              sizes="(max-width: 1024px) 100vw, 260px"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/15 via-transparent to-transparent" />
          </div>
        ) : null}

        <div>
          <div className="relative">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2 text-[12px] text-(--olivea-olive) opacity-80 pr-14 sm:pr-24">
              <div className="flex items-center gap-2 min-w-0">
                <span className="tabular-nums whitespace-nowrap">
                  {fmtDate(lang, it.publishedAt)}
                </span>
                <span className="opacity-60">·</span>
                <span className="font-medium opacity-90 truncate">
                  {it.issuer}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white/30 ring-1 ring-(--olivea-olive)/12 px-3 py-1">
                  {identityLabel(lang, it.for)}
                </span>
                {it.section ? (
                  <span className="opacity-85">{it.section}</span>
                ) : null}
              </div>
            </div>

            {pinned ? (
              <span
                className={cn(
                  "absolute top-0 right-0",
                  "inline-flex items-center justify-center",
                  "h-8 w-8 rounded-full",
                  "bg-white/60 ring-1 ring-(--olivea-olive)/14",
                  "text-(--olivea-olive) backdrop-blur-[2px]"
                )}
                title={tt(lang, "Reconocimiento fijado", "Pinned award")}
                aria-label={tt(lang, "Reconocimiento fijado", "Pinned award")}
              >
                <Pin className="h-4 w-4 opacity-80" />
              </span>
            ) : null}
          </div>

          {it.kind === "award" && awardBadges.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {awardBadges.map((b) => (
                <span
                  key={b.key}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 ring-1 ring-black/10"
                >
                  <span className="relative h-4 w-4">
                    <Image
                      src={b.src}
                      alt={b.label}
                      fill
                      className="object-contain"
                    />
                  </span>
                  <span className="text-[12px] font-medium text-(--olivea-olive)">
                    {b.label}
                  </span>
                </span>
              ))}
            </div>
          ) : null}

          <h3
            className="mt-4 text-[20px] sm:text-[24px] font-medium leading-[1.18] tracking-[-0.02em] text-(--olivea-olive)"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {it.title}
          </h3>

          {it.blurb ? (
            <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.65] sm:leading-[1.75] text-(--olivea-clay) opacity-95 max-w-[80ch]">
              {it.blurb}
            </p>
          ) : null}

          {tagsTiny.length ? (
            <div className="mt-4 hidden sm:flex flex-wrap gap-2">
              {tagsTiny.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-3 py-1 rounded-full bg-white/18 ring-1 ring-(--olivea-olive)/12 text-(--olivea-olive) opacity-75"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) opacity-75">
                {tt(lang, "Fuentes", "Sources")}
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {it.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group inline-flex items-center justify-between gap-3",
                      "rounded-2xl px-4 py-3",
                      "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                      "hover:bg-white/40 transition"
                    )}
                  >
                    <span className="text-[14px] text-(--olivea-olive) opacity-90 group-hover:opacity-100">
                      {l.label}
                    </span>
                    <span className="text-(--olivea-olive) opacity-70">↗</span>
                  </a>
                ))}
              </div>
            </div>

            {it.kind === "award" && awardBadges.length ? (
              <div className="sm:pl-2">
                <div className="text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) opacity-75 sm:text-right">
                  {tt(lang, "Logos", "Logos")}
                </div>

                <div className="mt-3 flex justify-start sm:justify-end gap-2">
                  {awardBadges.map((b) => (
                    <a
                      key={`logo-${b.key}`}
                      href={it.links?.[0]?.href || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center justify-center",
                        "h-12 w-12 rounded-2xl",
                        "bg-white/35 ring-1 ring-(--olivea-olive)/14",
                        "hover:bg-white/45 transition"
                      )}
                      title={b.label}
                      aria-label={b.label}
                    >
                      <span className="relative h-6 w-6">
                        <Image
                          src={b.src}
                          alt={b.label}
                          fill
                          className="object-contain"
                        />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------------- page ---------------- */
export default function PressClient({
  lang,
  items,
}: {
  lang: Lang;
  items: PressItem[];
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<ItemKind>("all");
  const [identity, setIdentity] = useState<Identity>("all");
  const [year, setYear] = useState<number | "all">("all");

  // 1) Apply global filters from dock (NO sorting here)
  const filteredBase = useMemo(() => {
    const query = q.trim().toLowerCase();

    return items
      .filter((it) => (kind === "all" ? true : it.kind === kind))
      .filter((it) => (identity === "all" ? true : it.for === identity))
      .filter((it) => (year === "all" ? true : yearOf(it.publishedAt) === year))
      .filter((it) => {
        if (!query) return true;
        const hay = [
          it.title,
          it.issuer,
          it.section ?? "",
          it.blurb ?? "",
          ...(it.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
  }, [items, kind, identity, year, q]);

  // 2) Featured should always be the newest item overall
  const filteredNewest = useMemo(
    () => [...filteredBase].sort(sortNewestFirst),
    [filteredBase]
  );

  const featured = useMemo(
    () => (filteredNewest.length ? filteredNewest[0] : null),
    [filteredNewest]
  );

  // 3) Remove featured from lists
  const rest = useMemo(() => {
    if (!featured) return filteredNewest;
    return filteredNewest.filter((x) => x.id !== featured.id);
  }, [filteredNewest, featured]);

  const mentionsOnly = useMemo(
    () => rest.filter((x) => x.kind === "mention").sort(sortNewestFirst),
    [rest]
  );
  const awardsOnly = useMemo(
    () => rest.filter((x) => x.kind === "award").sort(sortPinnedAwardThenNewest),
    [rest]
  );

  // 4) Year tabs (per section)
  const awardsYears = useMemo(() => uniqYearsNewestFirst(awardsOnly), [awardsOnly]);
  const mentionsYears = useMemo(() => uniqYearsNewestFirst(mentionsOnly), [mentionsOnly]);

  const [awardsYearTab, setAwardsYearTab] = useState<number>(new Date().getFullYear());
  const [mentionsYearTab, setMentionsYearTab] = useState<number>(new Date().getFullYear());

  // Default to latest available year for each section
  useEffect(() => {
    if (!awardsYears.length) return;
    if (!awardsYears.includes(awardsYearTab)) setAwardsYearTab(awardsYears[0]);
  }, [awardsYears, awardsYearTab]);

  useEffect(() => {
    if (!mentionsYears.length) return;
    if (!mentionsYears.includes(mentionsYearTab)) setMentionsYearTab(mentionsYears[0]);
  }, [mentionsYears, mentionsYearTab]);

  const awardsShown = useMemo(() => {
    if (!awardsYears.length) return awardsOnly;
    return awardsOnly.filter((it) => yearOf(it.publishedAt) === awardsYearTab);
  }, [awardsOnly, awardsYears.length, awardsYearTab]);

  const mentionsShown = useMemo(() => {
    if (!mentionsYears.length) return mentionsOnly;
    return mentionsOnly.filter((it) => yearOf(it.publishedAt) === mentionsYearTab);
  }, [mentionsOnly, mentionsYears.length, mentionsYearTab]);

  const count = filteredBase.length;

  // Match Team geometry: FULL_BLEED + PAGE_PAD + RAIL
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
                "md:ml-80 xl:ml-85",
                "md:mr-(--dock-right)",
                "pr-2 sm:pr-0"
              )}
            >
              {/* Featured */}
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

                <motion.div
                  className="mt-6 sm:mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10"
                  variants={sectionStaggerV}
                  initial="hidden"
                  whileInView="show"
                  viewport={CARD_VIEWPORT}
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
                  className="mt-6 sm:mt-8 flex flex-col gap-6 sm:gap-10"
                  variants={sectionStaggerV}
                  initial="hidden"
                  whileInView="show"
                  viewport={CARD_VIEWPORT}
                >
                  {mentionsShown.map((it, idx) => (
                    <ItemCard key={it.id} lang={lang} it={it} index={idx} />
                  ))}
                </motion.div>
              </section>

              {/* Presskit */}
              <section id="presskit" className="mt-14 sm:mt-16">
                <div className="rounded-3xl border border-(--olivea-olive)/12 bg-white/50 shadow-[0_16px_40px_rgba(40,60,35,0.10)] overflow-hidden">
                  <div className="p-7 sm:p-10">
                    <div className="text-[12px] uppercase tracking-[0.34em] text-(--olivea-olive) opacity-75">
                      {tt(lang, "Recursos", "Assets")}
                    </div>

                    <h2
                      className="mt-2 text-[26px] sm:text-[28px] md:text-[32px] font-semibold tracking-[-0.02em] text-(--olivea-olive)"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      Press Kit
                    </h2>

                    <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-(--olivea-clay) opacity-95 max-w-[78ch]">
                      {tt(
                        lang,
                        "Descarga logos, fotografías, fact sheet y materiales oficiales en un solo lugar.",
                        "Download logos, photography, fact sheet, and official materials in one place."
                      )}
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <a
                        href={PRESS_ASSETS.presskit.href}
                        download
                        className={cn(
                          "inline-flex items-center justify-center gap-2",
                          "rounded-2xl px-5 py-3",
                          "bg-(--olivea-olive) text-(--olivea-cream)",
                          "ring-1 ring-black/10 transition hover:brightness-[1.03]"
                        )}
                      >
                        <span className="text-sm font-medium">
                          {tt(lang, "Descargar Press Kit", "Download Press Kit")}
                        </span>
                        <span className="opacity-90">↗</span>
                      </a>

                      <a
                        href={PRESS_ASSETS.logos.href}
                        download
                        className={cn(
                          "inline-flex items-center justify-center",
                          "rounded-2xl px-5 py-3",
                          "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                          "text-(--olivea-olive) hover:bg-white/40 transition"
                        )}
                      >
                        {tt(lang, "Logos", "Logos")}
                      </a>

                      <a
                        href={PRESS_ASSETS.photos.href}
                        download
                        className={cn(
                          "inline-flex items-center justify-center",
                          "rounded-2xl px-5 py-3",
                          "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                          "text-(--olivea-olive) hover:bg-white/40 transition"
                        )}
                      >
                        {tt(lang, "Fotos", "Photos")}
                      </a>

                      <a
                        href={PRESS_ASSETS.factsheet.href}
                        download
                        className={cn(
                          "inline-flex items-center justify-center",
                          "rounded-2xl px-5 py-3",
                          "bg-white/30 ring-1 ring-(--olivea-olive)/14",
                          "text-(--olivea-olive) hover:bg-white/40 transition"
                        )}
                      >
                        Fact Sheet
                      </a>
                    </div>
                  </div>
                </div>
              </section>

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
                      href={`mailto:${PR_EMAIL}`}
                      className={cn(
                        "inline-flex items-center justify-center gap-2",
                        "rounded-2xl px-5 py-3",
                        "bg-(--olivea-olive) text-(--olivea-cream)",
                        "ring-1 ring-black/10 transition hover:brightness-[1.03]"
                      )}
                    >
                      <span className="text-sm font-medium">{PR_EMAIL}</span>
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