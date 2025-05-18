// app/head.tsx
export default function Head() {
  return (
    <>
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