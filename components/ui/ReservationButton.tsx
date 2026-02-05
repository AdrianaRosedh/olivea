// components/ui/ReservationButton.tsx
"use client";

import { usePathname } from "next/navigation";
import MagneticButton from "@/components/ui/MagneticButton";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/contexts/ReservationContext";
import { corm } from "@/app/fonts"; 
import { cn } from "@/lib/utils";

interface ReservationButtonProps {
  className?: string;
}

export default function ReservationButton({ className = "" }: ReservationButtonProps) {
  const { openReservationModal } = useReservation();
  const pathname = usePathname();
  const isES = pathname?.startsWith("/es");
  const label = isES ? "RESERVAR" : "RESERVE";

  const handleClick = () => {
    openReservationModal("restaurant");
  };

  // exact same typography as the navbar RESERVE button
  const labelClasses = cn(
    corm.className,
    "uppercase font-semibold leading-none",
    "!tracking-[0.18em] [letter-spacing:0.18em]",
    "text-[clamp(1.05rem,1.35vw,1.45rem)]"
  );

  return (
    <>
      {/* Mobile Button */}
      <div className={cn("md:hidden w-full px-4 pt-4", className)}>
        <Button
          onClick={handleClick}
          size="lg"
          className={cn(
            "w-full h-15 rounded-xl bg-(--olivea-olive) text-white",
            "hover:bg-(--olivea-clay) transition-colors shadow-md",
            labelClasses
          )}
        >
          {label}
        </Button>
      </div>

      {/* Desktop Magnetic Button */}
      <div className={cn("hidden md:block", className)}>
        <MagneticButton
          onClick={handleClick}
          className="px-6 py-3 text-white bg-(--olivea-olive) hover:bg-(--olivea-clay) rounded-md transition-colors"
          textClassName={labelClasses}
          ariaLabel={isES ? "Reservar" : "Reserve"}
        >
          {label}
        </MagneticButton>
      </div>
    </>
  );
}
