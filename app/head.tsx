export default function Head() {
  const token = process.env.NEXT_PUBLIC_TOCK_JWT;
  return (
    <>
      {/* ─── TOCK INLINE WIDGET SNIPPET ───────────────────────── */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){ e.callMethod?e.callMethod.apply(e,arguments):e.queue.push(arguments) };
                t._tock||(t._tock=e);
                e.push=e; e.loaded=!0; e.version='1.0'; e.queue=[];
                var f=o.createElement(c); f.async=!0; f.src=k;
                var g=o.getElementsByTagName(c)[0];
                g.parentNode.insertBefore(f,g);
              }
            }(window,document,'script','https://www.exploretock.com/tock.js');
            tock('init','${token}');
          `,
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
