// app/(home)/[lang]/FixedLCP.tsx
export default function FixedLCP() {
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
        backgroundColor: "var(--olivea-olive)",
        width: "100vw",
        height: "100dvh",
      }}
    >
      <picture>
        {/* Mobile AVIF */}
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet="/images/olivea-olive-lcp-mobile.avif"
          sizes="100vw"
        />

        {/* Desktop default AVIF */}
        <img
          src="/images/olivea-olive-lcp.avif"
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </picture>
    </div>
  );
}
