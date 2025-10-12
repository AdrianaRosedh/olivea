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
      }}
    >
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/olivea-olive-lcp-mobile.avif" type="image/avif" />
        <img
          src="/images/olivea-olive-lcp.avif"
          alt=""
          decoding="async"
          fetchPriority="high"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </picture>
    </div>
  );
}
