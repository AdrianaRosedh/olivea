// app/(main)/[lang]/press/components/ItemCard.tsx
"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Lang, PressItem } from "../pressTypes";
import { Pin } from "lucide-react";
import { fmtDate, identityLabel, tt } from "../lib/pressText";
import { getAwardBadges } from "../lib/pressBadges";

/* ---------------- motion ---------------- */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

export default function ItemCard({
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

          {/* ✅ Badge pills (with per-logo scaling support) */}
          {it.kind === "award" && awardBadges.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {awardBadges.map((b) => (
                <span
                  key={b.key}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 ring-1 ring-black/10"
                >
                  <span className="relative h-4 w-4 overflow-visible">
                    <Image
                      src={b.src}
                      alt={b.label}
                      fill
                      className={cn("object-contain", b.imgClassName)}
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

            {/* ✅ Logos column (with per-logo scaling support) */}
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
                      <span className="relative h-6 w-6 overflow-visible">
                        <Image
                          src={b.src}
                          alt={b.label}
                          fill
                          className={cn("object-contain", b.imgClassName)}
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
