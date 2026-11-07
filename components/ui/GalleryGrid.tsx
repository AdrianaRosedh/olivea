"use client";

import { useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";
import GalleryViewer, { TILE_QUALITY, TILE_SIZES } from "./GalleryViewer";
import { useUiText } from "@/lib/uiText/context";
import type { Lang } from "@/lib/i18n";

export type GalleryImage = {
  src: string;
  alt: string;
};

export default function GalleryGrid({
  lang,
  topImages,
  bottomImages,
}: {
  lang: Lang;
  topImages: GalleryImage[];
  bottomImages: GalleryImage[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Clicking a photo opens it large in the viewer; both rows browse as one set.
  const all = [...topImages, ...bottomImages];
  const [viewing, setViewing] = useState<number | null>(null);
  const [aspects, setAspects] = useState<number[]>([]);
  // Read each tile's real proportions (they're already loaded) so the viewer
  // can size the photo and request the right file before it arrives.
  const open = (i: number) => {
    const imgs = containerRef.current?.querySelectorAll<HTMLImageElement>("button img") ?? [];
    setAspects(Array.from(imgs, (im) => (im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : 0)));
    setViewing(i);
  };
  const t = useUiText(lang);
  const openLabel = t("editorial.gallery.open");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  /**
   * ✅ “Infinite” feel:
   * Start with the first card already partially off-screen.
   * (Remove the empty spacer so the wrapper ring never shows on blank space.)
   */
  const topX = useTransform(scrollYProgress, [0, 1], ["-18%", "-38%"]);
  const bottomX = useTransform(scrollYProgress, [0, 1], ["-30%", "-10%"]);

  return (
    <div ref={containerRef} className="w-full py-10 md:py-12">
      {/* Rounded boxed mask that contains the horizontal motion */}
      <div
        className="
          relative
          overflow-hidden
          rounded-[28px] md:rounded-[34px]
          bg-[#e7eae1]/25
          px-6
        "
        style={{
          // smoother clipping under transforms
          clipPath: "inset(0 round 28px)",
        }}
      >
        {/* clip-path radius bump on desktop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{ clipPath: "inset(0 round 34px)" }}
        />

        {/* Top row */}
        <motion.div
          style={{ x: topX }}
          className="
            flex gap-6 w-max py-0
            pr-[30vw] md:pr-[18vw]
          "
        >
          {topImages.map((img, i) => (
            <button
              type="button"
              key={`top-${img.src}-${i}`}
              onClick={() => open(0 + i)}
              aria-label={img.alt ? `${openLabel}: ${img.alt}` : openLabel}
              data-photo-frame="" className="
                group block text-left outline-none
                focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--olivea-olive)
                relative
                min-w-[75vw] md:min-w-[35vw]
                h-[50vh]
                overflow-hidden
                rounded-3xl md:rounded-[28px]
                bg-[#e7eae1]
              "
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes={TILE_SIZES}
                quality={TILE_QUALITY}
                priority={i === 0}
              />
            </button>
          ))}
        </motion.div>

        {/* Bottom row */}
        <motion.div
          style={{ x: bottomX }}
          className="
            flex gap-6 w-max mt-8 md:mt-10 pb-0
            pr-[30vw] md:pr-[18vw]
          "
        >
          {bottomImages.map((img, i) => (
            <button
              type="button"
              key={`bottom-${img.src}-${i}`}
              onClick={() => open(topImages.length + i)}
              aria-label={img.alt ? `${openLabel}: ${img.alt}` : openLabel}
              data-photo-frame="" className="
                group block text-left outline-none
                focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--olivea-olive)
                relative
                min-w-[75vw] md:min-w-[35vw]
                h-[50vh]
                overflow-hidden
                rounded-3xl md:rounded-[28px]
                bg-[#e7eae1]
              "
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes={TILE_SIZES}
                quality={TILE_QUALITY}
              />
            </button>
          ))}
        </motion.div>
      </div>

      <GalleryViewer
        lang={lang}
        images={all}
        index={viewing}
        onIndex={setViewing}
        onClose={() => setViewing(null)}
        aspects={aspects}
      />
    </div>
  );
}
