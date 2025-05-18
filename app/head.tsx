// app/head.tsx
export default function Head() {
  return (
    <>
      {/* ─── CONTENT SECURITY POLICY ──────────────────── */}
      <meta
        httpEquiv="Content-Security-Policy"
        content={
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com; " +
          "frame-src https://hotels.cloudbeds.com https://www.exploretock.com; " +
          "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data:;"
        }
      />

      {/* ─── PAGE TITLE ───────────────────────────────── */}
      <title>Olivea</title>

      {/* ─── PRELOAD CRITICAL ASSETS ─────────────────── */}
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

      {/* ─── TOCK WIDGET LOADER STUB ─────────────────── */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod ? e.callMethod.apply(e,arguments) : e.queue.push(arguments)
                };
                t._tock||(t._tock=e), e.push=e, e.loaded=!0, e.version='1.0', e.queue=[];
                var f=o.createElement(c); f.async=!0; f.src=k;
                var g=o.getElementsByTagName(c)[0]; g.parentNode.insertBefore(f,g);
              }
            }(window,document,'script','https://www.exploretock.com/tock.js');
          `,
        }}
      />
    </>
  );
}