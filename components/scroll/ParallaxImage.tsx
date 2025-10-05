"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef } from "react";

type Axis = "y" | "x";
type Range2 = [number, number];

type Props = {
  src: string;
  alt: string;
  heightVh?: number;
  axis?: Axis;                 // 'y' (default) or 'x'
  range?: Range2;              // px translate range; overrides speed
  speed?: number;              // fallback if no 'range' is provided
  scale?: Range2;              // e.g., [1.06, 1]
  opacity?: Range2;            // e.g., [0.9, 1]
  rotate?: Range2;             // degrees, e.g., [-1, 0]
  priority?: boolean;
  className?: string;
};

export default function ParallaxImage({
  src,
  alt,
  heightVh = 80,
  axis = "y",
  range,
  speed = 0.35,
  scale,
  opacity,
  rotate,
  priority = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Always call hooks in the same order — use identity ranges when a prop isn't provided.
  const translate = useTransform(
    scrollYProgress,
    [0, 1],
    (range ?? [speed * -120, speed * 120]) as Range2
  );
  const scaleT = useTransform(
    scrollYProgress,
    [0, 1],
    (scale ?? [1, 1]) as Range2
  );
  const opacityT = useTransform(
    scrollYProgress,
    [0, 1],
    (opacity ?? [1, 1]) as Range2
  );
  const rotateT = useTransform(
    scrollYProgress,
    [0, 1],
    (rotate ?? [0, 0]) as Range2
  );

  // Build style object; always include transforms (identity = no visible change)
  const style = useMemo(
    () => ({
      ...(axis === "y" ? { y: translate } : { x: translate }),
      scale: scaleT,
      opacity: opacityT,
      rotate: rotateT,
    }),
    [axis, translate, scaleT, opacityT, rotateT]
  );

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: `${heightVh}vh` }}
      aria-label={alt}
    >
      <motion.div style={style} className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
    </section>
  );
}
