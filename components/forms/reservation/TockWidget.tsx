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
  /* (a) Force “mobile” layout via matchMedia override… */
  /* …your existing matchMedia shim here… */

  /* (b) Stretch each dropdown “button” to fill 100% of the white card */
  #Tock_widget_container
    button.InlineWidgetDropDown-sectionDropdown,
  #Tock_widget_container
    button.TockDatePicker-container {
    width: 100% !important;
    border-radius: 8px !important;
    padding: 0.75rem 1rem !important;
    /* you can tweak font-size / line-height here if needed */
  }

  /* (c) Make “Book now” olive-green with white text */
  #Tock_widget_container
    .TockInlineButton-container {
    background-color: var(--olivea-olive) !important;
    color: white !important;
    border-radius: 8px !important;
    padding: 1rem 0 !important;
    text-align: center !important;
    font-weight: 600 !important;
  }
  /* ensure the label inside also turns white */
  #Tock_widget_container
    .TockInlineButton-container .MainLabelSpan {
    color: white !important;
  }

  /* (d) Hide “Powered by Tock” icon */
  #Tock_widget_container
    .TockSearchBar-tockIcon {
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