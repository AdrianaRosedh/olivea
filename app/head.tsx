// app/head.tsx
import Script from "next/script";

export default function Head() {
  return (
    <>
      {/* ─── CONTENT SECURITY POLICY ──────────────────── */}
      <meta
        httpEquiv="Content-Security-Policy"
        content={
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com; " +
          "frame-src https://hotels.cloudbeds.com https://www.exploretock.com; " +
          "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data:;"
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