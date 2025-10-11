// app/(home)/[lang]/LcpPlate.tsx
export default function LcpPlate() {
  return (
    <picture>
      <source srcSet="/images/olivea-olive-lcp-mobile.avif" media="(max-width: 767px)" />
      <img
        id="lcp-plate"
        src="/images/olivea-olive-lcp.avif"
        alt="Olivea intro plate"
        width={1600}
        height={900}
        fetchPriority="high"
        decoding="async"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 60,                 // ⟵ ABOVE overlay so Chrome can pick it as LCP
          pointerEvents: "none",
          backgroundColor: "var(--olivea-olive)",
        }}
      />
    </picture>
  );
}
