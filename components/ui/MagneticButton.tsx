// components/ui/MagneticButton.tsx
"use client";

import type React from "react";
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
  href?: string;
  className?: string;
  /** Extra classes for the inner text span (use this to control font family/weight/size/letter-spacing) */
  textClassName?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** Accessibility label if the content isn’t descriptive */
  ariaLabel?: string;
}

export default function MagneticButton({
  href,
  className,
  textClassName,
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 10 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 10 });

  const x = useTransform(springX, (v) => `${v}px`);
  const y = useTransform(springY, (v) => `${v}px`);

  const textX = useTransform(springX, (v) => `${v * 1.2}px`);
  const textY = useTransform(springY, (v) => `${v * 1.2}px`);

  const shineX = useTransform(springX, (v) => `${v * 0.4}px`);
  const shineY = useTransform(springY, (v) => `${v * 0.4}px`);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled) return;
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;

    const offsetX = e.clientX - bounds.left - bounds.width / 2;
    const offsetY = e.clientY - bounds.top - bounds.height / 2;

    mouseX.set(offsetX * 0.6);
    mouseY.set(offsetY * 0.6);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      e.preventDefault();
      try {
        onClick();
      } catch (error) {
        console.error("Error in MagneticButton onClick handler:", error);
      }
    }
  };

  const ButtonContent = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center justify-center",
        "px-6 py-3 md:px-8 md:py-3.5 lg:px-9 lg:py-4",
        "rounded-full transition-transform duration-300 overflow-hidden",
        "bg-black text-white shadow-xl hover:scale-110 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
        className
      )}
      style={{ x, y }}
    >
      {/* Shine Layer */}
      <motion.span
        style={{ x: shineX, y: shineY }}
        className="absolute w-[160%] h-[160%] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl z-0 pointer-events-none"
      />

      {/* Text Layer with exaggerated motion */}
      <motion.span
        style={{ x: textX, y: textY }}
        className={cn(
          // default typography (kept minimal so your overrides take precedence)
          "relative z-10 tracking-wide",
          // responsive default sizes (override freely via textClassName)
          "text-base md:text-lg lg:text-xl",
          // weight default (override with font-* in textClassName)
          "font-semibold",
          textClassName
        )}
      >
        {children}
      </motion.span>
    </motion.div>
  );

  return href && !disabled ? (
    <Link href={href} aria-label={ariaLabel}>
      {ButtonContent}
    </Link>
  ) : (
    ButtonContent
  );
}