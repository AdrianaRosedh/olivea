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
        /* Main Container */
        #Tock_widget_container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .TockSearchBar-container {
          flex-direction: column !important;
          width: 100% !important;
          gap: 12px !important;
        }

        .InlineWidgetDropDown-section,
        .TockDropdown-container,
        .InlineWidget-dropdownContainer,
        .TockInlineButton {
          width: 100% !important;
        }

        .InlineWidgetDropDown-section button,
        .TockDropdown-container button,
        .InlineWidget-dropdownContainer button,
        .TockInlineButton-container {
          width: 100% !important;
          padding: 14px 10px !important;
          font-size: 16px !important;
          text-align: center !important;
          justify-content: center !important;
        }

        /* Adjust text to match Hotel look */
        .MainLabelLabel,
        .MainLabelSpan {
          font-size: 16px !important;
        }

        /* Button style */
        .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          border-radius: 12px !important;
          font-weight: bold !important;
          padding: 14px !important;
        }

        /* Add elegant padding within the white container */
        .TockWidget-container {
          padding: 16px !important;
        }

        @media (max-width: 768px) {
          .TockSearchBar-container {
            gap: 8px !important;
          }

          .InlineWidgetDropDown-section button,
          .TockDropdown-container button,
          .InlineWidget-dropdownContainer button {
            padding: 10px 8px !important;
            font-size: 15px !important;
          }

          .TockInlineButton-container {
            padding: 12px !important;
          }
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