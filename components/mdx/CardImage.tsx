// components/mdx/CardImage.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import CardFrame from "./CardFrame";
import { cn } from "@/lib/utils";

type Width = "narrow" | "content" | "wide" | "bleed";
type Align = "center" | "left" | "right";

type CardImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  widthVariant?: Width;
  align?: Align;
  /** fixed banner height (px) per breakpoint; omit for intrinsic height */
  hPx?: { mobile?: number; md?: number; lg?: number };
  caption?: string;
  frameClassName?: string;
};

export default function CardImage({
  alt,
  widthVariant = "content",
  align = "center",
  hPx,
  className,
  frameClassName,
  caption,
  sizes,
  ...img
}: CardImageProps) {
  const style: React.CSSProperties = {};
  if (hPx?.mobile) style.height = `${hPx.mobile}px`;
  if (hPx?.md || hPx?.lg) {
    // optional: you can add CSS helpers similar to CardParallax if needed
  }

  return (
    <figure className="my-6 md:my-8">
      <CardFrame width={widthVariant} align={align} className={frameClassName}>
        <div className="relative w-full md:h-auto" style={style}>
          <Image
            {...img}
            alt={alt}
            sizes={sizes ?? "(min-width:1024px) 900px, 92vw"}
            className={cn("w-full h-full object-cover", className)}  // fill by default
            priority={img.priority ?? false}
            fill
          />
        </div>
      </CardFrame>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-black/60">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
