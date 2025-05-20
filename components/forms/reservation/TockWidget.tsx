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
        /* Ensuring vertical stacking & elegant styling */
        #Tock_widget_container {
          width: 100% !important;
          display: flex !important;
          justify-content: center;
        }
            
        .TockSearchBar-container {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
          width: 100% !important;
          max-width: 350px !important;
          padding: 20px !important;
          box-sizing: border-box !important;
        }
            
        .InlineWidgetDropDown-section,
        .TockDropdown-container,
        .InlineWidget-dropdownContainer,
        .TockInlineButton {
          width: 100% !important;
        }
            
        /* Rounded corners, uniform padding, and elegant shadows */
        .InlineWidgetDropDown-sectionDropdown,
        .TockDatePicker-container,
        .TockInlineButton-container {
          width: 100% !important;
          border-radius: 10px !important;
          box-shadow: none !important;
          border: 1px solid #e2e8f0 !important;
          padding: 12px 15px !important;
        }
            
        /* Adjust labels and texts for elegance */
        .MainLabelSpan, .MainLabelLabel {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-size: 16px !important;
        }
            
        /* Custom Button Styling */
        .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          font-weight: 600 !important;
          border: none !important;
        }
            
        .TockInlineButton-container:hover {
          opacity: 0.9 !important;
        }
            
        /* Hide unwanted backgrounds or borders from Tock's original horizontal layout */
        .InlineWidgetDropDown-sectionDropdown,
        .TockDatePicker-container {
          background-color: #f8f8f8 !important;
        }
            
        /* MOBILE STYLES: Below 1024px, slightly smaller max-width */
        @media (max-width: 1024px) {
          .TockSearchBar-container {
            max-width: 100% !important;
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