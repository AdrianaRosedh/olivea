// app/(home)/[lang]/head.tsx
export default function Head() {
  return (
    <>
      {/* Mobile LCP */}
      <link
        rel="preload"
        as="image"
        href="/images/olivea-olive-lcp-mobile.avif"
        media="(max-width: 767px)"
        {...({ fetchpriority: "high" } as Record<string, string>)}
      />

      {/* Desktop LCP */}
      <link
        rel="preload"
        as="image"
        href="/images/olivea-olive-lcp.avif"
        media="(min-width: 768px)"
        {...({ fetchpriority: "high" } as Record<string, string>)}
      />
    </>
  );
}
