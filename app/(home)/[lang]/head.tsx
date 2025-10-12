// app/(home)/[lang]/head.tsx
export default function Head() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/olivea-olive-lcp.avif"
        imageSrcSet="/images/olivea-olive-lcp-mobile.avif 767w, /images/olivea-olive-lcp.avif 1200w"
        imageSizes="100vw"
      />
    </>
  );
}
