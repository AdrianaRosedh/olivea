// components/mdx/CardGrid.tsx
"use client";
import Image, { type ImageProps } from "next/image";

type GridImg = {
  src: string;
  alt: string;
  sizes?: ImageProps["sizes"];
  loading?: ImageProps["loading"];
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  aspect?: `${number}/${number}`; // e.g., "4/3" (optional)
};

export default function CardGrid({
  imgs,
  cols = 2,
  gap = "gap-4",
}: {
  imgs: GridImg[];
  cols?: 2 | 3;
  gap?: string;
}) {
  const gridCols = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 ${gridCols} ${gap}`}>
      {imgs.map((it, i) => {
        const effectiveSizes = it.sizes ?? "(max-width: 768px) 100vw, 900px";
        const effectivePlaceholder: "blur" | "empty" =
          it.blurDataURL ? "blur" : (it.placeholder ?? "empty");

        // give each cell a box via aspect ratio (fallback 4/3)
        const aspect = it.aspect ?? "4/3";

        return (
          <div
            key={i}
            className="relative overflow-hidden rounded-[20px] ring-1 ring-black/10 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.28)]"
          >
            <div className="relative w-full" style={{ aspectRatio: aspect }}>
              <Image
                src={it.src}
                alt={it.alt}
                fill
                sizes={effectiveSizes}
                loading={it.loading}
                quality={it.quality}
                placeholder={effectivePlaceholder}
                blurDataURL={it.blurDataURL}
                className="object-cover"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
