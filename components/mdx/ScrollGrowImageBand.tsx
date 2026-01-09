"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type UseScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>;
type OffsetType = UseScrollOptions extends { offset?: infer O } ? O : unknown;

type Props = {
  src: string;
  alt: string;

  /** Height animation (desktop) */
  startH?: string;
  endH?: string;
  delayStart?: number;
  holdAt?: number;

  /** Layout */
  maxWClassName?: string;
  className?: string;

  /** Image presentation */
  objectPosition?: string;
  priority?: boolean;

  /** Scroll binding */
  scrollContainerSelector?: string;
  offset?: OffsetType;

  /** Overlay controls */
  showOverlays?: boolean;
  showSheen?: boolean;
  showGrain?: boolean;
  contrastFromBlack?: string;

  /** ✅ Mobile performance */
  mobileMode?: "static" | "animate"; // default "static"
  mobileH?: string; // default "260px"
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function findEl(selector?: string): HTMLElement | null {
  if (!selector) return null;
  return document.querySelector(selector) as HTMLElement | null;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

export default function ScrollGrowImageBand({
  src,
  alt,
  startH = "170px",
  endH = "420px",
  delayStart = 0.18,
  holdAt = 0.88,

  maxWClassName = "max-w-275",
  className = "",

  objectPosition = "50% 45%",
  priority = false,

  scrollContainerSelector = "main",
  offset,

  showOverlays = true,
  showSheen = true,
  showGrain = false,
  contrastFromBlack = "from-black/14 via-black/6",

  mobileMode = "static",
  mobileH = "260px",
}: Props) {
  const reduce = useReducedMotion();
  const targetRef = useRef<HTMLDivElement | null>(null);

  // ✅ mobile == md breakpoint parity
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainerEl(
      findEl(scrollContainerSelector) ||
        (document.querySelector("main") as HTMLElement | null) ||
        null
    );
  }, [scrollContainerSelector]);

  const containerRef = useMemo(
    () => ({ current: containerEl }) as React.RefObject<HTMLElement>,
    [containerEl]
  );

  const offsetMutable: OffsetType = useMemo(() => {
    if (offset) return offset;
    return ["end 98%", "start 28%"] as unknown as OffsetType;
  }, [offset]);

  /**
   * ✅ Key fix:
   * - Desktop: keep container-based scrolling (your current behavior)
   * - Mobile: bind to window scroll (omit container) because mobile commonly scrolls the page, not <main>
   */
  const scrollOpts = useMemo(() => {
    const base: UseScrollOptions = {
      target: targetRef,
      offset: offsetMutable,
    };

    // Mobile: viewport scroll
    if (isMobile) return base;

    // Desktop: container scroll
    return {
      ...base,
      container: containerRef,
    } as UseScrollOptions;
  }, [isMobile, offsetMutable, containerRef]);

  const scroll = useScroll(scrollOpts);
  const scrollYProgress = scroll.scrollYProgress as MotionValue<number>;

  /**
   * ✅ “Luxury slow” smoothing:
   * Always create the spring values (no conditional hooks), then decide whether to use them.
   */
  const springCfg = useMemo(
    () =>
      isMobile
        ? { stiffness: 45, damping: 28, mass: 1.35 }
        : { stiffness: 220, damping: 34, mass: 0.9 },
    [isMobile]
  );

  // ✅ longer mobile ramp (reveal finishes later)
  const MOB_REVEAL_END = isMobile ? 0.62 : 0.18;

  // --- RAW transforms ---
  const cardOpacityRaw = useTransform(
    scrollYProgress,
    [0, isMobile ? 0.28 : 0.12],
    [0, 1]
  );

  const cardYRaw = useTransform(scrollYProgress, [0, MOB_REVEAL_END], [28, 0]);

  const cardScaleRaw = useTransform(
    scrollYProgress,
    [0, MOB_REVEAL_END],
    [0.985, 1]
  );

  // --- SPRUNG transforms (ALWAYS called) ---
  const cardOpacitySprung = useSpring(cardOpacityRaw, springCfg);
  const cardYSprung = useSpring(cardYRaw, springCfg);
  const cardScaleSprung = useSpring(cardScaleRaw, springCfg);

  // --- FINAL values (choose without conditional hooks) ---
  const cardOpacity: MotionValue<number> = reduce
    ? (1 as unknown as MotionValue<number>)
    : cardOpacitySprung;

  // Only move/scale the whole card on mobile (desktop stays identical)
  const cardY: MotionValue<number> = !reduce && isMobile
    ? cardYSprung
    : (0 as unknown as MotionValue<number>);

  const cardScale: MotionValue<number> = !reduce && isMobile
    ? cardScaleSprung
    : (1 as unknown as MotionValue<number>);

  // ✅ Only animate height on desktop (or if explicitly enabled on mobile)
  const shouldAnimateHeight = !reduce && (!isMobile || mobileMode === "animate");

  const hMotion = useTransform(
    scrollYProgress,
    [0, delayStart, holdAt, 1],
    [startH, startH, endH, endH]
  );

  const h: MotionValue<string> | string = shouldAnimateHeight
    ? (hMotion as MotionValue<string>)
    : isMobile
      ? mobileH
      : endH;

  return (
    <motion.div
      ref={targetRef}
      className={[
        "relative mt-10 w-full mx-auto overflow-hidden",
        maxWClassName,
        "rounded-[26px] md:rounded-[40px]",
        "ring-1 ring-black/10",
        "shadow-[0_18px_54px_rgba(0,0,0,0.20)] md:shadow-[0_28px_78px_rgba(0,0,0,0.22)]",
        "bg-(--olivea-cream)/95",
        className,
      ].join(" ")}
      style={{
        height: h,
        opacity: reduce ? 1 : cardOpacity,
        // ✅ entire CARD reveals up on mobile
        y: !reduce && isMobile ? cardY : 0,
        scale: !reduce && isMobile ? cardScale : 1,
        willChange: !reduce && isMobile
          ? "transform, opacity"
          : shouldAnimateHeight
            ? "height"
            : "opacity",
      }}
    >
      <div className="absolute inset-0">
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 94vw, 1100px"
          style={{ objectFit: "cover", objectPosition }}
        />
      </div>

      {showOverlays && (
        <div className="pointer-events-none absolute inset-0">
          <div
            className={[
              "absolute inset-0 bg-linear-to-r",
              contrastFromBlack,
              "to-transparent",
            ].join(" ")}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/12 via-transparent to-transparent" />
          <div className="absolute inset-0 ring-1 ring-white/10" />

          {/* ✅ Sheen is desktop-only (GPU-y on mobile) */}
          {showSheen && !reduce && !isMobile && (
            <motion.div
              aria-hidden
              className="absolute -inset-[40%] rotate-18 bg-linear-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-45%", opacity: 0 }}
              whileInView={{ x: "45%", opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.35, ease: EASE, delay: 0.15 }}
            />
          )}

          {showGrain && (
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,.45) 1px, transparent 0)",
                backgroundSize: "7px 7px",
              }}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}
