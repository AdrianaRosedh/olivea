// components/scroll/ParallaxImage.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

type ParallaxImageProps = {
  src: string;
  alt: string;
  heightVh?: number;                 // wrapper height if no parent height
  speed?: number;                    // exposed for diagnostics
  className?: string;                // applied to <Image/>
  style?: StyleVars;                 // applied to wrapper
  onError?: ImageProps["onError"];

  /** === Performance controls (match CardParallax) === */
  sizes?: ImageProps["sizes"];               // responsive width hints
  priority?: ImageProps["priority"];         // true for the ONE LCP image
  fetchPriority?: ImageProps["fetchPriority"]; // "high" for the LCP
  loading?: ImageProps["loading"];           // "eager" for the LCP
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;

  fit?: "cover" | "contain";
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

  // perf props
  sizes,
  priority,
  fetchPriority,
  loading,
  quality,
  placeholder,
  blurDataURL,

  fit = "cover",
  objectPosition,
}: ParallaxImageProps) {
  // If caller passes "h-full", make wrapper fill parent so <Image fill/> has a box
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
        fetchPriority={fetchPriority}
        loading={priority ? "eager" : loading}
        quality={quality}
        placeholder={blurDataURL ? "blur" : placeholder}
        blurDataURL={blurDataURL}
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
