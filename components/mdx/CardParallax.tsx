// components/mdx/CardParallax.tsx
"use client";

import React, { useState } from "react";
import CardFrame from "./CardFrame";
import ParallaxImage from "@/components/scroll/ParallaxImage";

type Width = "narrow" | "content" | "wide" | "bleed";
type Align = "center" | "left" | "right";
type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

export default function CardParallax({
  src,
  alt,
  widthVariant = "content",
  align = "center",
  speed = 0.26,
  heightVh = 100,
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
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  // Build wrapper style (either aspect or vh path)
  const surfaceStyle: StyleVars = {};
  let defaultSurfaceCls = "relative w-full";

  if (aspect) {
    surfaceStyle.aspectRatio = aspect;          // native CSS aspect-ratio
  } else {
    if (hVh?.mobile) surfaceStyle.height = `${hVh.mobile}vh`;
    if (hVh?.md)     surfaceStyle["--card-md-h"] = `${hVh.md}vh`;
    if (hVh?.lg)     surfaceStyle["--card-lg-h"] = `${hVh.lg}vh`;
    defaultSurfaceCls = "relative w-full md:card-md lg:card-lg"; // uses CSS helpers
  }

  return (
    <div className="my-6 md:my-8">
      <CardFrame width={widthVariant} align={align} className={frameClassName}>
        <div
          className={surfaceClassName ? `relative w-full ${surfaceClassName}` : defaultSurfaceCls}
          style={surfaceStyle}
        >
          <ParallaxImage
            src={src}
            alt={alt}
            heightVh={heightVh}
            speed={speed}
            className={className ?? "h-full"}
            onError={() => setFailed(true)}
            fit={fit}
            objectPosition={objectPosition}
          />
        </div>
      </CardFrame>
    </div>
  );
}
