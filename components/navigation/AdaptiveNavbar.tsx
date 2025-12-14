// components/navigation/AdaptiveNavbar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBackgroundColorDetection } from "@/hooks/useBackgroundColorDetection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import OliveaFTTLogo from "@/assets/OliveaFTTIcon.svg";
import MenuToggle from "./MenuToggle";
import { cn } from "@/lib/utils";

type AdaptiveNavbarProps = {
  lang: "en" | "es";
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  className?: string;
};

export default function AdaptiveNavbar({
  lang,
  isDrawerOpen,
  onToggleDrawer,
  className,
}: AdaptiveNavbarProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isJournal =
    pathname?.includes("/journal") ||
    pathname?.includes("/diario") ||
    pathname?.includes("/posts");

  const { isDark, elementRef, refreshBackgroundCheck } =
    useBackgroundColorDetection({
      mediaFallback: isJournal ? "never" : "previous",
      sampleUnderNavPx: 12,
    });

  const { clearTransition } = useSharedTransition();

  const refreshSoon = () => {
    if (typeof window === "undefined") return () => {};
    let raf = 0;
    let t = 0;

    raf = window.requestAnimationFrame(() => {
      t = window.setTimeout(() => refreshBackgroundCheck(), 60);
    });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (t) window.clearTimeout(t);
    };
  };

  // drawer close → refresh
  useEffect(() => {
    if (!isMobile || isDrawerOpen) return;
    return refreshSoon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen, isMobile]);

  // language / route change → refresh
  useEffect(() => {
    if (!isMobile) return;
    return refreshSoon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, pathname, isMobile]);

  if (!isMobile) return null;

  const logoColor = isDrawerOpen
    ? "text-white"
    : isDark
      ? "text-[#e7eae1]"
      : "text-(--olivea-olive)";

  return (
    <div
      ref={elementRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-1000",
        "bg-transparent",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-16">
        <Link href="/" aria-label="Home" onClick={() => clearTransition()}>
          <OliveaFTTLogo className={cn("h-10 w-auto", logoColor)} />
        </Link>

        <MenuToggle
          toggle={onToggleDrawer}
          isOpen={isDrawerOpen}
          className={logoColor}
        />
      </div>
    </div>
  );
}