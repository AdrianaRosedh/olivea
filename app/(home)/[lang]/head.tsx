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
      {/* keep font/icon preloads if you need them, but do NOT preload /videos/... here */}
      {/* example safe preload (fonts/images only): */}
      {/* <link rel="preload" href="/fonts/PlusJakartaSans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> */}
    </>
  );
}
