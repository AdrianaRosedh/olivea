// app/(main)/[lang]/head.tsx
export default function Head() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/farm/hero.jpg"
        type="image/jpeg"
        imageSrcSet="/images/farm/hero.jpg 1600w"
        imageSizes="(max-width: 768px) 100vw, min(1600px, calc(100vw - var(--dock-left,220px) - var(--dock-right,96px) - 48px))"
      />
      <link
        rel="preload"
        as="image"
        href="/images/casa/hero.jpg"
        type="image/jpeg"
        imageSrcSet="/images/casa/hero.jpg 1600w"
        imageSizes="(max-width: 768px) 100vw, min(1600px, calc(100vw - var(--dock-left,220px) - var(--dock-right,96px) - 48px))"
      />
      <link
        rel="preload"
        as="image"
        href="/images/cafe/hero.jpg"
        type="image/jpeg"
        imageSrcSet="/images/cafe/hero.jpg 1600w"
        imageSizes="(max-width: 768px) 100vw, min(1600px, calc(100vw - var(--dock-left,220px) - var(--dock-right,96px) - 48px))"
      />
    </>
  );
}
