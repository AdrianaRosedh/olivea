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
  /* 1) Make the whole widget a vertical flex column */
  #Tock_widget_container {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    width: 100% !important;
    max-width: 600px !important;
    margin: 0 auto !important;
  }

  /* 2) Target the search-bar container (three selectors + button) */
  #Tock_widget_container .TockSearchBar-container {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.5rem !important;
    padding: 2rem !important;
    background: transparent !important;
  }

  /* 3a) Stretch each top-level panel wrapper to full width */
  #Tock_widget_container .TockSearchBar-container > .InlineWidgetDropDown-section,
  #Tock_widget_container .TockSearchBar-container > .TockDropdown-container,
  #Tock_widget_container .TockSearchBar-container > .InlineWidget-dropdownContainer {
    width: 100% !important;
  }

  /* 3b) Also stretch the hidden inner panel in the third wrapper */
  #Tock_widget_container .TockSearchBar-container > .InlineWidget-dropdownContainer
    .InlineWidgetDropDown-section {
    width: 100% !important;
  }

  /* 4) Force every button inside those panels to fill & round */
  #Tock_widget_container .TockSearchBar-container > .InlineWidgetDropDown-section button,
  #Tock_widget_container .TockSearchBar-container > .TockDropdown-container button,
  #Tock_widget_container .TockSearchBar-container > .InlineWidget-dropdownContainer button {
    width: 100% !important;
    border-radius: 8px !important;
    padding: 0.75rem 1rem !important;
  }

  /* 5) Style the “Book now” button green + white */
  #Tock_widget_container .TockInlineButton-container {
    background-color: var(--olivea-olive) !important;
    color: #fff !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 1rem 0 !important;
    text-align: center !important;
  }
  #Tock_widget_container .TockInlineButton-container .MainLabelSpan {
    color: #fff !important;
  }

  /* 6) hide the tiny “Powered by Tock” icon */
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