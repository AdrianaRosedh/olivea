// components/mdx/CardParallax.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";

type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

export default function CardParallax({
  src,
  alt,
  speed = 0.26,
  hVh = { mobile: 46, md: 56, lg: undefined },
  aspect,
  surfaceClassName,                  // apply your clipping class (e.g., hero-pill or rounded-inherit) to this
  fit = "cover",
  objectPosition,
  className,                          // extra classes for the moving layer
  sizes,
  loading,
  quality,
  placeholder,
  blurDataURL,
  priority = false,
}: {
  src: string;
  alt: string;

  /** parallax speed, 0 disables */
  speed?: number;

  /** surface sizing: either use aspect OR vh heights */
  hVh?: { mobile?: number; md?: number; lg?: number };
  aspect?: string;

  /** classes for the SURFACE wrapper (this is usually where you pass your shape class) */
  surfaceClassName?: string;

  /** image fitting */
  fit?: "cover" | "contain";
  objectPosition?: string;

  /** classes for the MOVING layer */
  className?: string;

  /** image perf */
  sizes?: ImageProps["sizes"];
  loading?: ImageProps["loading"];
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parallax effect
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || speed === 0) {
      el.style.transform = "";
      return;
    }

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress ~ -1 at top, 0 mid, +1 bottom
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      const offset = Math.max(-60, Math.min(60, -progress * (speed * 200))); // clamp ±60px
      el.style.transform = `translateY(${offset}px)`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = 0;
      });
    };

    // initial
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  if (failed) return null;

  // Surface sizing (height via vh or aspect-ratio)
  const surfaceStyle: StyleVars = {};
  let surfaceBaseClass = "relative w-full";
  if (aspect) {
    surfaceStyle.aspectRatio = aspect;
  } else {
    if (hVh?.mobile) surfaceStyle.height = `${hVh.mobile}vh`;
    if (hVh?.md) surfaceStyle["--card-md-h"] = `${hVh.md}vh`;
    if (hVh?.lg) surfaceStyle["--card-lg-h"] = `${hVh.lg}vh`;
    // Use your existing utilities for responsive heights if present
    surfaceBaseClass = "relative w-full md:card-md lg:card-lg";
  }

  const effectiveSizes =
    sizes ??
    // sensible defaults by intent; override with `sizes` prop when needed
    "(max-width: 768px) 100vw, min(1200px, 100vw)";

  const effectivePlaceholder: "blur" | "empty" = blurDataURL ? "blur" : (placeholder ?? "empty");
  const effectiveLoading: ImageProps["loading"] = priority ? "eager" : loading;

  return (
    // SURFACE — this should receive your clipping class (e.g., hero-pill or rounded-inherit)
    <div className={surfaceClassName ? `relative w-full ${surfaceClassName}` : surfaceBaseClass} style={surfaceStyle}>
      {/* MOVING LAYER — overfill by 0.5px to avoid sub-pixel nicks during motion */}
      <div
        ref={wrapRef}
        className={["absolute -inset-[1px] will-change-transform", className].filter(Boolean).join(" ")}
        style={{ borderRadius: "inherit" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={effectiveSizes}
          priority={priority}
          loading={effectiveLoading}
          fetchPriority={priority ? "high" : undefined}
          quality={quality}
          placeholder={effectivePlaceholder}
          blurDataURL={blurDataURL}
          onError={() => setFailed(true)}
          style={{
            objectFit: fit,
            objectPosition: objectPosition ?? "50% 50%",
            borderRadius: "inherit",
          }}
        />
      </div>
    </div>
  );
}