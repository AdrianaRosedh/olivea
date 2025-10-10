// components/layout/LayoutShell.tsx
"use client";

import React, { memo, useEffect, useMemo} from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DockLeft from "@/components/navigation/DockLeft";
import DockRight from "@/components/navigation/DockRight";
import MobileSectionNav from "@/components/navigation/MobileSectionNav";
import ClientOnly from "@/components/providers/ClientOnly";
import { BookOpen, Leaf, Map, Users, Wine } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/providers/ScrollProvider";
import { NavigationProvider } from "@/contexts/NavigationContext";
import NextGenBackgroundInitializer from "@/components/animations/NextGenBackgroundInitializer";
import NextGenBackground from "@/components/animations/NextGenBackground";
import DesktopChatButton from "@/components/ui/DesktopChatButton";
import UnderConstructionNotice from "@/components/forms/UnderConstructionNotice";
import LoadWhistleClient from "@/components/chat/LoadWhistleClient";
import WhistleToggleMount from "@/components/chat/WhistleToggleMount";

// types
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

// Section configs (per identity + per language)
import { SECTIONS_ES as FARM_ES } from "@/app/(main)/[lang]/farmtotable/sections.es";
import { SECTIONS_EN as FARM_EN } from "@/app/(main)/[lang]/farmtotable/sections.en";
import { SECTIONS_CASA_ES } from "@/app/(main)/[lang]/casa/sections.es";
import { SECTIONS_CASA_EN } from "@/app/(main)/[lang]/casa/sections.en";
import { SECTIONS_CAFE_ES } from "@/app/(main)/[lang]/cafe/sections.es";
import { SECTIONS_CAFE_EN } from "@/app/(main)/[lang]/cafe/sections.en";

interface LayoutShellProps {
  lang: Lang;
  dictionary: AppDictionary;
  children: React.ReactNode;
}

type DockItem = { id: string; href: string; label: string; icon: React.ReactNode };
type Override = Array<{ id: string; label: string; subs?: Array<{ id: string; label: string }> }>;

type StyleVars = React.CSSProperties & {
  ["--dock-gutter"]?: string;
  ["--dock-left"]?: string;
  ["--dock-right"]?: string;
  ["--mobile-nav-h"]?: string;
};

const mapSections = (
  arr: Array<{ id: string; title: string; subs?: Array<{ id: string; title: string }> }>
): Override =>
  arr.map((s) => ({
    id: s.id,
    label: s.title,
    subs: s.subs?.map((ss) => ({ id: ss.id, label: ss.title })),
  }));

