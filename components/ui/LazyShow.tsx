"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, Variants } from "framer-motion";

/**
 * LazyShow
 * --------------
 * Reveals its children with a fade + slide animation when scrolled into view.
 * - Prevents CLS (layout shift) by reserving optional minHeight/aspectRatio space.
 * - Uses IntersectionObserver for performance.
 */

type Props = {
  children: React.ReactNode;
  /** Reserve placeholder height to prevent layout shift (in px). Default = 1 (neutral). */
  minHeight?: number;
  /** Optionally define an aspect ratio placeholder (e.g., '16/9', '4/3'). */
  aspectRatio?: `${number}/${number}`;
  /** Animate only once (default true). */
  once?: boolean;
  /** Distance (viewport fraction) before triggering animation. */
  amount?: number;
};

export default function LazyShow({
  children,
  minHeight = 1,
  aspectRatio,
  once = true,
  amount = 0.2,
}: Props) {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          controls.start("visible");
          if (once) observer.disconnect();
        }
      },
      { threshold: amount }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls, once, amount]);

  const variants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      style={
        show
          ? undefined
          : aspectRatio
          ? { aspectRatio, minHeight }
          : { minHeight }
      }
    >
      {children}
    </motion.div>
  );
}
