"use client";

// A pause between chapters: one tall photograph, then a single line set large
// with room around it. Motion matches the rest of the page: the photo is the
// same scroll-grown band as the Rooms chapter's banner, and the line lights up
// word by word with the scroll.
//
// The line, photo and photo description for each house are edited in
// /admin → Interface text ("editorial.statement.<house>.*"); the house name
// under the line is the house's own name from the same place.
//
// The photo stays at the content column's width: the chapter rail and right
// dock are fixed, so an edge-to-edge image would run underneath them. Scale
// comes from height and type size instead.

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import ScrollGrowImageBand from "@/components/mdx/ScrollGrowImageBand";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useHouseText, useUiText } from "@/lib/uiText/context";
import type { ReservationType } from "@/contexts/ReservationContext";
import type { Lang } from "@/lib/i18n";

/** A word starts this faint and rises this far before it lights up. */
const WORD_REST_OPACITY = 0.14;
const WORD_RISE_PX = 10;
/** How much of the scroll range each word's fade overlaps the next. */
const WORD_SPREAD = 1.6;

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [WORD_REST_OPACITY, 1]);
  const y = useTransform(progress, range, [WORD_RISE_PX, 0]);
  return <motion.span style={{ opacity, y, display: "inline-block" }}>{children}</motion.span>;
}

function ScrollLine({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = usePrefersReducedMotion();
  // From the line entering the lower part of the screen until it reaches the
  // middle: the words light up one after another across that stretch.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.5"] });
  const words = text.split(/\s+/).filter(Boolean);
  const step = 1 / Math.max(words.length, 1);

  return (
    <p
      ref={ref}
      className="olivea-display-italic"
      style={{ fontSize: "clamp(28px, 3.4vw, 50px)", lineHeight: 1.18, letterSpacing: "0.005em", textWrap: "balance" }}
    >
      {reduce ? (
        text
      ) : (
        <>
          {/* Read once as a sentence; the animated words are decoration. */}
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {words.map((w, i) => (
              <span key={i}>
                <Word progress={scrollYProgress} range={[i * step * 0.85, Math.min(1, i * step * 0.85 + step * WORD_SPREAD)]}>
                  {w}
                </Word>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </span>
        </>
      )}
    </p>
  );
}

export default function StatementMoment({
  lang,
  house,
  objectPosition = "50% 50%",
}: {
  lang: Lang;
  house: ReservationType;
  objectPosition?: string;
}) {
  const t = useUiText(lang);
  const houseText = useHouseText(lang)(house);

  return (
    <div className="py-16 md:py-28">
      <ScrollGrowImageBand
        src={t(`editorial.statement.${house}.image`)}
        alt={t(`editorial.statement.${house}.alt`)}
        startH="220px"
        endH="720px"
        objectPosition={objectPosition}
        mobileH="52vh"
      />

      <div className="mx-auto mt-16 max-w-[820px] text-center md:mt-28">
        <span aria-hidden="true" className="olivea-hairline mb-8" />
        <ScrollLine text={t(`editorial.statement.${house}.line`)} />
        <div className="olivea-eyebrow mt-8">{houseText.name}</div>
      </div>
    </div>
  );
}
