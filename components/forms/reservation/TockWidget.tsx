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
        /* make the outer container flex-col, full width */
        #Tock_widget_container {
          display: flex !important;
          justify-content: center !important;
          width: 100% !important;
        }

        /* drop the icon bar (powered-by) below, not beside */
        .TockSearchBar-container {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          width: 100% !important;
          max-width: 500px !important;   /* or whatever your white panel's inner max is */
          margin: 0 auto !important;
          gap: 1rem !important;
          box-sizing: border-box !important;
          padding: 2rem 1rem !important;
        }

        /* force each section to fill the column */
        .TockSearchBar-container > .InlineWidgetDropDown-section,
        .TockSearchBar-container > .TockDropdown-container,
        .TockSearchBar-container > .InlineWidget-dropdownContainer,
        .TockSearchBar-container > .TockInlineButton {
          width: 100% !important;
        }

        /* style each control wrapper */
        .InlineWidgetDropDown-sectionDropdown,
        .TockDatePicker-container,
        .InlineWidget-dropdownContainer,
        .TockInlineButton-container {
          border-radius: 0 !important;
          overflow: visible !important;
        }

        /* carve nice corners on the very top control */
        .InlineWidgetDropDown-sectionDropdown {
          border-top-left-radius: 12px !important;
          border-top-right-radius: 12px !important;
        }

        /* carve nice corners on the very bottom control (the button) */
        .TockInlineButton-container {
          border-bottom-left-radius: 12px !important;
          border-bottom-right-radius: 12px !important;
        }

        /* give each intermediate control a consistent border */
        .InlineWidgetDropDown-sectionDropdown,
        .TockDatePicker-container,
        .InlineWidget-dropdownContainer {
          border: 1px solid #e2e8f0 !important;
          padding: 0.75rem 1rem !important;
          background: #fafafa !important;
        }

        /* text styling */
        .MainLabelLabel,
        .MainLabelSpan {
          font-family: "Plus Jakarta Sans", sans-serif !important;
          color: #374151 !important;
        }

        /* restyle the “Book now” button */
        .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          font-weight: 600 !important;
          padding: 1rem !important;
          text-align: center !important;
          border: none !important;
          box-shadow: none !important;
        }
        .TockInlineButton-container:hover {
          opacity: 0.9 !important;
        }

        /* hide the little clock icon next to the button row */
        .TockSearchBar-tockIcon {
          display: none !important;
        }

        /* mobile tweak: reduce padding on tablet and below */
        @media (max-width: 768px) {
          .TockSearchBar-container {
            padding: 1rem !important;
            gap: 0.75rem !important;
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