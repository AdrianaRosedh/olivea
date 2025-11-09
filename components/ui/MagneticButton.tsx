"use client";

import React, { useEffect, useRef } from "react";
import { m, useMotionValue, useTransform, animate } from "framer-motion";

type Preset = "classic" | "subtle";

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disableMagnet?: boolean;
  preset?: Preset;
  magnetDistancePx?: number;
  stiffness?: number;
  damping?: number;
  hoverScale?: number;
  /** how much the label follows the magnet (0..1), default 0.35 */
  followRatio?: number;
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
  followRatio = 0.35,
  onClick,
  children,
  ...rest
}: MagneticButtonProps) {
  /** ── presets ── */
  const PRESETS: Record<Preset, { dist: number; stiff: number; damp: number; hover: number }> = {
    classic: { dist: 12, stiff: 200, damp: 16, hover: 1.07 },
    subtle:  { dist:  8, stiff: 260, damp: 22, hover: 1.03 },
  };
  const p = PRESETS[preset];
  const dist   = magnetDistancePx ?? p.dist;
  const stiff  = stiffness ?? p.stiff;
  const damp   = damping ?? p.damp;
  const hScale = hoverScale ?? p.hover;

  /** ── env ── */
  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const isFirefox =
    typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

  const maxShift = isFirefox ? Math.min(dist, preset === "classic" ? 9 : 6) : dist;
  const enabled = !disableMagnet && !isReduced && maxShift > 0;

  /** ── hooks (always called) ── */
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = btnRef.current;
    if (!el) return;

    let rect = el.getBoundingClientRect();
    let over = false;
    let raf = 0;

    const onEnter = () => {
      over = true;
      rect = el.getBoundingClientRect();
    };

    const onMove = (e: PointerEvent) => {
      if (!over) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
        animate(tx, nx * maxShift, { type: "spring", stiffness: stiff, damping: damp });
        animate(ty, ny * maxShift, { type: "spring", stiffness: stiff, damping: damp });
      });
    };

    const onLeave = () => {
      over = false;
      cancelAnimationFrame(raf);
      animate(tx, 0, { type: "spring", stiffness: stiff, damping: damp });
      animate(ty, 0, { type: "spring", stiffness: stiff, damping: damp });
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled, tx, ty, maxShift, stiff, damp]);

  /** ── derived motion for label (now follows) ── */
  // inner translation (parallax): a fraction of outer tx/ty
  const innerX = useTransform(tx, (v) => v * followRatio);
  const innerY = useTransform(ty, (v) => v * followRatio);
  // subtle tilt/scale still tied to motion
  const textRotateY = useTransform(tx, [-maxShift, maxShift], [-4, 4]);  // rotateY with horizontal move
  const textRotateX = useTransform(ty, [-maxShift, maxShift], [4, -4]);  // rotateX with vertical move
  const textScale   = useTransform(tx, [-maxShift, maxShift], [1, hScale]);

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
          }}
          whileTap={{ scale: Math.max(0.94, hScale - 0.09) }}
          transition={{ type: "spring", stiffness: stiff, damping: Math.max(14, damp - 4) }}
        >
          {children}
        </m.span>
      </button>
    </m.span>
  );
}