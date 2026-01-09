// components/scroll/ScrollDrift.tsx
"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
  useInView,
  type UseScrollOptions,
  type UseInViewOptions,
} from "framer-motion";

type ScrollOffset = NonNullable<UseScrollOptions["offset"]>;
type InViewMargin = NonNullable<UseInViewOptions["margin"]>;
type Align = "left" | "right" | "auto";

export default function ScrollDrift({
  children,
  className = "",
  fromX = -40,
  toX = 26,

  reveal = true,
  revealOnce = true,

  /**
   * How the element is positioned in the layout:
   * - left: reveal slides in from left
   * - right: reveal slides in from right
   * - auto: infer from fromX/toX direction (default)
   */
  align = "auto",

  /**
   * How strong the reveal push is (px).
   * Positive number; direction is applied automatically.
   */
  revealOffset = 26,

  driftOffset = ["start 70%", "end 20%"] as ScrollOffset,
  revealMargin = "-30% 0px -30% 0px" as InViewMargin,
}: {
  children: React.ReactNode;
  className?: string;
  fromX?: number;
  toX?: number;

  reveal?: boolean;
  revealOnce?: boolean;
  align?: Align;
  revealOffset?: number;

  driftOffset?: ScrollOffset;
  revealMargin?: InViewMargin;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: driftOffset,
  });

  const rawX = useTransform(scrollYProgress, [0, 1], [fromX, toX]);
  const x = useSpring(rawX, { stiffness: 170, damping: 18, mass: 0.75 });

  const inView = useInView(ref, {
    once: revealOnce,
    margin: revealMargin,
  });

  const shouldReveal = !reduce && reveal;

  // Decide which side we "enter from"
  const inferredAlign: Align =
    align !== "auto"
      ? align
      : toX < fromX
      ? "right" // drifting left => likely positioned right => enter from right
      : "left"; // drifting right => likely positioned left => enter from left

  const enterFromX =
    inferredAlign === "right" ? fromX + revealOffset : fromX - revealOffset;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={shouldReveal ? { opacity: 0, x: enterFromX } : undefined}
      animate={shouldReveal ? { opacity: inView ? 1 : 0 } : undefined}
      transition={
        shouldReveal
          ? { opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
          : undefined
      }
      style={reduce ? undefined : { x }}
    >
      {children}
    </motion.div>
  );
}
