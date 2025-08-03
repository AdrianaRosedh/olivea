"use client";

export default function OpenTableWidget() {
  return (
    <div className="flex-1 flex justify-center items-start p-2 sm:p-6  bg-[var(--olivea-cream)]">
      <div className=" bg-[var(--olivea-cream)]e w-full max-w-none rounded-md sm:rounded-xl">
        <iframe
          src="https://www.opentable.com.mx/booking/restref/availability?lang=es-MX&correlationId=f6ea6967-e5bb-43bf-b11e-42c534d4864a&restRef=1313743&otSource=Restaurant%20website"
          width="100%"
          height="600"
          frameBorder="0"
          style={{
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            width: "100%",
            minWidth: 0,
          }}
          title="Reservar en Olivea Farm To Table en OpenTable"
        ></iframe>
      </div>
    </div>
  );
}
