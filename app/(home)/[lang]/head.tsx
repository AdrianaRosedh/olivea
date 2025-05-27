// app/(home)/[lang]/head.tsx
export default function Head() {
  return (
    <>
      <link
        rel="preload"
        href="/videos/homepage-temp.webm"
        as="video"
        type="video/webm"
        fetchPriority="high"
      />
    </>
  );
}
