// app/(main)/[lang]/journal/JournalClient.tsx
"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "../dictionaries";
import JournalFilterDock from "./JournalFilterDock";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* =================== types =================== */
type Post = {
  lang: "es" | "en";
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  pillar: string;
  tags?: string[];
  readingMinutes: number;
  cover?: { src: string; alt: string };
};

/* =============== helpers (pure) =============== */
function hash32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function tt(lang: Lang, es: string, en: string) {
  return lang === "es" ? es : en;
}

/* =================== motion =================== */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Same “slow rise” feel as Team/Press
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

// Section-level stagger container
const sectionStaggerV: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.02,
    },
  },
};

const VIEWPORT = {
  once: true,
  amount: 0.22,
  margin: "0px 0px -18% 0px",
} as const;

const MotionLink = motion(Link);

export default function JournalClient({
  lang,
  posts,
}: {
  lang: Lang;
  title: string;
  subtitle: string;
  posts: Post[];
}) {
  const reduce = useReducedMotion();

  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");

  const rafRef = useRef<number | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return posts.filter((p) => {
      const matchQ =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(query)) ||
        String(p.pillar).toLowerCase().includes(query);

      const matchPillar = pillar === "all" || p.pillar === pillar;
      const matchTag = tag === "all" || (p.tags ?? []).includes(tag);

      return matchQ && matchPillar && matchTag;
    });
  }, [posts, q, pillar, tag]);

  const clear = () => {
    setQ("");
    setPillar("all");
    setTag("all");
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const { featured, rest } = useMemo(() => {
    if (!filtered.length)
      return { featured: null as Post | null, rest: [] as Post[] };

    const seed = `${dayKey()}-${lang}-${pillar}-${tag}-${q
      .trim()
      .toLowerCase()}`;
    const idx = hash32(seed) % filtered.length;
    const feat = filtered[idx];
    const remainder = filtered.filter((_, i) => i !== idx);

    return { featured: feat, rest: remainder };
  }, [filtered, lang, pillar, tag, q]);

  const canHover = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false
    );
  }, []);

  const startProgress = (el: HTMLElement) => {
    if (!canHover()) return;
    const bar = el.querySelector<HTMLElement>("[data-progress]");
    if (!bar) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const durationMs = 650;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      bar.style.transform = `scaleX(${t})`;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const resetProgress = (el: HTMLElement) => {
    if (!canHover()) return;
    const bar = el.querySelector<HTMLElement>("[data-progress]");
    if (!bar) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    bar.style.transform = "scaleX(0)";
  };

  const onEnter = (e: React.MouseEvent<HTMLElement>) =>
    startProgress(e.currentTarget);
  const onLeave = (e: React.MouseEvent<HTMLElement>) =>
    resetProgress(e.currentTarget);

  // Ensure RAF is cleaned up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <main id="top" className="w-full pt-0 sm:pt-10 pb-24">
      <JournalFilterDock
        lang={lang}
        posts={posts}
        q={q}
        setQ={setQ}
        pillar={pillar}
        setPillar={setPillar}
        tag={tag}
        setTag={setTag}
        onClear={clear}
        count={filtered.length}
      />

      <section
        className={cn(
          "px-3 sm:px-8 md:px-10 2xl:px-12",
          "lg:ml-86",
          "md:mr-(--dock-right)"
        )}
      >
        {featured ? (
          <section id="featured" className="mt-6 sm:mt-0">
            <div className="text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) opacity-75">
              {tt(lang, "Destacado", "Featured")}
            </div>

            {/* Scroll-triggered + slow-rise, not autoplay on mount */}
            <motion.div
              className="mt-4"
              variants={sectionStaggerV}
              initial={reduce ? false : "hidden"}
              whileInView="show"
              viewport={VIEWPORT}
            >
              <motion.div
                variants={cardInV}
                custom={0}
                style={{ willChange: "transform, opacity" }}
              >
                <MotionLink
                  href={`/${lang}/journal/${featured.slug}`}
                  className={cn(
                    "group block overflow-hidden rounded-3xl",
                    "border border-(--olivea-olive)/14 bg-white/60",
                    "shadow-[0_16px_40px_rgba(40,60,35,0.10)]",
                    // keep hover transitions on the link (fine)
                    "transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(40,60,35,0.14)]"
                  )}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative h-56 sm:h-72 lg:h-full bg-(--olivea-cream)/40">
                      {featured.cover?.src ? (
                        <>
                          <Image
                            src={featured.cover.src}
                            alt={featured.cover.alt || featured.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className="object-cover transition duration-700 group-hover:scale-[1.02]"
                            priority
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/12 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                        </>
                      ) : (
                        <div className="h-full w-full bg-linear-to-br from-white/70 to-(--olivea-cream)/35" />
                      )}
                    </div>

                    <div className="p-5 sm:p-7 lg:p-10">
                      <div className="flex flex-col gap-2 text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) opacity-80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{featured.pillar}</span>
                          <span className="opacity-60">·</span>
                          <span className="whitespace-nowrap">
                            {fmtDate(featured.publishedAt)}
                          </span>
                          <span className="opacity-60">·</span>
                          <span className="whitespace-nowrap">
                            {featured.readingMinutes} min
                          </span>
                        </div>
                      </div>

                      <h2 className="mt-3 text-[22px] sm:text-[26px] md:text-[28px] font-medium leading-[1.16] tracking-[-0.02em] text-(--olivea-olive)">
                        {featured.title}
                      </h2>

                      <p className="mt-3 text-[14px] sm:text-[16px] leading-[1.65] sm:leading-[1.75] text-(--olivea-clay) opacity-95 line-clamp-4">
                        {featured.excerpt}
                      </p>

                      {!!featured.tags?.length ? (
                        <div className="mt-6 hidden sm:flex flex-wrap gap-2">
                          {featured.tags.slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className={cn(
                                "text-[12px] px-3 py-1.5 rounded-full",
                                "bg-(--olivea-cream)/70 border border-(--olivea-olive)/18",
                                "text-(--olivea-olive) opacity-90"
                              )}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-6 h-0.5 w-full bg-(--olivea-olive)/10 overflow-hidden rounded-full">
                        <div
                          data-progress
                          className="h-full w-full origin-left bg-(--olivea-olive)/30"
                          style={{ transform: "scaleX(0)" }}
                        />
                      </div>
                    </div>
                  </div>
                </MotionLink>
              </motion.div>
            </motion.div>
          </section>
        ) : null}

        <section id="posts" className="mt-8 sm:mt-10">
          {/* Section-level stagger so it feels like Team/Press */}
          <motion.div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[repeat(3,minmax(360px,1fr))] gap-6 sm:gap-10"
            )}
            style={{ gridAutoRows: "1fr" }}
            variants={sectionStaggerV}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={VIEWPORT}
          >
            {rest.map((p, i) => {
              const prettyDate = fmtDate(p.publishedAt);

              return (
                <motion.div
                  key={`${p.lang}:${p.slug}`}
                  className="will-change-transform h-full"
                  variants={cardInV}
                  custom={
                    // “per-row” feel: 3 cols on xl, 2 cols on lg, 1 on mobile.
                    // This keeps the stagger elegant instead of super long.
                    i % 6
                  }
                  style={{ willChange: "transform, opacity" }}
                >
                  <MotionLink
                    href={`/${lang}/journal/${p.slug}`}
                    className={cn(
                      "group flex h-full flex-col overflow-hidden rounded-[22px]",
                      "border border-(--olivea-olive)/12 bg-white/58",
                      "shadow-[0_14px_34px_rgba(40,60,35,0.10)]",
                      "transition will-change-transform",
                      "hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(40,60,35,0.14)]",
                      "hover:border-(--olivea-olive)/20"
                    )}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  >
                    <div className="relative h-52 sm:h-60 w-full bg-(--olivea-cream)/40">
                      {p.cover?.src ? (
                        <>
                          <Image
                            src={p.cover.src}
                            alt={p.cover.alt || p.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover transition duration-700 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                        </>
                      ) : (
                        <div className="h-full w-full bg-linear-to-br from-white/70 to-(--olivea-cream)/35" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-7">
                      <div className="flex flex-col gap-2 text-[12px] uppercase tracking-[0.24em] text-(--olivea-olive) opacity-80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{p.pillar}</span>
                          <span className="opacity-60">·</span>
                          <span className="whitespace-nowrap">{prettyDate}</span>
                          <span className="opacity-60">·</span>
                          <span className="whitespace-nowrap">
                            {p.readingMinutes} min
                          </span>
                        </div>
                      </div>

                      <h3 className="mt-3 text-[19px] sm:text-[21px] md:text-[22px] font-medium leading-[1.22] tracking-[-0.015em] line-clamp-2 text-(--olivea-olive)">
                        {p.title}
                      </h3>

                      <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.6] sm:leading-[1.65] text-(--olivea-clay) opacity-95 line-clamp-3">
                        {p.excerpt || " "}
                      </p>

                      {/* Footer zone pinned to bottom for uniform card height */}
                      <div className="mt-auto pt-5">
                        <div className="hidden sm:block min-h-14">
                          {p.tags?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {p.tags.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className={cn(
                                    "text-[12px] px-3 py-1.5 rounded-full",
                                    "bg-(--olivea-cream)/70 border border-(--olivea-olive)/18",
                                    "text-(--olivea-olive) opacity-90"
                                  )}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div aria-hidden className="h-9" />
                          )}
                        </div>

                        <div className="mt-5 h-0.5 w-full bg-(--olivea-olive)/10 overflow-hidden rounded-full">
                          <div
                            data-progress
                            className="h-full w-full origin-left bg-(--olivea-olive)/30"
                            style={{ transform: "scaleX(0)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </MotionLink>
                </motion.div>
              );
            })}
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-10 text-[15px] leading-7 text-(--olivea-clay) opacity-85">
              {lang === "es" ? "No hay resultados." : "No results found."}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}