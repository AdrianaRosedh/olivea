// app/(home)/[lang]/head.tsx
export default function Head() {
  return (
    <>
      <title>Olivea — Donde el huerto es la esencia</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta
        name="description"
        content="Olivea: Casa Olivea, Olivea Farm To Table y Olivea Café en Valle de Guadalupe."
      />

      {/* LCP poster preload */}
      <link
        rel="preload"
        as="image"
        href="/images/hero.jpg"
        fetchPriority="high"
        imageSrcSet="/images/hero.jpg 1x"
        imageSizes="98vw"
      />
    </>
  );
}
