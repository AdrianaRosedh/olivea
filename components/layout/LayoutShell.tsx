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
import { BookOpen, Leaf, Map, Users, Wine } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/providers/ScrollProvider";
import { NavigationProvider } from "@/contexts/NavigationContext";
import NextGenBackgroundInitializer from "@/components/animations/NextGenBackgroundInitializer";
import NextGenBackground from "@/components/animations/NextGenBackground";
import DesktopChatButton from "@/components/ui/DesktopChatButton";

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
  const [mounted, setMounted] = useState(false);

  // Lenis → CSS var
  useEffect(() => {
    const onScroll = ({ scroll }: { scroll: number }) => {
      document.documentElement.style.setProperty("--scroll", String(scroll));
    };
    lenis.on("scroll", onScroll);
    return () => void lenis.off("scroll", onScroll);
  }, [lenis]);

  useEffect(() => setMounted(true), []);

  const isHome           = pathname === `/${lang}`;
  const isCasaPage       = pathname.includes("/casa");
  const isRestaurantPage = pathname.includes("/farmtotable");
  const isCafePage       = pathname.includes("/cafe");

  //
  // ─── MOBILE BOTTOM NAV ITEMS ─────────────────────────────────────────────────
  //
  const mobileNavItems = (() => {
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
  })();

  //
  // ─── DESKTOP DOCK-RIGHT ITEMS ────────────────────────────────────────────────
  //
  const dockRightItems: DockItem[] = [
    { id: "about",          href: `/${lang}/about`,          label: dictionary.about.title,          icon: <Users /> },
    { id: "journal",        href: `/${lang}/journal`,        label: dictionary.journal.title,        icon: <BookOpen /> },
    { id: "sustainability", href: `/${lang}/sustainability`, label: dictionary.sustainability.title, icon: <Leaf /> },
    { id: "contact",        href: `/${lang}/contact`,        label: dictionary.contact.title,        icon: <Map /> },
    { id: "mesadelvalle",   href: `/${lang}/mesadelvalle`,   label: dictionary.mesadelvalle.title,   icon: <Wine /> },
  ];

  //
  // ─── WHICH IDENTITY FOR DOCK‐LEFT? ───────────────────────────────────────────
  //
  const identity: "casa" | "farmtotable" | "cafe" | null =
    isCasaPage ? "casa" : isRestaurantPage ? "farmtotable" : isCafePage ? "cafe" : null;

  // Build the override per-identity (so DockLeft never depends on dictionary sections)
  const sectionsOverride: Override | undefined = (() => {
    if (isRestaurantPage) return mapSections(lang === "es" ? FARM_ES : FARM_EN);
    if (isCasaPage)       return mapSections(lang === "es" ? SECTIONS_CASA_ES : SECTIONS_CASA_EN);
    if (isCafePage)       return mapSections(lang === "es" ? SECTIONS_CAFE_ES : SECTIONS_CAFE_EN);
    return undefined;
  })();

  return (
    <>
      <NextGenBackgroundInitializer />
      <NextGenBackground />

      {mounted && !isHome && <Navbar lang={lang} dictionary={dictionary} />}

      <main className={isHome ? "p-0 m-0 overflow-hidden" : "max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20"}>
        {(isCasaPage || isRestaurantPage || isCafePage)
          ? <NavigationProvider>{children}</NavigationProvider>
          : children}
      </main>

      {mounted && !isHome && <Footer dict={dictionary} />}

      {/* ── DESKTOP DOCKS ─────────────────────────────────────────────── */}
      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          {identity && (
            <DockLeft
              identity={identity}
              sectionsOverride={sectionsOverride ?? []}
            />
          )}
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

      {/* ── CHAT BUTTON ──────────────────────────────────────────────── */}
      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          <DesktopChatButton lang={lang} />
        </ClientOnly>
      )}
    </>
  );
}

export default memo(LayoutShell);
