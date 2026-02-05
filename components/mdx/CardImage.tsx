// components/mdx/CardImage.tsx
"use client";

import Image, { type ImageProps } from "next/image";
import CardFrame from "./CardFrame";

type StyleVars = React.CSSProperties & Record<string, string | number | undefined>;

export default function CardImage({
  src,
  alt,
  widthVariant = "content",
  align = "center",
  hPx = { mobile: 220 },        // px heights per breakpoint
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
  widthVariant?: "narrow" | "content" | "wide" | "bleed";
  align?: "center" | "left" | "right";
  hPx?: { mobile?: number; md?: number; lg?: number };
  className?: string;
  frameClassName?: string;

  sizes?: ImageProps["sizes"];
  loading?: ImageProps["loading"];
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  priority?: boolean;
}) {
  const surfaceStyle: StyleVars = {};
  // inline base height
  if (hPx?.mobile) surfaceStyle.height = `${hPx.mobile}px`;
  // CSS vars for md/lg (so Tailwind utils can apply)
  if (hPx?.md) surfaceStyle["--card-md-h"] = `${hPx.md}px`;
  if (hPx?.lg) surfaceStyle["--card-lg-h"] = `${hPx.lg}px`;

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
        {/* Add utilities in your CSS: .md:card-md { height: var(--card-md-h) } .lg:card-lg { height: var(--card-lg-h) } */}
        <div className={`relative w-full md:card-md lg:card-lg`} style={surfaceStyle}>
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
            className={`w-full h-full object-cover ${className ?? ""}`}
          />
        </div>
      </CardFrame>
    </div>
  );
}
