"use client";

import CardImage from "./CardImage";

export default function CardGrid({ imgs }: { imgs: { src: string; alt: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {imgs.map(({ src, alt }) => (
        <CardImage key={src} src={src} alt={alt} widthVariant="content" align="center" />
      ))}
    </div>
  );
}