function LayoutShell({ lang, dictionary, children }: LayoutShellProps) {
  const lenis = useLenis();
  const pathname = usePathname();
  const isMobile = useIsMobile();


  // Lenis → CSS var (guard against null during HMR)
  useEffect(() => {
    if (!lenis) return;
    const onScroll = ({ scroll }: { scroll: number }) => {
      document.documentElement.style.setProperty("--scroll", String(scroll));
    };
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  const isHome = pathname === `/${lang}`;
  const isCasaPage = pathname.includes("/casa");
  const isRestaurantPage = pathname.includes("/farmtotable");
  const isCafePage = pathname.includes("/cafe");

  /** Safe gutter for desktop so media never sits under docks */
  const dockLeftPx = 240;
  const dockRightPx = 96;
  const dockGapPx = 24;

  // CLS-safe header sizing: --header-h comes from CSS media queries in globals.css
  const mainStyle = (isMobile
    ? {
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
        "--mobile-nav-h": `${84}px`,
      }
    : {
        "--dock-gutter": `${dockLeftPx + dockRightPx + dockGapPx * 2}px`,
        "--dock-left": `${dockLeftPx + dockGapPx}px`,
        "--dock-right": `${dockRightPx + dockGapPx}px`,
      }) satisfies StyleVars;

  const allowHeroBreakout = isCasaPage || isRestaurantPage || isCafePage;

  // Desktop Dock-Right items (memo)
  const dockRightItems = useMemo<DockItem[]>(
    () => [
      { id: "about", href: `/${lang}/about`, label: dictionary.about.title, icon: <Users /> },
      { id: "journal", href: `/${lang}/journal`, label: dictionary.journal.title, icon: <BookOpen /> },
      { id: "sustainability", href: `/${lang}/sustainability`, label: dictionary.sustainability.title, icon: <Leaf /> },
      { id: "contact", href: `/${lang}/contact`, label: dictionary.contact.title, icon: <Map /> },
      { id: "mesadelvalle", href: `/${lang}/mesadelvalle`, label: dictionary.mesadelvalle.title, icon: <Wine /> },
    ],
    [lang, dictionary]
  );

  // Identity + section overrides (memo)
  const identity: "casa" | "farmtotable" | "cafe" | null = useMemo(() => {
    if (isCasaPage) return "casa";
    if (isRestaurantPage) return "farmtotable";
    if (isCafePage) return "cafe";
    return null;
  }, [isCasaPage, isRestaurantPage, isCafePage]);

  const sectionsOverride: Override | undefined = useMemo(() => {
    if (isRestaurantPage) return mapSections(lang === "es" ? FARM_ES : FARM_EN);
    if (isCasaPage) return mapSections(lang === "es" ? SECTIONS_CASA_ES : SECTIONS_CASA_EN);
    if (isCafePage) return mapSections(lang === "es" ? SECTIONS_CAFE_ES : SECTIONS_CAFE_EN);
    return undefined;
  }, [isRestaurantPage, isCasaPage, isCafePage, lang]);

  // Mobile bottom nav items (memo)
  const mobileNavItems = useMemo(() => {
    if (isCasaPage) {
      const src = lang === "es" ? SECTIONS_CASA_ES : SECTIONS_CASA_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    if (isRestaurantPage) {
      const src = lang === "es" ? FARM_ES : FARM_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    if (isCafePage) {
      const src = lang === "es" ? SECTIONS_CAFE_ES : SECTIONS_CAFE_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    return [];
  }, [isCasaPage, isRestaurantPage, isCafePage, lang]);

  // Only load chat on identity pages (avoid loading on /about, /journal, etc.)
  const wantsChat = !isHome && (isCasaPage || isRestaurantPage || isCafePage);

  return (
    <>
      <NextGenBackgroundInitializer />
      <NextGenBackground />

      {!isHome && <Navbar lang={lang} dictionary={dictionary} />}

      <main
        data-hero-breakout={allowHeroBreakout ? "true" : "false"}
        className={
          isHome ? "p-0 m-0 overflow-hidden" : "mx-auto w-full max-w-[1100px] pt-16 md:pt-28 md:px-8 pb-20"
        }
        style={mainStyle}
      >
        {allowHeroBreakout ? <NavigationProvider>{children}</NavigationProvider> : children}
      </main>

      {!isHome && <Footer dict={dictionary} />}

      {/* DESKTOP DOCKS */}
      {!isHome && !isMobile && (
        <ClientOnly>
          {identity && <DockLeft identity={identity} sectionsOverride={sectionsOverride ?? []} />}
          <DockRight items={dockRightItems} />
        </ClientOnly>
      )}

      {/* UNDER CONSTRUCTION */}
      {(isCasaPage || isRestaurantPage || isCafePage) && (
        <ClientOnly>
          <UnderConstructionNotice storageScope="route" ttlMs={24 * 60 * 60 * 1000} version="v2" />
        </ClientOnly>
      )}

      {/* MOBILE BOTTOM NAV */}
      {!isHome && isMobile && mobileNavItems.length > 0 && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-[95] pointer-events-none">
            <MobileSectionNav items={mobileNavItems} />
          </div>
        </ClientOnly>
      )}

      {/* CHAT (singleton, only where it matters) */}
      {wantsChat && (
        <ClientOnly>
          <WhistleToggleMount />
          <LoadWhistleClient enabled />
        </ClientOnly>
      )}

      {/* Desktop chat trigger */}
      {!isHome && !isMobile && (
        <ClientOnly>
          <DesktopChatButton lang={lang} />
        </ClientOnly>
      )}
    </>
  );
}

export default memo(LayoutShell);