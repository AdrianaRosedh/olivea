"use client";

import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    const realMM = window.matchMedia;
    window.matchMedia = (query: string) => {
      if (query.includes("max-width") && /\d+/.test(query)) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        };
      }
      return realMM(query);
    };

    const t = setTimeout(() => {
      if (window.tock) window.tock("init", "olivea-farm-to-table");
    }, 200);

    return () => {
      clearTimeout(t);
      window.matchMedia = realMM;
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        /* force “mobile” layout */
        /* …your existing mobile-shim CSS… */

        /* custom Book-now button green */
        #Tock_widget_container .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
        }
        #Tock_widget_container .TockInlineButton-container .MainLabelSpan {
          color: white !important;
        }
      `}</style>

      <div className="flex-1 flex justify-center items-start p-6 overflow-hidden">
        <div className="p-6 bg-white rounded-xl w-full max-w-lg overflow-hidden">
          <div
            id="Tock_widget_container"
            data-tock-display-mode="Inline"
            data-tock-widget="data-tock-offering"
            data-tock-offering-id="528232"
            data-tock-color-mode="White"
            data-tock-locale="es-mx"
            data-tock-timezone="America/Tijuana"
            style={{ width: "100%", minHeight: "400px" }}
          />
        </div>
      </div>
    </>
  );
}
