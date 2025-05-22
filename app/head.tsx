// app/head.tsx
export default function Head() {
  return (
    <>
      <link
        rel="preload"
        as="video"
        href="/videos/restaurant.mp4"
        type="video/mp4"
        media="(max-width: 767px)"
      />
      <link
        rel="preload"
        as="video"
        href="/videos/cafe.mp4"
        type="video/mp4"
        media="(max-width: 767px)"
      />
      <link
        rel="preload"
        as="video"
        href="/videos/casa.mp4"
        type="video/mp4"
        media="(max-width: 767px)"
      />
    </>
  );
}
