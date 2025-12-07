"use client";

import ParallaxImage from "@/components/scroll/ParallaxImage";

type ImageCardProps = {
  src: string;
  alt: string;
  heightVh?: number;
  speed?: number;
  objectPosition?: string;
  className?: string; // extra classes for wrapper if needed
};

export default function ImageCard({
  src,
  alt,
  heightVh = 56,
  speed = 0.22,
  objectPosition = "50% 50%",
  className,
}: ImageCardProps) {
  return (
    <div
      className={[
        "relative mt-8 w-full max-w-[1100px] mx-auto",
        "overflow-hidden rounded-[28px]",
        "ring-1 ring-black/10",
        "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ParallaxImage
        src={src}
        alt={alt}
        heightVh={heightVh}
        speed={speed}
        fit="cover"
        objectPosition={objectPosition}
      />
    </div>
  );
}
