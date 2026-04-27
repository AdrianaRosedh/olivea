import StickyBlock from "@/components/scroll/StickyBlock";
import GalleryGrid from "@/components/ui/GalleryGrid";
import type { SectionProps } from "./types";
import { t } from "./md";

export default function GallerySection({ data, lang }: SectionProps) {
  const topImgs = (data.topImages ?? []) as Array<{ src: string; alt: { en: string; es: string } }>;
  const bottomImgs = (data.bottomImages ?? []) as Array<{ src: string; alt: { en: string; es: string } }>;

  const topImages = topImgs.map((img) => ({ src: img.src, alt: t(img.alt, lang) }));
  const bottomImages = bottomImgs.map((img) => ({ src: img.src, alt: t(img.alt, lang) }));

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
