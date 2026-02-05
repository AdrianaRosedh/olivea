// components/scroll/ScrollDrift.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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

export default function ScrollDrift({
  children,
  className = "",
  fromX = -40,
  toX = 26,

  reveal = true,
  revealOnce = true,

  align = "auto",
  revealOffset = 26,

  // ✅ Mobile reveal slides up by default
  mobileReveal = "up",
  mobileRevealOffset = 18,

  driftOffset = ["start 70%", "end 20%"] as ScrollOffset,
  revealMargin = "-30% 0px -30% 0px" as InViewMargin,

  driftMode = "desktop",
}: {
  children: React.ReactNode;
  className?: string;
  fromX?: number;
  toX?: number;

  reveal?: boolean;
  revealOnce?: boolean;
  align?: Align;
  revealOffset?: number;

  /** ✅ Mobile reveal behavior */
  mobileReveal?: "up" | "none";
  mobileRevealOffset?: number;

  driftOffset?: ScrollOffset;
  revealMargin?: InViewMargin;

  driftMode?: "desktop" | "always" | "never";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  // Tailwind md parity
  const isMobile = useMediaQuery("(max-width: 767px)");

  const inView = useInView(ref, {
    once: revealOnce,
    margin: revealMargin,
  });

  const shouldReveal = reveal && !reduce;

  // Decide which side we "enter from" (desktop x reveal)
  const inferredAlign: Align =
    align !== "auto" ? align : toX < fromX ? "right" : "left";

  const enterFromX =
    inferredAlign === "right" ? fromX + revealOffset : fromX - revealOffset;

  // ✅ Drift only on desktop by default (prevents mobile jitter)
  const allowDrift =
    !reduce &&
    driftMode !== "never" &&
    (driftMode === "always" || !isMobile);

  // Only bind scroll progress when drift is enabled
  const { scrollYProgress } = useScroll(
    allowDrift ? { target: ref, offset: driftOffset } : { target: ref }
  );

  const rawX = useTransform(scrollYProgress, [0, 1], [fromX, toX]);
  const x = useSpring(rawX, { stiffness: 170, damping: 18, mass: 0.75 });

  // ✅ Mobile reveal uses Y (slide up)
  const mobileEnterY =
    mobileReveal === "up" ? mobileRevealOffset : 0;

  // Initial values:
  // - mobile: y only
  // - desktop: x only
  const initial = shouldReveal
    ? isMobile
      ? { opacity: 0, y: mobileEnterY }
      : { opacity: 0, x: enterFromX }
    : undefined;

  // Animate values:
  // - mobile: y to 0
  // - desktop: x to 0 (then drift takes over via style)
  const animate = shouldReveal
    ? isMobile
      ? { opacity: inView ? 1 : 0, y: inView ? 0 : mobileEnterY }
      : { opacity: inView ? 1 : 0, x: inView ? 0 : enterFromX }
    : undefined;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
      transition={
        shouldReveal
          ? {
              opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              x: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            }
          : undefined
      }
      // ✅ Desktop drift only
      style={allowDrift ? { x } : undefined}
    >
      {children}
    </motion.div>
  );
}
