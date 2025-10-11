// app/(home)/[lang]/LcpPlate.tsx
export default function LcpPlate() {
  return (
    <picture>
      <source srcSet="/images/olivea-olive-lcp-mobile.avif" media="(max-width: 767px)" />
      <img
        id="lcp-plate"            // ← add this
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
          zIndex: 0,
          backgroundColor: "var(--olivea-olive)",
          clipPath: "inset(0px 0px 0px 0px round 0px)", // initial: full screen
        }}
      />
    </picture>
  );
}