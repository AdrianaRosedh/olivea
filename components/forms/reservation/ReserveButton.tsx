// components/forms/reservation/ReserveButton.tsx
"use client";
import { useEffect, ReactNode } from "react";

interface Props {
  business: string;
  offeringId: string;
  date: string;
  time: string;
  size: string;
  className?: string;
  children: ReactNode;
}

export default function ReserveButton({
  business,
  offeringId,
  date,
  time,
  size,
  className,
  children,
}: Props) {
  useEffect(() => {
    if (!document.getElementById("tock-js")) {
      const s = document.createElement("script");
      s.id = "tock-js";
      s.src = "https://www.exploretock.com/tock.js";
      s.async = true;
      document.body.appendChild(s);
      s.onload = () => {
        window.tock?.("init", business);
      };
    }
  }, [business]);

  return (
    <button
      type="button"
      className={className}
      data-tock-business={business}
      data-tock-offering-id={offeringId}
      data-tock-date={date}
      data-tock-time={time}
      data-tock-size={size}
      // onClick={() => window.tock?.("open")}
      onClick={() => {
          console.log("[ReserveButton] clicked → calling tock('open')");
          window.tock?.("open");
        }}
    >
      {children}
    </button>
  );
}
