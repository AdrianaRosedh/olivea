"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

export type ServiceItem = {
  id: string;
  title: string;
  text: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// nearest scroll container (snap container / ScrollLimiter wrapper)
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  let p: HTMLElement | null = el.parentElement;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if (oy === "auto" || oy === "scroll" || oy === "overlay") return p;
    p = p.parentElement;
  }
  return null;
}

function ServiceCard({
  item,
  index,
  containerRef,
}: {
  item: ServiceItem;
  index: number;
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    // Enter → active → leave (tune these for more/less “solo” tilt)
    offset: ["start 0.9", "end 0.15"],
  });

  // Wave intensity: 0 -> 1 -> 0 as the card passes the sweet spot
  const wave = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  // Deterministic per-card “tilt signature” (stable + different per id)
  const sig = useMemo(() => {
    let h = 0;
    for (let i = 0; i < item.id.length; i++) {
      h = (h * 31 + item.id.charCodeAt(i)) >>> 0;
    }

    const r1 = (h % 997) / 997; // 0..1
    const r2 = ((h * 7) % 991) / 991;
    const r3 = ((h * 13) % 983) / 983;

    const sx = r1 < 0.5 ? -1 : 1; // rotateX sign
    const sy = r2 < 0.5 ? -1 : 1; // rotateY sign
    const sz = r3 < 0.5 ? -1 : 1; // rotateZ sign

    // subtle amplitude variation (kept elegant)
    const ax = 0.9 + r2 * 1.0; // 0.9..1.9
    const ay = 0.8 + r3 * 1.0; // 0.8..1.8
    const az = 0.9 + r1 * 1.1; // 0.9..2.0

    // tiny unique drift per card (still cohesive)
    const yAmp = 8 + r1 * 10; // 8..18

    // optional: micro “settle” differences
    const scaleFrom = 0.992 + r2 * 0.004; // 0.992..0.996

    return { sx, sy, sz, ax, ay, az, yAmp, scaleFrom };
  }, [item.id]);

  // Editorial settling as it becomes “active”
  const yRaw = useTransform(wave, [0, 1], [sig.yAmp, 0]);
  const opacityRaw = useTransform(wave, [0, 1], [0.55, 1]);
  const scaleRaw = useTransform(wave, [0, 1], [sig.scaleFrom, 1]);

  // Tilt wave: strongest near the middle of the card’s journey
  const rotateRaw = useTransform(wave, [0, 1], [sig.sz * sig.az, 0]);
  const rotateXRaw = useTransform(wave, [0, 1], [sig.sx * sig.ax, 0]);
  const rotateYRaw = useTransform(wave, [0, 1], [sig.sy * sig.ay, 0]);

  // Spring so it never jitters in snap/scroll containers
  const SPR = { stiffness: 220, damping: 34, mass: 0.85 } as const;

  const y = useSpring(yRaw, SPR);
  const opacity = useSpring(opacityRaw, SPR);
  const scale = useSpring(scaleRaw, SPR);
  const rotate = useSpring(rotateRaw, SPR);
  const rotateX = useSpring(rotateXRaw, SPR);
  const rotateY = useSpring(rotateYRaw, SPR);

  return (
    <motion.article
      ref={ref}
      id={item.id}
      style={
        reduce
          ? undefined
          : {
              y,
              opacity,
              scale,
              rotate,
              rotateX,
              rotateY,
              transformPerspective: 900,
            }
      }
      // ✅ no hover at all
      transition={{ duration: 0.35, ease: EASE }}
      className="
        relative
        p-5 rounded-xl border border-[#dce3db]
        bg-[#e7eae1]
        shadow-sm
        scroll-mt-30
        overflow-hidden
        will-change-transform
      "
      aria-label={item.title}
      data-index={index}
    >
      <h3 className="font-semibold text-sm italic text-gray-700 mb-2">
        {item.title}
      </h3>

      <p className="text-sm text-gray-800 leading-relaxed relative">
        {item.text}
      </p>

      <span className="sr-only">{`Anchor: #${item.id}`}</span>
    </motion.article>
  );
}

export default function ServicesGrid({ items }: { items: ServiceItem[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Force a re-render once containerRef is discovered (so cards bind correctly)
  const [, bump] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const setContainer = () => {
      containerRef.current = getScrollParent(root);
      bump((n) => n + 1);
    };

    setContainer();
    window.addEventListener("resize", setContainer);
    return () => window.removeEventListener("resize", setContainer);
  }, []);

  return (
    <div ref={rootRef} className="relative mt-8">
      {/* ✅ left line removed */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <ServiceCard
            key={item.id}
            item={item}
            index={i}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}
