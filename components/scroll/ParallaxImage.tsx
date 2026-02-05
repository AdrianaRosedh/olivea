// components/scroll/ParallaxImage.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

type ParallaxImageProps = {
  src: string;
  alt: string;
  heightVh?: number;
  speed?: number;
  className?: string;        // applied to <Image/>
  style?: StyleVars;         // applied to wrapper
  onError?: ImageProps["onError"];

  // perf props (optional per call)
  sizes?: ImageProps["sizes"];
  priority?: ImageProps["priority"];
  fetchPriority?: ImageProps["fetchPriority"];
  loading?: ImageProps["loading"];
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
  // Wrapper always has a real height
  const wrapperStyle: StyleVars = {
    ...(className?.includes("h-full") ? { height: "100%" } : { height: `${heightVh}vh` }),
    ...style,
    ["--pi-speed"]: String(speed),
  };

  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  // SAFETY DEFAULTS (computed inside the component)
  const effectiveSizes = sizes ?? "(max-width: 768px) 100vw, 900px";
  // If caller asked for blur but didn't supply data, use "empty" to avoid blank paint
  const effectivePlaceholder: "blur" | "empty" =
    blurDataURL ? "blur" : (placeholder ?? "empty");
  const effectiveLoading: ImageProps["loading"] = priority ? "eager" : loading;

  return (
    <div className="relative w-full" style={wrapperStyle} data-parallax-speed={speed}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={effectiveSizes}
        priority={priority}
        fetchPriority={fetchPriority}
        loading={effectiveLoading}
        quality={quality}
        placeholder={effectivePlaceholder}
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