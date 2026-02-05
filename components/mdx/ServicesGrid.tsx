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
    // Enter → active → leave
    offset: ["start 0.9", "end 0.15"],
  });

  // Deterministic per-card “signature” (stable + subtle variation)
  const sig = useMemo(() => {
    let h = 0;
    for (let i = 0; i < item.id.length; i++) {
      h = (h * 31 + item.id.charCodeAt(i)) >>> 0;
    }

    const r1 = (h % 997) / 997;
    const r2 = ((h * 7) % 991) / 991;
    const r3 = ((h * 13) % 983) / 983;

    const sz = r3 < 0.5 ? -1 : 1;

    // Elegant, editorial amplitudes (no 3D wobble)
    const zAmp = 0.45 + r2 * 0.45; // 0.45..0.90 degrees
    const yAmp = 16 + r1 * 12; // 16..28px lift
    const scaleFrom = 0.985 + r2 * 0.01; // 0.985..0.995

    return { sz, zAmp, yAmp, scaleFrom };
  }, [item.id]);

  // Small stagger so the grid feels choreographed, not chaotic
  const d = Math.min(index * 0.04, 0.14);

  /**
   * One-shot pulse:
   * - straight at start
   * - peaks around center
   * - settles to straight early
   * - stays straight after
   */
  const pulse = useTransform(
    scrollYProgress,
    [0 + d, 0.5 + d, 0.64 + d, 1],
    [0, 1, 0, 0],
    { clamp: true }
  );

  // Editorial motion: lift + tiny rotateZ + focus
  const yRaw = useTransform(pulse, [0, 1], [0, -sig.yAmp], { clamp: true });

  const scaleRaw = useTransform(
    scrollYProgress,
    [0, 0.28, 0.64, 1],
    [sig.scaleFrom, 1, 1, 1],
    { clamp: true }
  );

  const opacityRaw = useTransform(
    scrollYProgress,
    [0, 0.22, 0.64, 1],
    [0.7, 1, 1, 1],
    { clamp: true }
  );

  // Only rotateZ (no rotateX/rotateY => no “crooked grid” feeling)
  const rotateRaw = useTransform(pulse, [0, 1], [0, sig.sz * sig.zAmp], {
    clamp: true,
  });

  // Subtle focus polish
  const blurRaw = useTransform(pulse, [0, 1, 0], [2.5, 0, 0], {
    clamp: true,
  });

  // Sheen overlay intensity
  const sheenRaw = useTransform(pulse, [0, 1, 0], [0, 1, 0], { clamp: true });

  // ✅ Move this hook OUT of JSX (fixes conditional hook lint)
  const shadowRaw = useTransform(sheenRaw, [0, 1], [0, 0.55], { clamp: true });

  // Springs (smooth in scroll/snap containers)
  const SPR = { stiffness: 260, damping: 36, mass: 0.8 } as const;

  const y = useSpring(yRaw, SPR);
  const scale = useSpring(scaleRaw, SPR);
  const opacity = useSpring(opacityRaw, SPR);
  const rotate = useSpring(rotateRaw, SPR);

  return (
    <motion.article
      ref={ref}
      id={item.id}
      transition={{ duration: 0.35, ease: EASE }}
      style={
        reduce
          ? undefined
          : {
              y,
              opacity,
              scale,
              rotate,
              transformPerspective: 900,
              // blur is not springed on purpose (feels “optical”)
              filter: blurRaw,
            }
      }
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
      {/* Sheen / highlight (editorial luxury) */}
      {!reduce && (
        <motion.span
          aria-hidden
          style={{ opacity: sheenRaw }}
          className="
            pointer-events-none absolute inset-0
            bg-[radial-gradient(700px_280px_at_18%_0%,rgba(255,255,255,0.38),transparent_60%)]
            mix-blend-soft-light
          "
        />
      )}

      {/* Micro shadow lift (soft, not “card-y”) */}
      {!reduce && (
        <motion.span
          aria-hidden
          style={{ opacity: shadowRaw }}
          className="
            pointer-events-none absolute inset-0
            bg-[radial-gradient(520px_240px_at_50%_100%,rgba(0,0,0,0.14),transparent_65%)]
          "
        />
      )}

      <h3 className="font-semibold text-sm italic text-gray-700 mb-2 relative">
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
