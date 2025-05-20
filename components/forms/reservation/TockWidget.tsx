"use client";

import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (window.tock) {
        window.tock("init", "olivea-farm-to-table");
        console.log("✅ Tock widget initialized");
      } else {
        console.error("❌ Tock script not loaded yet");
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* 1) make the overall Tock container a vertical flexbox */
        #Tock_widget_container {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          width: 100% !important;
          max-width: 500px !important;
          margin: 0 auto !important;
        }
            
        /* 2) target only the immediate TockSearchBar sections */
        #Tock_widget_container .TockSearchBar-container {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 1rem !important;
          padding: 2rem 1rem !important;
        }
            
        /* 3) make each direct child flex:1 so they all grow equally */
        #Tock_widget_container .TockSearchBar-container > * {
          flex: 1 1 auto !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
            
        /* 4) style only the outermost card’s corners */
        #Tock_widget_container > .TockSearchBar-container {
          background: transparent !important;
        }
        /* Let Tock keep its own inner corners—so we remove our previous radius hacks */
            
        /* 5) button styling stays the same */
        #Tock_widget_container button.TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 1rem !important;
        }
        #Tock_widget_container button.TockInlineButton-container:hover {
          opacity: 0.9 !important;
        }
            
        /* 6) hide “Powered by Tock” icon */
        #Tock_widget_container .TockSearchBar-tockIcon {
          display: none !important;
        }
      `}</style>



      <div className="flex-1 flex justify-center items-start p-6">
        <div className="p-6 bg-white rounded-xl w-full max-w-lg">
          <div
            id="Tock_widget_container"
            data-tock-display-mode="Inline"
            data-tock-widget="data-tock-offering"
            data-tock-offering-id="528232"
            data-tock-color-mode="White"
            data-tock-locale="es-mx"
            data-tock-timezone="America/Tijuana"
          />
        </div>
      </div>
    </>
  );
}