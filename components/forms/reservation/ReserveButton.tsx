"use client";

import { ReactNode, useEffect } from "react";

interface ReserveButtonProps {
  business: string;
  offeringId: string;
  date: string;
  time: string;
  size: string;
  className?: string;
  children?: ReactNode;
}

export default function ReserveButton({
  business,
  offeringId,
  date,
  time,
  size,
  className,
  children,
}: ReserveButtonProps) {
  useEffect(() => {
    if (!document.getElementById("tock-js")) {
      const s = document.createElement("script");
      s.id = "tock-js";
      s.src = "https://www.exploretock.com/tock.js";
      document.body.appendChild(s);
      s.onload = () => {
        window.tock?.("init", { token: "<YOUR_TOKEN>" });
      };
    }
  }, []);

  return (
    <button
      type="button"
      className={className}
      data-tock-business={business}
      data-tock-offering-id={offeringId}
      data-tock-date={date}
      data-tock-time={time}
      data-tock-size={size}
      onClick={() => window.tock?.("open")}
    >
      {children}
    </button>
  );
}