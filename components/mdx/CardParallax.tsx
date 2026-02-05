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
  surfaceClassName,
  fit = "cover",
  objectPosition,
  className,
  sizes = "100vw",
  loading,
  quality,
  placeholder = "empty",
  blurDataURL,
  priority = false,
}: {
  src: string;
  alt: string;

  speed?: number;
  hVh?: { mobile?: number; md?: number; lg?: number };
  aspect?: string;
  surfaceClassName?: string;
  fit?: "cover" | "contain";
  objectPosition?: string;
  className?: string;
  sizes?: ImageProps["sizes"];
  loading?: ImageProps["loading"];
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (!ready) {
      el.style.transform = "translateY(0px)";
      return;
    }

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
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      const offset = Math.max(-60, Math.min(60, -progress * (speed * 200)));
      el.style.transform = `translateY(${offset}px)`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        update();
        raf = 0;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, ready]);

  if (failed) return null;

  const surfaceStyle: StyleVars = {};
  let surfaceBaseClass = "relative w-full";

  if (aspect) {
    surfaceStyle.aspectRatio = aspect;
  } else {
    if (hVh?.mobile) surfaceStyle.height = `${hVh.mobile}vh`;
    if (hVh?.md) surfaceStyle["--card-md-h"] = `${hVh.md}vh`;
    if (hVh?.lg) surfaceStyle["--card-lg-h"] = `${hVh.lg}vh`;
    surfaceBaseClass = "relative w-full md:card-md lg:card-lg";
  }

  const effectivePlaceholder: "blur" | "empty" = blurDataURL ? "blur" : placeholder;

  // Let Next manage priority images (preload + eager). Only set loading for non-priority.
  const effectiveLoading: ImageProps["loading"] = priority ? undefined : loading;

  return (
    <div
      className={surfaceClassName ? `relative w-full ${surfaceClassName}` : surfaceBaseClass}
      style={surfaceStyle}
    >
      <div
        ref={wrapRef}
        className={["absolute -inset-px will-change-transform", className] // ✅ fixed
          .filter(Boolean)
          .join(" ")}
        style={{ borderRadius: "inherit" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          {...(effectiveLoading ? { loading: effectiveLoading } : {})}
          fetchPriority={priority ? "high" : undefined}
          quality={quality}
          placeholder={effectivePlaceholder}
          blurDataURL={blurDataURL}
          onLoadingComplete={(img) => {
            // ✅ Unlock parallax after decode (more stable on slow devices)
            if (img?.decode) {
              img.decode().catch(() => {}).finally(() => setReady(true));
            } else {
              setReady(true);
            }
          }}
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
