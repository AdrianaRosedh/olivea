// components/ui/ReservationButton.tsx
"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import MagneticButton from "@/components/ui/MagneticButton";
import { Button } from "@/components/ui/button";
import { useReservation } from "@/contexts/ReservationContext";
import { corm } from "@/app/fonts";
import { cn } from "@/lib/utils";

interface ReservationButtonProps {
  className?: string;
  forceMobile?: boolean;
}

export default function ReservationButton({
  className = "",
  forceMobile = false,
}: ReservationButtonProps) {
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

  const showMobile = forceMobile;
  const showDesktop = !forceMobile;

  /* Social proof badge — mobile */
  const badgeMobile = (
    <div className="flex items-center justify-center gap-1.5 mb-2">
      <Image
        src="/images/press/awards/michelin.svg"
        alt="MICHELIN Star"
        width={14}
        height={14}
        className="w-3.5 h-3.5"
      />
      <Image
        src="/images/press/awards/michelin-green-star.svg"
        alt="MICHELIN Green Star"
        width={14}
        height={14}
        className="w-3.5 h-3.5"
      />
      <span
        className="text-[10px] tracking-[0.08em] uppercase"
        style={{
          fontFamily: "var(--font-sans)",
          color: "var(--olivea-olive)",
          opacity: 0.7,
        }}
      >
        {isES
          ? "Una Estrella MICHELIN · Estrella Verde"
          : "One MICHELIN Star · Green Star"}
      </span>
    </div>
  );

  /* Social proof badge — desktop (white text for video bg) */
  const badgeDesktop = (
    <div className="flex items-center justify-center gap-2 mb-3">
      <Image
        src="/images/press/awards/michelin.svg"
        alt="MICHELIN Star"
        width={18}
        height={18}
        className="w-[18px] h-[18px] brightness-0 invert opacity-80"
      />
      <Image
        src="/images/press/awards/michelin-green-star.svg"
        alt="MICHELIN Green Star"
        width={18}
        height={18}
        className="w-[18px] h-[18px] brightness-0 invert opacity-80"
      />
      <span
        className="text-[12px] tracking-[0.12em] uppercase"
        style={{
          fontFamily: "var(--font-sans)",
          color: "rgba(255,255,255,0.8)",
        }}
      >
        {isES
          ? "Una Estrella MICHELIN · Estrella Verde"
          : "One MICHELIN Star · Green Star"}
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile / Full-width Button */}
      <div className={cn(showMobile ? "block w-full" : "md:hidden w-full", className)}>
        {badgeMobile}
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
      {showDesktop && (
        <div className={cn("hidden md:flex flex-col items-center", className)}>
          {badgeDesktop}
          <MagneticButton
            onClick={handleClick}
            className="px-16 py-4 text-white bg-(--olivea-olive) hover:bg-(--olivea-clay) rounded-lg transition-colors shadow-lg"
            textClassName={labelClasses}
            ariaLabel={isES ? "Reservar" : "Reserve"}
          >
            {label}
          </MagneticButton>
        </div>
      )}
    </>
  );
}
