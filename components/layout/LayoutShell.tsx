// components/layout/LayoutShell.tsx
"use client";

import React, { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DockLeft from "@/components/navigation/DockLeft";
import DockRight from "@/components/navigation/DockRight";
import MobileSectionNav from "@/components/ui/MobileSectionNav";
import ClientOnly from "@/components/providers/ClientOnly";
import MagneticButton from "@/components/ui/MagneticButton";
import { MessageCircle, BookOpen, Leaf, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/providers/ScrollProvider";
import { supabase } from "@/lib/supabase";
import { NavigationProvider } from "@/contexts/NavigationContext";

// import only the Lang type now
import type { Lang } from "@/app/[lang]/dictionaries";

interface LayoutShellProps {
  lang: Lang;
  children: React.ReactNode;
}

type SectionItem = { id: string; number: string; label: string };
type DockItem    = { id: string; href: string; label: string; icon: React.ReactNode };

const BASE_CAFE_ITEMS: SectionItem[] = [
  { id: "about",    number: "01", label: "About"    },
  { id: "coffee",   number: "02", label: "Coffee"   },
  { id: "pastries", number: "03", label: "Pastries" },
  { id: "menu",     number: "04", label: "Menu"     },
];
const CASA_ITEMS: SectionItem[] = [
  { id: "rooms",       number: "01", label: "Rooms"       },
  { id: "breakfast",   number: "02", label: "Breakfast"   },
  { id: "experiences", number: "03", label: "Experiences" },
  { id: "location",    number: "04", label: "Location"    },
];
const RESTAURANT_ITEMS: SectionItem[] = [
  { id: "story",  number: "01", label: "Story"  },
  { id: "garden", number: "02", label: "Garden" },
  { id: "menu",   number: "03", label: "Menu"   },
  { id: "wines",  number: "04", label: "Wines"  },
];

function LayoutShell({ lang, children }: LayoutShellProps) {
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

  // Café categories state
  const [cafeCategories, setCafeCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(pathname.includes("/cafe"));

  // Mark when mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome           = pathname === `/${lang}`;
  const isCasaPage       = pathname.includes("/casa");
  const isCafePage       = pathname.includes("/cafe");
  const isRestaurantPage = pathname.includes("/restaurant");

  // Fetch café categories
  useEffect(() => {
    if (!isCafePage) {
      setIsLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("cafe_menu")
        .select("category")
        .eq("available", true)
        .order("category");

      if (!active) return;
      if (error) {
        console.error(error);
      } else {
        const cats = Array.from(
          new Set((data ?? []).map((i) => i.category).filter(Boolean))
        );
        setCafeCategories(cats as string[]);
      }
      setIsLoading(false);
    })();
    return () => { active = false };
  }, [isCafePage]);

  // Determine which nav items to show
  let navItems: SectionItem[] = [];
  if (isCasaPage)           navItems = CASA_ITEMS;
  else if (isRestaurantPage) navItems = RESTAURANT_ITEMS;
  else if (isCafePage) {
    navItems = [
      ...BASE_CAFE_ITEMS,
      ...cafeCategories.map((cat, i) => ({ id: cat, number: `0${i + 5}`, label: cat })),
    ];
  }

  const mobileNavItems = navItems.map(({ id, label }) => ({ id, label }));
  const dockRightItems: DockItem[] = [
    { id: "journal",        href: `/${lang}/journal`,        label: "Journal",        icon: <BookOpen /> },
    { id: "sustainability", href: `/${lang}/sustainability`, label: "Sustainability", icon: <Leaf />     },
    { id: "policies",       href: `/${lang}/legal`,           label: "Policies",       icon: <FileText />},
  ];

  return (
    <>
      {mounted && !isHome && <Navbar lang={lang} />}

      <main
        className={
          isHome
            ? "p-0 m-0 overflow-hidden"
            : "max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20"
        }
      >
        {(isCasaPage || isCafePage || isRestaurantPage)
          ? <NavigationProvider>{children}</NavigationProvider>
          : children}
      </main>

      {mounted && !isHome && <Footer />}

      {mounted && !isHome && !isMobile && navItems.length > 0 && (
        <ClientOnly>
          <DockLeft  items={navItems} />
          <DockRight items={dockRightItems} />
        </ClientOnly>
      )}

      {mounted && !isHome && isMobile && !isLoading && navItems.length > 0 && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-40 bg-transparent backdrop-blur-md border-t border-[var(--olivea-soil)]/10">
            <MobileSectionNav items={mobileNavItems} />
          </div>
        </ClientOnly>
      )}

      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          <div className="fixed bottom-20 right-6 z-50 hidden md:block">
            <MagneticButton
              href="#chat"
              aria-label="Open Chat"
              className="w-14 h-14 bg-[var(--olivea-olive)] text-white hover:bg-[var(--olivea-clay)] rounded-[40%_60%_60%_40%]"
            >
              <MessageCircle className="w-6 h-6" />
            </MagneticButton>
          </div>
        </ClientOnly>
      )}
    </>
  );
}

export default memo(LayoutShell);