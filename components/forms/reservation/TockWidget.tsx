// TockWidget.tsx
"use client";
import { useEffect } from "react";

export default function TockWidget() {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.tock) {
        window.tock("init", "olivea-farm-to-table");
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx global>{`
        /* only override the “Book now” button */
        #Tock_widget_container .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          border-radius: 8px !important;
          padding: 1rem 0 !important;
          font-weight: 600 !important;
          text-align: center !important;
        }
        #Tock_widget_container .TockInlineButton-container .MainLabelSpan {
          color: white !important;
        }
      `}</style>

      <div className="flex-1 flex justify-center items-start p-6">
        {/* 
          Make this <div> fill the entire “red-box” area by removing any `max-w-*` limits. 
          If you want horizontal padding on very large screens, change `w-full` ➔ `w-[calc(100%-2rem)]` etc.
        */}
        <div className="bg-white rounded-xl w-full h-full p-6">
          {/**
           * Wrap the widget in its own flex container so it sits dead-center
           * on desktop (and still fluid on mobile).
           */}
          <div className="w-full flex justify-center">
            <div
              id="Tock_widget_container"
              data-tock-display-mode="Inline"
              data-tock-widget="data-tock-offering"
              data-tock-offering-id="528232"
              data-tock-color-mode="White"
              data-tock-locale="es-mx"
              data-tock-timezone="America/Tijuana"
              /* 
                100% of the parent’s width, but never more than 800px. 
                Tweak that maxWidth as you see fit.
              */
              style={{
                width: "100%",
                maxWidth: "800px",
                minHeight: "400px",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
