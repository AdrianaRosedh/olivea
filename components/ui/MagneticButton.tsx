// components/ui/MagneticButton.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { m, useMotionValue, useTransform, animate } from "framer-motion";

type Preset = "classic" | "subtle";

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disableMagnet?: boolean;
  preset?: Preset;

  /** max travel distance in px (outer wrapper) */
  magnetDistancePx?: number;

  /** spring tuning for outer travel */
  stiffness?: number;
  damping?: number;

  /** label hover scale (classic only by default) */
  hoverScale?: number;

  /** how much the label follows the magnet (0..1), default 0.22 */
  followRatio?: number;

  /** disable 3D tilt on label (defaults: classic=true, subtle=false) */
  tilt?: boolean;

  /** disable label scaling (defaults: classic=true, subtle=false) */
  scaleText?: boolean;

  textClassName?: string;
  ariaLabel?: string;
};

export default function MagneticButton({
  className = "",
  textClassName = "",
  ariaLabel,
  disableMagnet,
  preset = "subtle",
  magnetDistancePx,
  stiffness,
  damping,
  hoverScale,
  followRatio,
  tilt,
  scaleText,
  onClick,
  children,
  ...rest
}: MagneticButtonProps) {
  /** ── presets ── */
  const PRESETS: Record<
    Preset,
    { dist: number; stiff: number; damp: number; hover: number; follow: number; tilt: boolean; scaleText: boolean }
  > = {
    classic: { dist: 12, stiff: 200, damp: 16, hover: 1.07, follow: 0.35, tilt: true,  scaleText: true },
    subtle:  { dist:  4, stiff: 260, damp: 28, hover: 1.01, follow: 0.18, tilt: false, scaleText: false },
  };

  const p = PRESETS[preset];

  const dist = magnetDistancePx ?? p.dist;
  const stiff = stiffness ?? p.stiff;
  const damp = damping ?? p.damp;
  const hScale = hoverScale ?? p.hover;

  const follow = followRatio ?? p.follow;
  const tiltEnabled = tilt ?? p.tilt;
  const scaleEnabled = scaleText ?? p.scaleText;

  /** ── env ── */
  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const isFirefox =
    typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

  // Firefox tends to feel “jittery” with large pointer-tracked transforms
  const maxShift = isFirefox ? Math.min(dist, preset === "classic" ? 9 : 4) : dist;

  const enabled = !disableMagnet && !isReduced && maxShift > 0;

  /** ── motion values (always created) ── */
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);

  const btnRef = useRef<HTMLButtonElement>(null);

  // Keep one animation per axis (avoid stacking springs on fast pointermove)
  const animX = useRef<ReturnType<typeof animate> | null>(null);
  const animY = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = btnRef.current;
    if (!el) return;

    let rect = el.getBoundingClientRect();
    let over = false;
    let raf = 0;

    const stopAnims = () => {
      animX.current?.stop?.();
      animY.current?.stop?.();
      animX.current = null;
      animY.current = null;
    };

    const onEnter = () => {
      over = true;
      rect = el.getBoundingClientRect();
    };

    const onMove = (e: PointerEvent) => {
      if (!over) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // recalc if layout shifted (rare, but helps during scroll/zoom)
        // (rect updated on enter; you can uncomment to update more often)
        // rect = el.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));

        const targetX = nx * maxShift;
        const targetY = ny * maxShift;

        stopAnims();
        animX.current = animate(tx, targetX, { type: "spring", stiffness: stiff, damping: damp });
        animY.current = animate(ty, targetY, { type: "spring", stiffness: stiff, damping: damp });
      });
    };

    const onLeave = () => {
      over = false;
      cancelAnimationFrame(raf);
      stopAnims();
      animX.current = animate(tx, 0, { type: "spring", stiffness: stiff, damping: damp });
      animY.current = animate(ty, 0, { type: "spring", stiffness: stiff, damping: damp });
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      stopAnims();
    };
  }, [enabled, tx, ty, maxShift, stiff, damp]);

  /** ── derived motion for label ── */
  // inner translation (parallax): a fraction of outer tx/ty
  const innerX = useTransform(tx, (v) => v * follow);
  const innerY = useTransform(ty, (v) => v * follow);

  // tilt is elegant for “classic”, but too playful for “subtle”
  const textRotateY = useTransform(tx, [-maxShift, maxShift], tiltEnabled ? [-3, 3] : [0, 0]);
  const textRotateX = useTransform(ty, [-maxShift, maxShift], tiltEnabled ? [3, -3] : [0, 0]);

  // scale: only if enabled (defaults off for subtle)
  const textScale = useTransform(tx, [-maxShift, maxShift], scaleEnabled ? [1, hScale] : [1, 1]);

  // Tap scale should never feel “bouncy”
  const tapScale = useMemo(() => Math.max(0.965, hScale - 0.06), [hScale]);

  /** ── render ── */
  if (!enabled) {
    return (
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={className}
        {...rest}
      >
        <span className={textClassName}>{children}</span>
      </button>
    );
  }

  return (
    <m.span style={{ display: "inline-block", x: tx, y: ty, willChange: "transform" }}>
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={className}
        {...rest}
      >
        <m.span
          className={textClassName}
          style={{
            x: innerX,
            y: innerY,
            rotateX: textRotateX,
            rotateY: textRotateY,
            scale: textScale,
            display: "inline-block",
            willChange: "transform",
            transformStyle: tiltEnabled ? ("preserve-3d" as const) : undefined,
          }}
          whileTap={{ scale: tapScale }}
          transition={{
            type: "spring",
            stiffness: stiff,
            damping: Math.max(18, damp + 2),
          }}
        >
          {children}
        </m.span>
      </button>
    </m.span>
  );
}