"use client";

import { useState, useCallback, useRef, MouseEvent, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OliveaFTTLogo from "@/assets/alebrije-1-Green.svg";
import MagneticButton from "@/components/ui/MagneticButton";
import { useReservation } from "@/contexts/ReservationContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import AdaptiveNavbar from "@/components/navigation/AdaptiveNavbar";
import MobileDrawer from "@/components/navigation/MobileDrawer";
import { MobileNav } from "@/components/navigation/MobileNav";
import type { AppDictionary } from "@/app/(main)/[lang]/dictionaries";
import { useSharedTransition } from "@/contexts/SharedTransitionContext";
import { corm } from "@/lib/fonts"; // Cormorant_Garamond exported as `corm`


/* CenterLink unchanged */
interface CenterLinkProps { href: string; label: string; isActive: boolean; }
function CenterLink({ href, label, isActive }: CenterLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { left, width } = ref.current.getBoundingClientRect();
    ref.current.style.setProperty(
      "--hover-x",
      Math.round(((e.clientX - left) / width) * 100) + "%"
    );
  };
  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={onMouseMove}
      className={`relative px-6 py-2.5 h-[52px] min-w-[190px]
        whitespace-nowrap rounded-md flex items-center justify-center
        font-medium text-base uppercase font-sans tracking-wide
        ${isActive ? "active" : ""}`}
    >
      {label}
    </Link>
  );
}

interface NavbarProps {
  lang: "en" | "es";
  dictionary: AppDictionary;
}

export default function Navbar({ lang, dictionary }: NavbarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { openReservationModal } = useReservation();
  const { clearTransition } = useSharedTransition();

  // drawer state (for mobile)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => {
    navigator.vibrate?.(10);
    setDrawerOpen((v) => !v);
  }, []);

  // Reserve button handler (shared)
  const handleReserve = useCallback(() => {
    const tab =
      pathname?.includes("/casa") ? "hotel" :
      pathname?.includes("/cafe") ? "cafe"  :
      "restaurant";
    openReservationModal(tab);
  }, [openReservationModal, pathname]);

  // 🔧 Register desktop reserve event BEFORE any early return
  useEffect(() => {
    const onReserve = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        handleReserve();
      }
    };
    window.addEventListener("olivea:reserve", onReserve);
    return () => window.removeEventListener("olivea:reserve", onReserve);
  }, [handleReserve]);

  // Build nav items
  const base = `/${lang}`;
  const navItems = [
    { href: `${base}/casa`,        label: pathname.startsWith(`${base}/casa`)        ? "Casa Olivea"          : "Hotel" },
    { href: `${base}/farmtotable`, label: pathname.startsWith(`${base}/farmtotable`) ? "Olivea Farm To Table" : "Restaurant" },
    { href: `${base}/cafe`,        label: pathname.startsWith(`${base}/cafe`)        ? "Olivea Café"          : "Café" },
  ];

  // Mobile UI
  if (isMobile) {
    return (
      <>
        <AdaptiveNavbar
          lang={lang}
          isDrawerOpen={drawerOpen}
          onToggleDrawer={toggleDrawer}
        />
        <MobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          lang={lang}
          dict={dictionary}
        />
        <MobileNav />
      </>
    );
  }

  // Desktop UI (center links, logo/CTA near corners, extra inset padding)
  return (
    <nav className="fixed top-0 left-0 right-0 z-[50] bg-transparent">
      <div className="relative w-full h-20 md:h-24 lg:h-28">
        {/* Left: Logo, closer to the corner with a bit more padding */}
        <Link
          href="/"
          aria-label="Home"
          onClick={() => {
            // wipe out any active shared-element transition before we go home
            clearTransition();
          }}
          className="absolute left-4 md:left-8 lg:left-12 top-[1rem] md:top-[1.5rem] lg:top-[1.5rem] inline-flex items-center"
        >
          <OliveaFTTLogo className="h-14 md:h-22 lg:h-40 w-auto transition-all duration-300" style={{ maxHeight: "16rem" }} />
        </Link>

        {/* Center: 3 buttons perfectly centered (keeps your original design) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 fill-nav">
          {navItems.map((it) => (
            <CenterLink
              key={it.href}
              href={it.href}
              label={it.label}
              isActive={pathname === it.href}
            />
          ))}
        </div>

        {/* Right: Reservar, closer to the corner with a bit more padding */}
        <div className="absolute right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2">
          <MagneticButton
            onClick={handleReserve}
            aria-label={lang === "en" ? "Reserve" : "Reservar"}
            className="bg-[var(--olivea-olive)] text-white px-6 py-2.5 h-[60px] rounded-md hover:bg-[var(--olivea-clay)] transition-colors"
          >
            <span
              className={[
                // use the same serif as your tabs (import { corm } from "@/lib/fonts")
                corm.className,
                "uppercase font-semibold leading-none",
                "!tracking-[0.18em] [letter-spacing:0.18em]",
                // bigger, responsive text — scales a bit with viewport
                "text-[clamp(1.05rem,1.35vw,1.45rem)]",
              ].join(" ")}
              style={{ letterSpacing: "0.18em" }}
            >
              {lang === "en" ? "RESERVE" : "RESERVAR"}
            </span>
          </MagneticButton>
        </div>
      </div>
    </nav>
  );
}