// app/(home)/[lang]/FixedLCP.tsx
/* eslint-disable @next/next/no-img-element */
export default function FixedLCP() {
  // 1×1 SVG scaled to fill, using your olive brand color
  const solidSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none">
         <rect width="1" height="1" fill="#5a6852"/>
       </svg>`
    );

  return (
    <div
      className="fixed-lcp"
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        userSelect: "none",
        // belt & suspenders to avoid any flash before the element paints
        backgroundColor: "var(--olivea-olive)",
        width: "100vw",
        height: "100dvh",
      }}
    >
      <img
        src={solidSvg}
        alt=""
        // fetchPriority doesn't matter for data URIs, but harmless to leave out
        decoding="async"
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />
    </div>
  );
}
