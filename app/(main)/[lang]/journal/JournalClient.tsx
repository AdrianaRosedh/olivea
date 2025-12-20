"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Lang } from "../dictionaries";
import JournalFilterDock from "./JournalFilterDock";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* =================== types =================== */
type Post = {
  lang: "es" | "en";
  slug: string; // filename slug
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

/* =================== motion =================== */
const featuredV: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardV: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const MotionLink = motion(Link);

/* =================== component =================== */
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

  // Featured: deterministic "one featured per day per language"
  const { featured, rest } = useMemo(() => {
    if (!filtered.length) return { featured: null as Post | null, rest: [] as Post[] };

    const seed = `${dayKey()}-${lang}-${pillar}-${tag}-${q.trim().toLowerCase()}`;
    const idx = hash32(seed) % filtered.length;
    const feat = filtered[idx];
    const remainder = filtered.filter((_, i) => i !== idx);

    return { featured: feat, rest: remainder };
  }, [filtered, lang, pillar, tag, q]);

  // Subtle rhythm: only nudges on xl+
  const rhythmClass = (slug: string) => {
    const r = hash32(slug) % 6;
    if (r === 0) return "xl:translate-y-0";
    if (r === 1) return "xl:translate-y-[6px]";
    if (r === 2) return "xl:translate-y-[10px]";
    if (r === 3) return "xl:translate-y-[14px]";
    if (r === 4) return "xl:translate-y-[8px]";
    return "xl:translate-y-[12px]";
  };

  const canHover = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
  }, []);

  // Hover progress logic (only on hover-capable devices)
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

  const onEnter = (e: React.MouseEvent<HTMLElement>) => startProgress(e.currentTarget);
  const onLeave = (e: React.MouseEvent<HTMLElement>) => resetProgress(e.currentTarget);

  // Stable "various times" delay per card (deterministic)
  const perCardDelay = (slug: string, i: number) => {
    if (reduce) return 0;
    const jitter = (hash32(slug) % 9) * 0.015; // 0–0.12s
    const cascade = Math.min(i, 10) * 0.03; // gentle wave
    return jitter + cascade;
  };

  return (
    <main className="w-full pt-10 pb-24">
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
          "px-5 sm:px-8 md:px-10 2xl:px-12",
          "md:ml-86",
          "md:mr-(--dock-right)"
        )}
      >
        {/* Featured: animate once on mount (no scroll trigger) */}
        {featured && (
          <motion.div initial={reduce ? false : "hidden"} animate="show" variants={featuredV}>
            <MotionLink
              href={`/${lang}/journal/${featured.slug}`}
              className={cn(
                "group block overflow-hidden rounded-3xl",
                "border border-(--olivea-olive)/14 bg-white/60",
                "shadow-[0_16px_40px_rgba(40,60,35,0.10)]",
                "transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(40,60,35,0.14)]"
              )}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr]">
                <div className="relative h-85 lg:h-105 bg-(--olivea-cream)/40">
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
                      <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    </>
                  ) : (
                    <div className="h-full w-full bg-linear-to-br from-white/70 to-(--olivea-cream)/35" />
                  )}
                </div>

                <div className="p-7 sm:p-8 lg:p-10">
                  <div className="text-[12px] uppercase tracking-[0.26em] text-(--olivea-olive) opacity-80">
                    {featured.pillar} · {fmtDate(featured.publishedAt)} · {featured.readingMinutes} min
                  </div>

                  <h2 className="mt-3 text-[24px] sm:text-[26px] md:text-[28px] font-medium leading-[1.18] tracking-[-0.02em] text-(--olivea-olive)">
                    {featured.title}
                  </h2>

                  <p className="mt-4 text-[15px] sm:text-[16px] leading-[1.75] text-(--olivea-clay) opacity-95 line-clamp-4">
                    {featured.excerpt}
                  </p>

                  {!!(featured.tags?.length) && (
                    <div className="mt-6 flex flex-wrap gap-2">
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
                  )}

                  <div className="mt-7 h-0.5 w-full bg-(--olivea-olive)/10 overflow-hidden rounded-full">
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
        )}

        {/* Grid: per-card once-only reveal (no parent stagger to avoid glitch) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(360px,1fr))] gap-10">
          {rest.map((p, i) => {
            const prettyDate = fmtDate(p.publishedAt);
            const delay = perCardDelay(p.slug, i);

            return (
              <motion.div
                key={`${p.lang}:${p.slug}`}
                className={cn("will-change-transform", rhythmClass(p.slug))}
                variants={cardV}
                initial={reduce ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.18 }}
                transition={{ delay }}
              >
                <MotionLink
                  href={`/${lang}/journal/${p.slug}`}
                  className={cn(
                    "group block overflow-hidden rounded-[22px]",
                    "border border-(--olivea-olive)/12 bg-white/58",
                    "shadow-[0_14px_34px_rgba(40,60,35,0.10)]",
                    "transition will-change-transform",
                    "hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(40,60,35,0.14)]",
                    "hover:border-(--olivea-olive)/20"
                  )}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  <div className="relative h-60 w-full bg-(--olivea-cream)/40">
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

                  <div className="p-7">
                    <div className="text-[12px] uppercase tracking-[0.24em] text-(--olivea-olive) opacity-80">
                      {p.pillar} · {prettyDate} · {p.readingMinutes} min
                    </div>

                    <h3 className="mt-3 text-[21px] md:text-[22px] font-medium leading-[1.22] tracking-[-0.015em] line-clamp-2 text-(--olivea-olive)">
                      {p.title}
                    </h3>

                    <p className="mt-3 text-[15px] leading-[1.65] text-(--olivea-clay) opacity-95 line-clamp-3">
                      {p.excerpt}
                    </p>

                    {!!(p.tags?.length) && (
                      <div className="mt-5 flex flex-wrap gap-2">
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
                    )}

                    <div className="mt-6 h-0.5 w-full bg-(--olivea-olive)/10 overflow-hidden rounded-full">
                      <div
                        data-progress
                        className="h-full w-full origin-left bg-(--olivea-olive)/30"
                        style={{ transform: "scaleX(0)" }}
                      />
                    </div>
                  </div>
                </MotionLink>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 text-[15px] leading-7 text-(--olivea-clay) opacity-85">
            {lang === "es" ? "No hay resultados." : "No results found."}
          </div>
        )}
      </section>
    </main>
  );
}
