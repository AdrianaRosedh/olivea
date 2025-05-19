import Script from "next/script";

export default function Head() {
  return (
    <>
      <title>Grupo Olivea</title>

      {/* Tock Widget Script adapted correctly for Next.js */}
      <Script
        src="https://www.exploretock.com/tock.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.tock && typeof window.tock === "function") {
            window.tock("init", "olivea-farm-to-table");
          }
        }}
      />

      {/* Keep other links/preloads unchanged */}
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
