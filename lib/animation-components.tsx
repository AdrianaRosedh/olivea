"use client";

/**
 * Olivea — Reusable Animation Wrapper Components
 *
 * Cinematic, scroll-triggered motion wrappers built on top of
 * the shared animation system at lib/animations.ts.
 *
 * All components use `m` (not `motion`) to work inside the
 * existing <LazyMotion features={domAnimation}> provider.
 */

import React, { type ReactNode, type CSSProperties } from "react";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  fadeUp,
  staggerContainer,
  staggerChild,
  heroReveal,
  cardReveal,
  useScrollReveal,
  duration,
  easeCinematicOut,
} from "@/lib/animations";

/* ═══════════════════════════════════════════════════════════════════
   Reveal
   Wraps children with a scroll-triggered fadeUp animation.
   ═══════════════════════════════════════════════════════════════════ */

interface RevealProps {
  children: ReactNode;
  /** Custom variants — defaults to `fadeUp` */
  variants?: Variants;
  /** IntersectionObserver threshold (0-1), default 0.15 */
  threshold?: number;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** HTML tag to render, default "div" */
  as?: "div" | "section" | "article" | "aside" | "header" | "footer" | "li";
}

export function Reveal({
  children,
  variants = fadeUp,
  threshold = 0.15,
  className,
  style,
  as = "div",
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const { ref, inView } = useScrollReveal(threshold);

  const Component = m[as];

  return (
    <Component
      ref={ref as React.RefObject<never>}
      variants={prefersReduced ? undefined : variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   StaggerList
   Wraps list items with staggered entrance animations.
   ═══════════════════════════════════════════════════════════════════ */

interface StaggerListProps {
  children: ReactNode;
  /** Custom container variants */
  containerVariants?: Variants;
  /** Custom child variants */
  childVariants?: Variants;
  /** IntersectionObserver threshold, default 0.1 */
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  /** HTML tag for the list container, default "ul" */
  as?: "ul" | "ol" | "div" | "section";
  /** HTML tag for each child wrapper, default "li" */
  childAs?: "li" | "div" | "article";
}

export function StaggerList({
  children,
  containerVariants = staggerContainer,
  childVariants = staggerChild,
  threshold = 0.1,
  className,
  style,
  as = "ul",
  childAs = "li",
}: StaggerListProps) {
  const prefersReduced = useReducedMotion();
  const { ref, inView } = useScrollReveal(threshold);

  const Container = m[as];
  const Child = m[childAs];

  // Wrap each child in a stagger child element
  const items = Array.isArray(children) ? children : [children];

  return (
    <Container
      ref={ref as React.RefObject<never>}
      variants={prefersReduced ? undefined : containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {items.map((child, i) => (
        <Child key={i} variants={prefersReduced ? undefined : childVariants}>
          {child}
        </Child>
      ))}
    </Container>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ParallaxSection
   Section with vertical parallax scroll offset on its children.
   ═══════════════════════════════════════════════════════════════════ */

interface ParallaxSectionProps {
  children: ReactNode;
  /** Parallax intensity in pixels — default 60. Positive = children move slower. */
  offset?: number;
  className?: string;
  style?: CSSProperties;
}

export function ParallaxSection({
  children,
  offset = 60,
  className,
  style,
}: ParallaxSectionProps) {
  const prefersReduced = useReducedMotion();
  const { ref, inView } = useScrollReveal(0.05);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <m.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
      style={{ overflow: "hidden", ...style }}
    >
      <m.div style={{ y: prefersReduced ? 0 : y }}>
        {children}
      </m.div>
    </m.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CinematicHero
   Hero wrapper with dramatic entrance — scale, blur, desaturation.
   ═══════════════════════════════════════════════════════════════════ */

interface CinematicHeroProps {
  children: ReactNode;
  /** Custom variants — defaults to `heroReveal` */
  variants?: Variants;
  /** Delay before the hero reveal starts (seconds) */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function CinematicHero({
  children,
  variants = heroReveal,
  delay = 0,
  className,
  style,
}: CinematicHeroProps) {
  const prefersReduced = useReducedMotion();

  const delayedVariants: Variants = delay
    ? {
        ...variants,
        visible: {
          ...(typeof variants.visible === "object" ? variants.visible : {}),
          transition: {
            ...((typeof variants.visible === "object" &&
              variants.visible &&
              "transition" in variants.visible &&
              typeof variants.visible.transition === "object"
                ? variants.visible.transition
                : {}) as object),
            delay,
          },
        },
      }
    : variants;

  return (
    <m.section
      variants={prefersReduced ? undefined : delayedVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      style={style}
    >
      {children}
    </m.section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CardReveal
   Card wrapper with 3D perspective tilt entrance.
   ═══════════════════════════════════════════════════════════════════ */

interface CardRevealProps {
  children: ReactNode;
  /** Custom variants — defaults to `cardReveal` */
  variants?: Variants;
  /** IntersectionObserver threshold, default 0.2 */
  threshold?: number;
  /** Optional stagger delay index for use in lists */
  index?: number;
  className?: string;
  style?: CSSProperties;
}

export function CardReveal({
  children,
  variants = cardReveal,
  threshold = 0.2,
  index,
  className,
  style,
}: CardRevealProps) {
  const prefersReduced = useReducedMotion();
  const { ref, inView } = useScrollReveal(threshold);

  const indexedVariants: Variants =
    typeof index === "number"
      ? {
          ...variants,
          visible: {
            ...(typeof variants.visible === "object" ? variants.visible : {}),
            transition: {
              duration: duration.slow,
              ease: easeCinematicOut,
              delay: index * 0.1,
            },
          },
        }
      : variants;

  return (
    <m.div
      ref={ref}
      variants={prefersReduced ? undefined : indexedVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={{ perspective: 1200, ...style }}
    >
      {children}
    </m.div>
  );
}
