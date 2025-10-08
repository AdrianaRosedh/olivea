// components/mdx/CardParallax.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import CardFrame from "./CardFrame";

type Width = "narrow" | "content" | "wide" | "bleed";
type Align = "center" | "left" | "right";
type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

export default function CardParallax({
  src,
  alt,
  widthVariant = "content",
  align = "center",
  speed = 0.26,
  hVh = { mobile: 46, md: 56 },
  aspect,
  surfaceClassName,
  fit = "cover",
  objectPosition,
  className,
  frameClassName,

  // NEW perf props
  sizes,
  loading,
  quality,
  placeholder,
  blurDataURL,
  priority = false,
}: {
  src: string;
  alt: string;
  widthVariant?: Width;
  align?: Align;
  speed?: number;
  hVh?: { mobile?: number; md?: number; lg?: number };
  aspect?: string;
  surfaceClassName?: string;
  fit?: "cover" | "contain";
  objectPosition?: string;
  className?: string;
  frameClassName?: string;

  sizes?: ImageProps["sizes"];
  loading?: ImageProps["loading"];
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // parallax wrapper
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
      // Use element’s viewport position to compute a modest offset
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress ~ -1 at top, 0 in middle, +1 near bottom
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      // scale by speed and clamp to avoid big jumps
      const offset = Math.max(-60, Math.min(60, -progress * (speed * 200))); // ~±60px max
      el.style.transform = `translateY(${offset}px)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = 0;
      });
    };

    // initial paint
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

  // surface height (vh) or aspect
  const surfaceStyle: StyleVars = {};
  let defaultSurfaceCls = "relative w-full";
  if (aspect) {
    surfaceStyle.aspectRatio = aspect;
  } else {
    if (hVh?.mobile) surfaceStyle.height = `${hVh.mobile}vh`;
    if (hVh?.md) surfaceStyle["--card-md-h"] = `${hVh.md}vh`;
    if (hVh?.lg) surfaceStyle["--card-lg-h"] = `${hVh.lg}vh`;
    defaultSurfaceCls = "relative w-full md:card-md lg:card-lg";
  }

  // width hints
  const sizesDefault =
    widthVariant === "bleed"
      ? "100vw"
      : widthVariant === "wide"
      ? "(max-width: 768px) 100vw, 1100px"
      : widthVariant === "content"
      ? "(max-width: 768px) 100vw, 880px"
      : "(max-width: 768px) 100vw, 640px";

  const effectiveSizes = sizes ?? sizesDefault;
  const effectivePlaceholder: "blur" | "empty" =
    blurDataURL ? "blur" : (placeholder ?? "empty");
  const effectiveLoading: ImageProps["loading"] = priority ? "eager" : loading;

  return (
    <div className="my-6 md:my-8">
      <CardFrame width={widthVariant} align={align} className={frameClassName}>
        <div
          className={surfaceClassName ? `relative w-full ${surfaceClassName}` : defaultSurfaceCls}
          style={surfaceStyle}
        >
          <div ref={wrapRef} className={["absolute inset-0 will-change-transform", className].filter(Boolean).join(" ")}>
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
              }}
            />
          </div>
        </div>
      </CardFrame>
    </div>
  );
}