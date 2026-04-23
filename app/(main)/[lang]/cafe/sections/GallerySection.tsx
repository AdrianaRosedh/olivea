"use client";

import StickyBlock from "@/components/scroll/StickyBlock";
import GalleryGrid from "@/components/ui/GalleryGrid";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function GallerySection({ data, lang }: SectionProps) {
  const topImages = (data.topImages ?? []) as Array<{
    src: string;
    alt: { en: string; es: string };
  }>;
  const bottomImages = (data.bottomImages ?? []) as Array<{
    src: string;
    alt: { en: string; es: string };
  }>;

  return (
    <StickyBlock
      id="gallery"
      variant="top"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[92vw] md:mx-auto"
      title={null}
    >
      <GalleryGrid
        topImages={topImages.map((img) => ({
          src: img.src,
          alt: t(img.alt, lang),
        }))}
        bottomImages={bottomImages.map((img) => ({
          src: img.src,
          alt: t(img.alt, lang),
        }))}
      />
    </StickyBlock>
  );
}
