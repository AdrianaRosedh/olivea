import StickyBlock from "@/components/scroll/StickyBlock";
import GalleryGrid from "@/components/ui/GalleryGrid";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function GallerySection({ data, lang }: SectionProps) {
  const images = (data.images ?? []) as Array<{ src: string; alt: { en: string; es: string } }>;
  const topImages = images.slice(0, 3).map((img) => ({
    src: img.src,
    alt: t(img.alt, lang),
  }));
  const bottomImages = images.slice(3).map((img) => ({
    src: img.src,
    alt: t(img.alt, lang),
  }));
  // Repeat first image if we need a 3rd bottom image (matches original MDX)
  if (bottomImages.length < 3 && topImages[0]) {
    bottomImages.push(topImages[0]);
  }

  return (
    <StickyBlock
      id="gallery"
      title={null}
      variant="top"
      className="pt-10 pb-6 md:pt-16 md:pb-12 snap-start"
      containerClassName="w-full md:max-w-[92vw] md:mx-auto"
    >
      <GalleryGrid topImages={topImages} bottomImages={bottomImages} />
    </StickyBlock>
  );
}
