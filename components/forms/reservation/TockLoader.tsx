// components/forms/reservation/TockLoader.tsx
"use client";

import Script from "next/script";

export default function TockLoader() {
  return (
    <>
      <Script
        id="tock-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?
                    e.callMethod.apply(e,arguments):
                    e.queue.push(arguments)
                };
                t._tock||(t._tock=e),
                e.push=e,e.loaded=!0,e.version='1.0',e.queue=[];
                var f=o.createElement(c);
                f.async=!0,f.src=k;
                var g=o.getElementsByTagName(c)[0];
                g.parentNode.insertBefore(f,g)
              }
            }(
              window,document,'script',
              'https://www.exploretock.com/tock.js'
            );
            tock('init', 'olivea-farm-to-table');
          `,
        }}
      />
    </>
  );
}
