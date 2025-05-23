// components/TockWidget.tsx
"use client";

interface TockWidgetProps {
  /** the “offering” ID that Tock will render */
  offeringId: string;
}

export default function TockWidget({ offeringId }: TockWidgetProps) {
  return (
    <>
      <style jsx global>{`
        .MainLabelSpan, .MainLabelLabel {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-size: 16px !important;
        }
        .TockInlineButton-container {
          background-color: var(--olivea-olive) !important;
          color: white !important;
          font-weight: 600 !important;
          border: none !important;
        }
        .TockInlineButton-container:hover {
          opacity: 0.9 !important;
        }
      `}</style>
      <div className="flex-1 flex justify-center items-start p-6">
        <div className="p-6 bg-white rounded-xl w-full max-w-none">
          <div
            id="Tock_widget_container"
            data-tock-display-mode="Inline"
            data-tock-widget="data-tock-offering"
            data-tock-offering-id={offeringId}
            data-tock-color-mode="White"
            data-tock-locale="es-mx"
            data-tock-timezone="America/Tijuana"
          />
        </div>
      </div>
    </>
  );
}
