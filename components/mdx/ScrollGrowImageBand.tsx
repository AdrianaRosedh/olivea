"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type UseScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>;
type OffsetType = UseScrollOptions extends { offset?: infer O } ? O : unknown;

type Props = {
  src: string;
  alt: string;

  /** Height animation */
  startH?: string; // e.g. "170px"
  endH?: string;   // e.g. "420px"
  delayStart?: number; // 0..1 when growth begins (default 0.18)
  holdAt?: number; // 0..1 when it reaches endH and holds (default 0.88)

  /** Layout */
  maxWClassName?: string; // default "max-w-275" (1100px)
  className?: string;

  /** Image presentation */
  objectPosition?: string; // default "50% 45%"
  priority?: boolean;

  /** Scroll binding */
  scrollContainerSelector?: string; // default "main"
  offset?: OffsetType;

  /** Overlay controls */
  showOverlays?: boolean;
  showSheen?: boolean;
  showGrain?: boolean;
  contrastFromBlack?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function findEl(selector?: string): HTMLElement | null {
  if (!selector) return null;
  return document.querySelector(selector) as HTMLElement | null;
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
  showGrain = false, // ✅ off by default to avoid “foggy” look
  contrastFromBlack = "from-black/14 via-black/6",
}: Props) {
  const reduce = useReducedMotion();
  const targetRef = useRef<HTMLDivElement | null>(null);

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

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: targetRef,
    offset: offsetMutable,
  });

  // ✅ delayed start + later finish + hold at mark
  const hMotion = useTransform(
    scrollYProgress,
    [0, delayStart, holdAt, 1],
    [startH, startH, endH, endH]
  );
  const h: MotionValue<string> | string = reduce ? endH : hMotion;

  const fade = useTransform(scrollYProgress, [0, 0.12], [0, 1]);

  return (
    <motion.div
      ref={targetRef}
      className={[
        "relative mt-10 w-full mx-auto",
        maxWClassName,
        "overflow-hidden rounded-[40px]",
        "ring-1 ring-black/10",
        "shadow-[0_28px_78px_rgba(0,0,0,0.22)]",
        "bg-(--olivea-cream)/95",
        "will-change-[height]",
        className,
      ].join(" ")}
      style={{ height: h, opacity: reduce ? 1 : fade }}
    >
      <div className="absolute inset-0">
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 1100px, 94vw"
          style={{ objectFit: "cover", objectPosition }}
        />
      </div>

      {showOverlays && (
        <div className="pointer-events-none absolute inset-0">
          {/* subtle cinematic contrast */}
          <div
            className={[
              "absolute inset-0 bg-linear-to-r",
              contrastFromBlack,
              "to-transparent",
            ].join(" ")}
          />

          {/* ✅ replace the “foggy cream” with a clean depth fade */}
          <div className="absolute inset-0 bg-linear-to-t from-black/12 via-transparent to-transparent" />

          <div className="absolute inset-0 ring-1 ring-white/10" />

          {showSheen && !reduce && (
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
