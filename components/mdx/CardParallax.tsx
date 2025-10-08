// components/mdx/CardParallax.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  /** Default surface heights (vh) when no aspect is provided */
  hVh = { mobile: 46, md: 56 },
  /** Use an aspect ratio instead of vh heights (e.g. "3 / 4", "16 / 9") */
  aspect,
  /** Provide classes like "h-[56vh] md:h-[60vh]" if you prefer */
  surfaceClassName,
  /** Default to cover for cards so they fill frames */
  fit = "cover",
  objectPosition,
  className,
  frameClassName,

  /** New (optional): pass blur for instant paint */
  blurDataURL,
  /** New (optional): force LCP priority for this card */
  priority = false,
}: {
  src: string;
  alt: string;
  widthVariant?: Width;
  align?: Align;
  speed?: number;
  heightVh?: number;
  hVh?: { mobile?: number; md?: number; lg?: number };
  aspect?: string;
  surfaceClassName?: string;
  fit?: "cover" | "contain";
  objectPosition?: string;
  className?: string;
  frameClassName?: string;
  blurDataURL?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Respect reduced-motion and only transform a wrapper (keep Image static)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || speed === 0) {
      el.style.transform = "";
      return;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        el.style.transform = `translateY(${-(y * speed)}px)`;
        raf = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  if (failed) return null;

  // Build wrapper style (either aspect or vh path)
  const surfaceStyle: StyleVars = {};
  let defaultSurfaceCls = "relative w-full";

  if (aspect) {
    surfaceStyle.aspectRatio = aspect; // native CSS aspect-ratio
  } else {
    // Keep your original vh-based behavior for non-aspect cards
    if (hVh?.mobile) surfaceStyle.height = `${hVh.mobile}vh`;
    if (hVh?.md) surfaceStyle["--card-md-h"] = `${hVh.md}vh`;
    if (hVh?.lg) surfaceStyle["--card-lg-h"] = `${hVh.lg}vh`;
    defaultSurfaceCls = "relative w-full md:card-md lg:card-lg";
  }

  // Responsive width hints for the browser (tuned per variant)
  const sizes =
    widthVariant === "bleed"
      ? "100vw"
      : widthVariant === "wide"
      ? "(max-width: 768px) 100vw, 1100px"
      : widthVariant === "content"
      ? "(max-width: 768px) 100vw, 880px"
      : "(max-width: 768px) 100vw, 640px"; // narrow

  return (
    <div className="my-6 md:my-8">
      <CardFrame width={widthVariant} align={align} className={frameClassName}>
        <div
          className={surfaceClassName ? `relative w-full ${surfaceClassName}` : defaultSurfaceCls}
          style={surfaceStyle}
        >
          {/* Parallax wrapper (transform only) */}
          <div ref={wrapRef} className={["absolute inset-0 will-change-transform", className].filter(Boolean).join(" ")}>
            <Image
              src={src}
              alt={alt}
              fill
              // key perf bits:
              priority={priority}
              fetchPriority={priority ? "high" : undefined}
              sizes={sizes}
              placeholder={blurDataURL ? "blur" : undefined}
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
