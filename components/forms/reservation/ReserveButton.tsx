"use client";
import { ReactNode } from "react";

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
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // pass the clicked button element so Tock picks up your data-attrs
    window.tock?.("open", e.currentTarget);
  };

  return (
    <button
      type="button"
      className={className}
      data-tock-business={business}
      data-tock-offering-id={offeringId}
      data-tock-date={date}
      data-tock-time={time}
      data-tock-size={size}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
