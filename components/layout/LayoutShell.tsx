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
import { supabase } from "@/lib/supabase";
import { NavigationProvider } from "@/contexts/NavigationContext";
import NextGenBackgroundInitializer from "@/components/animations/NextGenBackgroundInitializer";
import NextGenBackground from "@/components/animations/NextGenBackground";
import DesktopChatButton from "@/components/ui/DesktopChatButton";

// import only the Lang & AppDictionary types
import type { Lang, AppDictionary } from "@/app/[lang]/dictionaries";

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

  // Café categories state (for mobile bottom nav & dynamic subsections)
  const [cafeCategories, setCafeCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading]           = useState(pathname.includes("/cafe"));

  // Mark mounted so we don’t SSR-nav before hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome           = pathname === `/${lang}`;
  const isCasaPage       = pathname.includes("/casa");
  const isCafePage       = pathname.includes("/cafe");
  const isRestaurantPage = pathname.includes("/restaurant");

  // Fetch dynamic café categories
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
      if (error) console.error(error);
      else {
        const cats = Array.from(
          new Set((data ?? []).map((i) => i.category).filter(Boolean))
        );
        setCafeCategories(cats as string[]);
      }
      setIsLoading(false);
    })();
    return () => { active = false; };
  }, [isCafePage]);

  //
  // ─── MOBILE NAV ITEMS ─────────────────────────────────────────────────────────
  //

  type CasaSection       = keyof AppDictionary["casa"]["sections"];
  type RestaurantSection = keyof AppDictionary["restaurant"]["sections"];
  type CafeSection       = keyof AppDictionary["cafe"]["sections"];

  const mobileNavItems = (() => {
    if (isCasaPage) {
      const keys = Object.keys(dictionary.casa.sections) as CasaSection[];
      return keys.map((id) => ({
        id,
        label: dictionary.casa.sections[id].title,
      }));
    }
    if (isRestaurantPage) {
      const keys = Object.keys(dictionary.restaurant.sections) as RestaurantSection[];
      return keys.map((id) => ({
        id,
        label: dictionary.restaurant.sections[id].title,
      }));
    }
    if (isCafePage) {
      const baseKeys = Object.keys(dictionary.cafe.sections) as CafeSection[];
      const base = baseKeys.map((id) => ({
        id,
        label: dictionary.cafe.sections[id].title,
      }));
      const dyn = cafeCategories.map((cat) => ({ id: cat, label: cat }));
      return [...base, ...dyn];
    }
    return [];
  })();

  //
  // ─── DOCK‐RIGHT ITEMS ──────────────────────────────────────────────────────────
  //

  const dockRightItems: DockItem[] = [
    { id: "journal",        href: `/${lang}/journal`,        label: dictionary.journal.title,        icon: <BookOpen /> },
    { id: "sustainability", href: `/${lang}/sustainability`, label: dictionary.sustainability.title, icon: <Leaf />     },
    { id: "policies",       href: `/${lang}/legal`,           label: dictionary.legal.title,           icon: <FileText />},
  ];

  //
  // ─── WHICH IDENTITY FOR DOCKLEFT? ───────────────────────────────────────────────
  //

  const identity: "casa" | "restaurant" | "cafe" =
       isCasaPage       ? "casa"
     : isRestaurantPage ? "restaurant"
     : isCafePage       ? "cafe"
     : "casa"; // fallback

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
        {(isCasaPage || isCafePage || isRestaurantPage)
          ? <NavigationProvider>{children}</NavigationProvider>
          : children}
      </main>

      {mounted && !isHome && <Footer />}

      {/* ── DESKTOP DOCKS ─────────────────────────────────────────────────────────── */}
      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          <DockLeft
            dict={dictionary}
            identity={identity}
            dynamicCafeCategories={isCafePage ? cafeCategories : []}
          />
          <DockRight items={dockRightItems} />
        </ClientOnly>
      )}

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────────────────────── */}
      {mounted && !isHome && isMobile && !isLoading && mobileNavItems.length > 0 && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-40 border-[var(--olivea-soil)]/10">
            <MobileSectionNav items={mobileNavItems} />
          </div>
        </ClientOnly>
      )}

      {/* ── CHAT BUTTON ───────────────────────────────────────────────────────────── */}
      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          <DesktopChatButton lang={lang} />
        </ClientOnly>
      )}
    </>
  );
}
export default memo(LayoutShell);