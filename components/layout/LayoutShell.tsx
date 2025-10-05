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

// ✅ import your per-language FarmToTable section configs
import { SECTIONS_ES } from "@/app/(main)/[lang]/farmtotable/sections.es";
import { SECTIONS_EN } from "@/app/(main)/[lang]/farmtotable/sections.en";

interface LayoutShellProps {
  lang: Lang;
  dictionary: AppDictionary;
  children: React.ReactNode;
}

type DockItem = { id: string; href: string; label: string; icon: React.ReactNode };

// helper to map config → DockLeft override shape
type Override = Array<{ id: string; label: string; subs?: Array<{ id: string; label: string }> }>;
const toOverride = (
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
    function onScroll({ scroll }: { scroll: number }) {
      document.documentElement.style.setProperty("--scroll", String(scroll));
    }
    lenis.on("scroll", onScroll);
    return () => void lenis.off("scroll", onScroll);
  }, [lenis]);

  useEffect(() => setMounted(true), []);

  const isHome = pathname === `/${lang}`;
  const isCasaPage = pathname.includes("/casa");
  const isRestaurantPage = pathname.includes("/farmtotable");
  const isCafePage = pathname.includes("/cafe");

  //
  // ─── MOBILE BOTTOM NAV ITEMS ─────────────────────────────────────────────────
  //
  const mobileNavItems = (() => {
    if (isCasaPage) {
      const keys = Object.keys(dictionary.casa.sections);
      return keys.map((id) => ({
        id,
        label: dictionary.casa.sections[id].title,
      }));
    }
    if (isRestaurantPage) {
      // 🔁 drive from TS configs, not dictionary
      const src = lang === "es" ? SECTIONS_ES : SECTIONS_EN;
      return src.map((s) => ({ id: s.id, label: s.title }));
    }
    if (isCafePage) {
      const keys = Object.keys(dictionary.cafe.sections);
      return keys.map((id) => ({
        id,
        label: dictionary.cafe.sections[id].title,
      }));
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
  // ─── WHICH IDENTITY FOR DOCK-LEFT? ───────────────────────────────────────────
  //
  const identity: "casa" | "farmtotable" | "cafe" | null =
    isCasaPage ? "casa" : isRestaurantPage ? "farmtotable" : isCafePage ? "cafe" : null;

  // 🔁 Build the override only on /farmtotable
  const sectionsOverride = isRestaurantPage
    ? toOverride(lang === "es" ? SECTIONS_ES : SECTIONS_EN)
    : undefined;

  return (
    <>
      <NextGenBackgroundInitializer />
      <NextGenBackground />

      {mounted && !isHome && <Navbar lang={lang} dictionary={dictionary} />}

      <main className={isHome ? "p-0 m-0 overflow-hidden" : "max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20"}>
        {isCasaPage || isRestaurantPage || isCafePage ? (
          <NavigationProvider>{children}</NavigationProvider>
        ) : (
          children
        )}
      </main>

      {mounted && !isHome && <Footer dict={dictionary} />}

      {/* ── DESKTOP DOCKS ─────────────────────────────────────────────── */}
      {mounted && !isHome && !isMobile && (
        <ClientOnly>
          {identity && (
            <DockLeft
              dict={dictionary}
              identity={identity}
              sectionsOverride={sectionsOverride} // ✅ uses MDX config for /farmtotable
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
