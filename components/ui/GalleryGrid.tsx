"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Image from "next/image";

export type GalleryImage = {
  src: string;
  alt: string;
};

export default function GalleryGrid({
  topImages,
  bottomImages,
}: {
  topImages: GalleryImage[];
  bottomImages: GalleryImage[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
          ring-1 ring-black/10
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
            <div
              key={`top-${img.src}-${i}`}
              className="
                relative
                min-w-[75vw] md:min-w-[35vw]
                h-[50vh]
                overflow-hidden
                rounded-3xl md:rounded-[28px]
                ring-1 ring-black/10
                bg-[#e7eae1]
              "
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 75vw, 35vw"
                quality={80}
                priority={i === 0}
              />
            </div>
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
            <div
              key={`bottom-${img.src}-${i}`}
              className="
                relative
                min-w-[75vw] md:min-w-[35vw]
                h-[50vh]
                overflow-hidden
                rounded-3xl md:rounded-[28px]
                ring-1 ring-black/10
                bg-[#e7eae1]
              "
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 75vw, 35vw"
                quality={80}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
