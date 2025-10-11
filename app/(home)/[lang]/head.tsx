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

      {/* Preload LCP plates (desktop + mobile) */}
      <link rel="preload" as="image" href="/images/olivea-olive-lcp.avif" fetchPriority="high" />
      <link
        rel="preload"
        as="image"
        href="/images/olivea-olive-lcp-mobile.avif"
        media="(max-width: 767px)"
        fetchPriority="high"
      />

      {/* Optional: poster used by the video, so it paints instantly when shown */}
      <link rel="preload" as="image" href="/images/hero.avif" />
    </>
  );
}
