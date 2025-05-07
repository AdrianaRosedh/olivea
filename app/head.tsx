export default function Head() {
  return (
    <>
      {/* Existing CSP (unchanged) */}
      <meta
        httpEquiv="Content-Security-Policy"
        content={[
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com",
          "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
          "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
        ].join("; ")}
      />

      {/* 🔥 Add Preload for critical homepage video */}
      <link
        rel="preload"
        href="/videos/homepage-temp.mp4"
        as="video"
        type="video/mp4"
      />

      {/* 🔥 Add Preload for the main SVG logo */}
      <link
        rel="preload"
        href="/assets/alebrije-1.svg"
        as="image"
        type="image/svg+xml"
      />
    </>
  );
}