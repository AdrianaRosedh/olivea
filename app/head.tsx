// app/head.tsx
export default function Head() {
  return (
    <>
      {/* ─── Load & init Tock as early as possible ─────────────────────────────────── */}
      <script src="https://www.exploretock.com/tock.js" defer />
      <script
        // inline init with your widget-builder JWT
        dangerouslySetInnerHTML={{
          __html: `tock('init','eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJidXNpbmVzc0lkIjoiMzc0OTkiLCJ0eXBlIjoiV0lER0VUX0JVSUxERVIiLCJpYXQiOjE3NDc1Mzc4MzV9.l3nMRBi3EDY-V5_y1zX8L9hpgUHk59M89edcU6x3nK4');`,
        }}
      />

      <title>Grupo Olivea</title>
      <link
        rel="preload"
        href="/videos/homepage-temp.mp4"
        as="video"
        type="video/mp4"
      />
      <link
        rel="preload"
        href="/assets/alebrije-1.svg"
        as="image"
        type="image/svg+xml"
      />
    </>
  );
}