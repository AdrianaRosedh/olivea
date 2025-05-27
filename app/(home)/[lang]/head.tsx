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
      <link
        rel="preload"
        href="/videos/homepage-temp.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="low"
      />
    </>
  );
}
