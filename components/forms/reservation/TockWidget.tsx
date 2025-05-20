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
        #Tock_widget_container {
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          width: 100% !important;
          min-height: 400px !important;
        }

        .TockWidget-container {
          width: 100% !important;
          max-width: 400px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
        }

        .TockSearchBar-container {
          flex-direction: column !important;
          width: 100% !important;
          gap: 12px !important;
        }

        .InlineWidgetDropDown-section,
        .TockDropdown-container,
        .InlineWidget-dropdownContainer {
          width: 100% !important;
        }

        .InlineWidgetDropDown-sectionDropdown,
        .TockDatePicker-container,
        .InlineWidgetDropDown-sectionDropdown {
          width: 100% !important;
          border-radius: 12px !important;
        }

        .TockInlineButton {
          width: 100% !important;
        }

        /* Custom Button */
        .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          font-weight: bold !important;
          border-radius: 12px !important;
          padding: 10px !important;
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