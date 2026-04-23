/**
 * Olivea — Shared Framer Motion Animation System
 *
 * Rich & cinematic animation primitives for a farm-to-table restaurant
 * in Valle de Guadalupe. Earthy, warm, sophisticated motion language.
 *
 * Usage with LazyMotion:
 *   Use `m` instead of `motion` in components wrapped by <LazyMotion>.
 *   Use `motion` in standalone components outside the provider.
 */

import { useEffect, useRef, useState } from "react";
import type { Variants, Transition } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
   1. EASING CURVES
   ═══════════════════════════════════════════════════════════════════ */

/** Slow deceleration — objects settling into place like wine into a glass */
export const easeCinematicOut = [0.22, 1, 0.36, 1] as const;

/** Dramatic acceleration — swift departure, objects lifting away */
export const easeCinematicIn = [0.55, 0, 1, 0.45] as const;

/** Smooth in-out — balanced movement for interactive elements */
export const easeSmoothInOut = [0.4, 0, 0.2, 1] as const;

/** Elastic settle — slight overshoot, organic feel */
export const easeElasticSettle = [0.34, 1.56, 0.64, 1] as const;

/** Gentle float — for decorative breathing animations */
export const easeGentleFloat = [0.45, 0.05, 0.55, 0.95] as const;

/* ═══════════════════════════════════════════════════════════════════
   2. DURATION PRESETS (seconds)
   ═══════════════════════════════════════════════════════════════════ */

export const duration = {
  fast: 0.3,
  medium: 0.5,
  slow: 0.8,
  cinematic: 1.2,
} as const;

/* ═══════════════════════════════════════════════════════════════════
   3. TRANSITION PRESETS
   ═══════════════════════════════════════════════════════════════════ */

export const transition = {
  fast: { duration: duration.fast, ease: easeSmoothInOut } as Transition,
  medium: { duration: duration.medium, ease: easeCinematicOut } as Transition,
  slow: { duration: duration.slow, ease: easeCinematicOut } as Transition,
  cinematic: { duration: duration.cinematic, ease: easeCinematicOut } as Transition,
} as const;

/* ═══════════════════════════════════════════════════════════════════
   4. VARIANT SETS
   ═══════════════════════════════════════════════════════════════════ */

// ---------- Fade Up — parallax-like rise ----------
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: duration.slow, ease: easeCinematicOut },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Fade Down ----------
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easeCinematicOut },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Fade In — simple opacity ----------
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.medium, ease: easeSmoothInOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easeSmoothInOut },
  },
};

// ---------- Scale In ----------
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.slow, ease: easeCinematicOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Slide In Left ----------
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -120, skewX: 2 },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    transition: { duration: duration.slow, ease: easeCinematicOut },
  },
  exit: {
    opacity: 0,
    x: -60,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Slide In Right ----------
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 120, skewX: -2 },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    transition: { duration: duration.slow, ease: easeCinematicOut },
  },
  exit: {
    opacity: 0,
    x: 60,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Stagger Container ----------
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      ease: easeSmoothInOut,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

// ---------- Stagger Child ----------
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.medium, ease: easeCinematicOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Hero Reveal — dramatic scale + fade + blur ----------
export const heroReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.08,
    filter: "blur(12px) saturate(0.6)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px) saturate(1)",
    transition: {
      duration: duration.cinematic,
      ease: easeCinematicOut,
      opacity: { duration: duration.slow },
      filter: { duration: duration.cinematic * 1.2 },
    },
  },
  exit: {
    opacity: 0,
    scale: 1.03,
    filter: "blur(6px)",
    transition: { duration: duration.medium, ease: easeCinematicIn },
  },
};

// ---------- Card Reveal — 3D perspective tilt ----------
export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotateX: 8,
    scale: 0.96,
    transformPerspective: 1200,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transformPerspective: 1200,
    transition: {
      duration: duration.slow,
      ease: easeCinematicOut,
      opacity: { duration: duration.medium },
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    rotateX: -4,
    scale: 0.98,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Text Reveal — sliding up from behind a mask ----------
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: "100%",
    skewY: 3,
  },
  visible: {
    opacity: 1,
    y: "0%",
    skewY: 0,
    transition: {
      duration: duration.slow,
      ease: easeCinematicOut,
    },
  },
  exit: {
    opacity: 0,
    y: "-50%",
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Parallax Float — decorative breathing ----------
export const parallaxFloat: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: easeCinematicOut,
      y: {
        duration: 4,
        ease: easeGentleFloat,
        repeat: Infinity,
        repeatType: "mirror" as const,
        delay: 0.5,
      },
    },
  },
};

// ---------- Drawer Slide — side panels ----------
export const drawerSlide: Variants = {
  hidden: { x: "100%", opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: duration.medium, ease: easeCinematicOut },
  },
  exit: {
    x: "100%",
    opacity: 0.8,
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Modal Overlay ----------
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.fast, ease: easeSmoothInOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easeSmoothInOut },
  },
};

// ---------- Modal Content ----------
export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: duration.medium,
      ease: easeCinematicOut,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    filter: "blur(2px)",
    transition: { duration: duration.fast, ease: easeCinematicIn },
  },
};

// ---------- Table Row — admin data tables ----------
export const tableRow: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.fast, ease: easeSmoothInOut },
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: { duration: duration.fast, ease: easeSmoothInOut },
  },
};

// ---------- Page Transition ----------
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: duration.slow,
      ease: easeCinematicOut,
      when: "beforeChildren" as const,
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: duration.medium,
      ease: easeCinematicIn,
      when: "afterChildren" as const,
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   5. UTILITY HOOKS
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Returns a ref and an `inView` boolean for scroll-triggered animations.
 * Attach the ref to the element you want to observe.
 *
 * @param threshold - Intersection ratio to trigger (0 to 1), default 0.15
 * @param once      - If true (default), stays visible once triggered
 */
export function useScrollReveal(threshold = 0.15, once = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, inView } as const;
}

/**
 * Returns a transition delay for staggered list items.
 *
 * @param index     - The item's index in the list
 * @param baseDelay - Delay per index step in seconds (default 0.08)
 */
export function useStaggerDelay(index: number, baseDelay = 0.08) {
  return {
    delay: index * baseDelay,
  } as const;
}
