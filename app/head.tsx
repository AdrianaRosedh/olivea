// app/head.tsx
export default function Head() {
  return (
    <>
      {/* ─── CSP & PRELOADS ─────────────────────────────────── */}
      <meta
        httpEquiv="Content-Security-Policy"
        content={[
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hotels.cloudbeds.com https://www.exploretock.com",
          "frame-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
          "connect-src 'self' https://hotels.cloudbeds.com https://www.exploretock.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
        ].join("; ")}
      />
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

      {/* ─── TOCK.JS STUB ────────────────────────────────────── */}
      <script
        // inline because we control this exact snippet
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?
                    e.callMethod.apply(e,arguments):
                    e.queue.push(arguments)
                };
                e.queue=[]; e.loaded=!0; e.version='1.0';
                var f=o.createElement(c),
                    g=o.getElementsByTagName(c)[0];
                f.async=!0; f.src=k;
                g.parentNode.insertBefore(f,g);
              }
            }(window, document, 'script', 'https://www.exploretock.com/tock.js');
          `,
        }}
      />
    </>
  );
}