// components/layout/LayoutShell.tsx
"use client";

import React, { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DockLeft from "@/components/navigation/DockLeft";
import DockRight from "@/components/navigation/DockRight";
import MobileSectionNav from "@/components/navigation/MobileSectionNav";
import ClientOnly from "@/components/providers/ClientOnly";
import { BookOpen, Leaf, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/providers/ScrollProvider";
import { NavigationProvider } from "@/contexts/NavigationContext";
import NextGenBackgroundInitializer from "@/components/animations/NextGenBackgroundInitializer";
import NextGenBackground from "@/components/animations/NextGenBackground";

// import only the Lang & AppDictionary types
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

interface LayoutShellProps {
  lang: Lang;
  dictionary: AppDictionary;
  children: React.ReactNode;
}

type DockItem = { id: string; href: string; label: string; icon: React.ReactNode };

function LayoutShell({ lang, dictionary, children }: LayoutShellProps) {
  const lenis    = useLenis();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Attach Lenis scroll updates to a CSS var
  useEffect(() => {
    function onScroll({ scroll }: { scroll: number }) {
      document.documentElement.style.setProperty("--scroll", String(scroll));
    }
    lenis.on("scroll", onScroll);
    return () => void lenis.off("scroll", onScroll);
  }, [lenis]);

  // Mark as mounted (so we never SSR‐render navs before hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome           = pathname === `/${lang}`;
  const isCasaPage       = pathname.includes("/casa");
  const isRestaurantPage = pathname.includes("/restaurant");

  //
  // ─── MOBILE BOTTOM NAV ITEMS ─────────────────────────────────────────────────
  //
  // Only Casa and Restaurant now; Café has been removed.
  const mobileNavItems = (() => {
    // Casa sections from dictionary.casa.sections
    if (isCasaPage) {
      const keys = Object.keys(dictionary.casa.sections) as Array<keyof AppDictionary["casa"]["sections"]>;
      return keys.map((id) => ({
        id,
        label: dictionary.casa.sections[id].title,
      }));
    }
    // Restaurant sections from dictionary.restaurant.sections
    if (isRestaurantPage) {
      const keys = Object.keys(dictionary.restaurant.sections) as Array<keyof AppDictionary["restaurant"]["sections"]>;
      return keys.map((id) => ({
        id,
        label: dictionary.restaurant.sections[id].title,
      }));
    }
    // Otherwise, nothing
    return [];
  })();

  //
  // ─── DESKTOP DOCK‐RIGHT ITEMS ─────────────────────────────────────────────────
  //
  const dockRightItems: DockItem[] = [
    {
      id: "journal",
      href: `/${lang}/journal`,
      label: dictionary.journal.title,
      icon: <BookOpen />,
    },
    {
      id: "sustainability",
      href: `/${lang}/sustainability`,
      label: dictionary.sustainability.title,
      icon: <Leaf />,
    },
    {
      id: "policies",
      href: `/${lang}/legal`,
      label: dictionary.legal.title,
      icon: <FileText />,
    },
  ];

  //
  // ─── WHICH IDENTITY FOR DOCK‐LEFT? ─────────────────────────────────────────────
  //
  // Only Casa or Restaurant now
  const identity: "casa" | "restaurant" =
    isCasaPage ? "casa" : isRestaurantPage ? "restaurant" : "casa";

  return (
    <>
      <NextGenBackgroundInitializer />
      <NextGenBackground />

      {mounted && !isHome && <Navbar lang={lang} dictionary={dictionary} />}

      <main
        className={
          isHome
            ? "p-0 m-0 overflow-hidden"
            : "max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20"
        }
      >
        {(isCasaPage || isRestaurantPage)
          ? <NavigationProvider>{children}</NavigationProvider>
          : children}
      </main>

      {mounted && !isHome && <Footer />}

      {/* ── DESKTOP DOCKS ─────────────────────────────────────────────── */}
      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          <DockLeft dict={dictionary} identity={identity} />
          <DockRight items={dockRightItems} />
        </ClientOnly>
      )}

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      {mounted && !isHome && isMobile && mobileNavItems.length > 0 && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-40 border-[var(--olivea-soil)]/10">
            <MobileSectionNav items={mobileNavItems} />
          </div>
        </ClientOnly>
      )}
    </>
  );
}

export default memo(LayoutShell);
