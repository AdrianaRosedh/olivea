"use client";

import React, { memo, useEffect, useMemo } from "react";
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
import LoadWhistleClient from "@/components/chat/LoadWhistleClient";
import WhistleToggleMount from "@/components/chat/WhistleToggleMount";
import { getActiveSection } from "@/lib/sections";
import SubtleContentFade from "@/components/transitions/SubtleContentFade";

// types
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

// Section configs (per identity + per language)
import { SECTIONS_ES as FARM_ES } from "@/app/(main)/[lang]/farmtotable/sections.es";
import { SECTIONS_EN as FARM_EN } from "@/app/(main)/[lang]/farmtotable/sections.en";
import { SECTIONS_CASA_ES } from "@/app/(main)/[lang]/casa/sections.es";
import { SECTIONS_CASA_EN } from "@/app/(main)/[lang]/casa/sections.en";
import { SECTIONS_CAFE_ES } from "@/app/(main)/[lang]/cafe/sections.es";
import { SECTIONS_CAFE_EN } from "@/app/(main)/[lang]/cafe/sections.en";

// centralized layout tokens
import { DOCK, DOCK_COMPUTED } from "@/lib/ui/tokens";

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

  // 🔑 Derive language from the URL path, not just from props
  const pathLang: Lang =
    pathname === "/es" ||
    pathname.startsWith("/es/") ? "es" : "en";

  // single source of truth for section
  const { section } = getActiveSection(pathname);

  // Use the URL-derived lang for "home" detection
  const isHome = pathname === `/${pathLang}`;
  const allowHeroBreakout = !!section; // any identity page


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

  // CLS-safe header sizing: --header-h comes from CSS media queries in globals.css
  const mainStyle = (isMobile
    ? {
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
        "--mobile-nav-h": `${84}px`,
      }
    : {
        // centralized tokens
        "--dock-gutter": `${DOCK_COMPUTED.guttersPx}px`,
        "--dock-left": `${DOCK.leftPx + DOCK.gapPx}px`,
        "--dock-right": `${DOCK.rightPx + DOCK.gapPx}px`,
      }) satisfies StyleVars;

  // Desktop Dock-Right items (memo)
  const dockRightItems = useMemo<DockItem[]>(
    () => [
      { id: "about",        href: `/${pathLang}/about`,        label: dictionary.about.title,          icon: <Users /> },
      { id: "journal",      href: `/${pathLang}/journal`,      label: dictionary.journal.title,        icon: <BookOpen /> },
      { id: "sustainability", href: `/${pathLang}/sustainability`, label: dictionary.sustainability.title, icon: <Leaf /> },
      { id: "contact",      href: `/${pathLang}/contact`,      label: dictionary.contact.title,        icon: <Map /> },
      { id: "mesadelvalle", href: `/${pathLang}/mesadelvalle`, label: dictionary.mesadelvalle.title,   icon: <Wine /> },
    ],
    [pathLang, dictionary]
  );


  // Identity + section overrides (memo)
  const identity: "casa" | "farmtotable" | "cafe" | null = section?.id ?? null;

  const sectionsOverride: Override | undefined = useMemo(() => {
    if (section?.id === "farmtotable") return mapSections(pathLang === "es" ? FARM_ES : FARM_EN);
    if (section?.id === "casa")        return mapSections(pathLang === "es" ? SECTIONS_CASA_ES : SECTIONS_CASA_EN);
    if (section?.id === "cafe")        return mapSections(pathLang === "es" ? SECTIONS_CAFE_ES : SECTIONS_CAFE_EN);
    return undefined;
  }, [section?.id, pathLang]);


  // Mobile bottom nav items (memo)
  const mobileNavItems = useMemo(() => {
    if (section?.id === "casa") {
      const src = pathLang === "es" ? SECTIONS_CASA_ES : SECTIONS_CASA_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    if (section?.id === "farmtotable") {
      const src = pathLang === "es" ? FARM_ES : FARM_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    if (section?.id === "cafe") {
      const src = pathLang === "es" ? SECTIONS_CAFE_ES : SECTIONS_CAFE_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    return [];
  }, [section?.id, pathLang]);


  // Only load chat on identity pages (avoid loading on /about, /journal, etc.)
  const wantsChat = !isHome && !!section;

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
        <SubtleContentFade duration={0.65}>
          {allowHeroBreakout ? <NavigationProvider>{children}</NavigationProvider> : children}
        </SubtleContentFade>

      </main>

      {!isHome && <Footer dict={dictionary} />}

      {/* DESKTOP DOCKS */}
      {!isHome && !isMobile && (
        <ClientOnly>
          {identity && <DockLeft identity={identity} sectionsOverride={sectionsOverride ?? []} />}
          <DockRight items={dockRightItems} />
        </ClientOnly>
      )}

      {/* MOBILE BOTTOM NAV */}
      {!isHome && isMobile && mobileNavItems.length > 0 && (
        <ClientOnly>
          <div className="fixed bottom-[68px] inset-x-0 z-95 pointer-events-none">
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
          <DesktopChatButton lang={pathLang} />
        </ClientOnly>
      )}
    </>
  );
}

export default memo(LayoutShell);