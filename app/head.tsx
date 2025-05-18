export default function Head() {
  return (
    <>
      {/* ─── CONTENT SECURITY POLICY ──────────────────── */}
      <meta
        httpEquiv="Content-Security-Policy"
        content={
          [
            `default-src 'self'`,
            // Tock’s JS loader lives on www.exploretock.com
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com`,
            // allow pulling in tock.css
            `style-src 'self' 'unsafe-inline' https://hotels.cloudbeds.com https://plugins.whistle.cloudbeds.com https://www.exploretock.com`,
            // frames and AJAX calls to Tock
            `frame-src https://hotels.cloudbeds.com https://www.exploretock.com`,
            `connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com`,
            // images still only self + data:
            `img-src 'self' data:`,
            // if Tock serves any fonts, allow them here too:
            // `font-src 'self' https://www.exploretock.com`
          ].join("; ")
        }
      />

      {/* ─── PAGE TITLE ───────────────────────────────── */}
      <title>Grupo Olivea</title>

      {/* ─── PRELOAD CRITICAL ASSETS ─────────────────── */}
      <link
        rel="preload"
        href="/videos/homepage-temp.mp4"
        as="video"
        type="video/mp4"
      />
      <link
        rel="preload"
        href="/assets/alebrije-1.svg"
        as="image"
        type="image/svg+xml"
      />
    </>
  );
}