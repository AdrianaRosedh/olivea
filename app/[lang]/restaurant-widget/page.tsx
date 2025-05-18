// app/[lang]/restaurant-widget/page.tsx
"use client";

import Script from "next/script";

export default function RestaurantWidgetPage() {
  return (
    <>
      {/* 1) Same Tock stub + init you use in the modal */}
      <Script
        id="tock-init-standalone"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(t,o,c,k){
              if(!t.tock){
                var e=t.tock=function(){
                  e.callMethod?e.callMethod.apply(e,arguments):e.queue.push(arguments);
                };
                t._tock||(t._tock=e),e.push=e,e.loaded=!0,e.version='1.0',e.queue=[];
                var f=o.createElement(c);f.async=!0;f.src=k;
                var g=o.getElementsByTagName(c)[0];
                g.parentNode.insertBefore(f,g);
              }
            }(window,document,'script','https://www.exploretock.com/tock.js');
            tock('init','olivea-farm-to-table');
          `,
        }}
      />

      {/* 2) A “Standard”‐mode container so you can see the full inline scheduler */}
      <div
        id="Tock_widget_container"
        data-tock-display-mode="Standard"
        data-tock-color-mode="Blue"
        data-tock-locale="es-mx"
        data-tock-timezone="America/Tijuana"
        style={{ width: "100%", height: "100vh" }}
      />
    </>
  );
}
