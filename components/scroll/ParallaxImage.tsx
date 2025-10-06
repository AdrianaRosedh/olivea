// components/scroll/ParallaxImage.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

type ParallaxImageProps = {
  src: string;
  alt: string;
  /** Used only if parent surface didn't provide a height */
  heightVh?: number;
  /** Exposed for future effect / diagnostics */
  speed?: number;
  /** Applied to <Image/> (not wrapper) */
  className?: string;
  /** Applied to wrapper */
  style?: StyleVars;
  onError?: ImageProps["onError"];
  sizes?: ImageProps["sizes"];
  priority?: ImageProps["priority"];
  /** How the image should fit the surface */
  fit?: "cover" | "contain";
  /** Optional focal point (e.g., "50% 40%") */
  objectPosition?: string;
};

export default function ParallaxImage({
  src,
  alt,
  heightVh = 100,
  speed = 0.26,
  className,
  style,
  onError,
  sizes,
  priority,
  fit = "cover",                    // ← default: fill the card
  objectPosition,
}: ParallaxImageProps) {
  // If caller passes "h-full", make wrapper 100% high so <Image fill/> has a box.
  const wrapperStyle: StyleVars = {
    ...(className?.includes("h-full") ? { height: "100%" } : { height: `${heightVh}vh` }),
    ...style,
    ["--pi-speed"]: String(speed),
  };

  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div className="relative w-full" style={wrapperStyle} data-parallax-speed={speed}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={(e) => {
          console.error("[ParallaxImage] failed to load:", src);
          onError?.(e);
        }}
        className={cn("w-full h-full", fitClass, className)}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
