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
        /* Container Styling for modern look */
        #Tock_widget_container .TockSearchBar-container {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          gap: 12px; /* spacing between sections */
        }
            
        /* Individual Input Sections */
        #Tock_widget_container .InlineWidgetDropDown-section,
        #Tock_widget_container .TockDropdown-container,
        #Tock_widget_container .InlineWidget-dropdownContainer {
          width: 100% !important;
          background: #f9f9f9 !important;
          border-radius: 12px !important;
          box-shadow: 0 3px 6px rgba(0,0,0,0.05) !important;
          overflow: hidden !important;
          border: 1px solid #e0e0e0 !important;
        }
            
        /* Dropdown Button Styles */
        #Tock_widget_container button {
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          text-align: left !important;
          padding: 12px 16px !important;
          font-size: 1rem !important;
          color: #333 !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
        }
            
        /* Icon and text spacing within dropdowns */
        #Tock_widget_container .MainLabelContainer {
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
            
        #Tock_widget_container .MainLabelLabel {
          font-size: 0.75rem !important;
          color: #888 !important;
        }
            
        #Tock_widget_container .MainLabelSpan {
          font-weight: 600 !important;
          color: #222 !important;
          font-size: 0.95rem !important;
        }
            
        /* Modern Olive Green Button Style */
        #Tock_widget_container .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          border-radius: 12px !important;
          padding: 12px !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          box-shadow: 0 3px 6px rgba(0,0,0,0.1) !important;
          transition: transform 0.1s ease-in-out, opacity 0.3s ease !important;
        }
            
        #Tock_widget_container .TockInlineButton-container:hover {
          transform: translateY(-2px) !important;
          opacity: 0.9 !important;
        }
            
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          #Tock_widget_container .TockSearchBar-container {
            gap: 8px;
          }
            
          #Tock_widget_container button {
            padding: 10px 14px !important;
          }
            
          #Tock_widget_container .TockInlineButton-container {
            padding: 10px !important;
          }
        }
      `}</style>


      <div className="flex-1 flex justify-center items-start p-6 overflow-auto">
        <div className="p-4 bg-white rounded-xl w-full max-w-lg overflow-hidden">
          <div
            id="Tock_widget_container"
            data-tock-display-mode="Inline"
            data-tock-widget="data-tock-offering"
            data-tock-offering-id="528232"
            data-tock-color-mode="White"
            data-tock-locale="es-mx"
            data-tock-timezone="America/Tijuana"
            style={{ minHeight: "400px" }}
          />
        </div>
      </div>
    </>
  );
}