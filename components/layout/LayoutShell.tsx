// components/layout/LayoutShell.tsx
"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import ClientOnly from "@/components/providers/ClientOnly";
import MobileSectionNav from "@/components/navigation/MobileSectionNav";

import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/providers/ScrollProvider";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { getActiveSection } from "@/lib/sections";
import SubtleContentFade from "@/components/transitions/SubtleContentFade";
import { DOCK, DOCK_COMPUTED } from "@/lib/ui/tokens";

import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

/* =========================
   Navbar split
   ========================= */
// Keep desktop navbar static for best desktop feel
import DesktopNavbar from "@/components/layout/Navbar";

// Mobile navbar loads only on mobile
const MobileNavbar = dynamic(() => import("@/components/layout/MobileNavbar"), {
  ssr: false,
  loading: () => null,
});

/* =========================
   Desktop-only: dynamic imports
   ========================= */
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
  loading: () => null,
});

/**
 * ✅ IMPORTANT perf win:
 * DockLeft is client-only (needs IO / framer / optional gsap), so it can't SSR easily.
 * But rendering a skeleton immediately prevents “empty then pop-in”.
 */
const DockLeft = dynamic(() => import("@/components/navigation/DockLeft"), {
  ssr: false,
  loading: () => (
    <div
      className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div className="w-55">
        <div className="h-3 w-28 rounded bg-black/5 mb-6" />
        <div className="flex flex-col gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 w-10 rounded bg-black/5" />
              <div className="h-5 w-36 rounded bg-black/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

const DockRight = dynamic(() => import("@/components/navigation/DockRight"), {
  ssr: false,
  loading: () => null,
});

const DesktopChatButton = dynamic(
  () => import("@/components/ui/DesktopChatButton"),
  {
    ssr: false,
    loading: () => null,
  }
);

// Chat: only load when wantsChat = true
const WhistleToggleMount = dynamic(
  () => import("@/components/chat/WhistleToggleMount"),
  {
    ssr: false,
    loading: () => null,
  }
);
const LoadWhistleClient = dynamic(
  () => import("@/components/chat/LoadWhistleClient"),
  {
    ssr: false,
    loading: () => null,
  }
);
const ChatCloseOverlay = dynamic(
  () => import("@/components/chat/ChatCloseOverlay"),
  {
    ssr: false,
    loading: () => null,
  }
);

/* =========================
   DockRight icons (desktop-only)
   ========================= */
// DockRight icons are desktop-only. Keep lucide out of the mobile bundle.
const IconFallback = ({ size = 22 }: { size?: number }) => (
  <span style={{ width: size, height: size, display: "inline-block" }} aria-hidden />
);

const AwardIcon = dynamic(() => import("lucide-react").then((m) => m.Award), {
  ssr: false,
  loading: () => <IconFallback />,
});
const LeafIcon = dynamic(() => import("lucide-react").then((m) => m.Leaf), {
  ssr: false,
  loading: () => <IconFallback />,
});
const BookOpenIcon = dynamic(() => import("lucide-react").then((m) => m.BookOpen), {
  ssr: false,
  loading: () => <IconFallback />,
});
const UsersIcon = dynamic(() => import("lucide-react").then((m) => m.Users), {
  ssr: false,
  loading: () => <IconFallback />,
});
const MapIcon = dynamic(() => import("lucide-react").then((m) => m.Map), {
  ssr: false,
  loading: () => <IconFallback />,
});

/* ========================= */

interface LayoutShellProps {
  lang: Lang;
  dictionary: AppDictionary;
  children: React.ReactNode;
}

type Identity = "casa" | "farmtotable" | "cafe";
type Override = Array<{
  id: string;
  label: string;
  subs?: Array<{ id: string; label: string }>;
}>;
type DockItem = { id: string; href: string; label: string; icon: React.ReactNode };

type StyleVars = React.CSSProperties & {
  ["--dock-gutter"]?: string;
  ["--dock-left"]?: string;
  ["--dock-right"]?: string;
  ["--mobile-nav-h"]?: string;
};

type SectionShape = Array<{ id: string; title: string; subs?: Array<{ id: string; title: string }> }>;

const mapSections = (arr: SectionShape): Override =>
  arr.map((s) => ({
    id: s.id,
    label: s.title,
    subs: s.subs?.map((ss) => ({ id: ss.id, label: ss.title })),
  }));

/** cache section module loads across navigations */
const _sectionsCache = new Map<string, SectionShape>();

async function loadSections(identity: Identity, lang: Lang): Promise<SectionShape> {
  const key = `${identity}:${lang}`;
  const cached = _sectionsCache.get(key);
  if (cached) return cached;

  let data: SectionShape;

  if (identity === "farmtotable") {
    if (lang === "es") {
      const mod = await import("@/app/(main)/[lang]/farmtotable/sections.es");
      data = mod.SECTIONS_ES as SectionShape;
    } else {
      const mod = await import("@/app/(main)/[lang]/farmtotable/sections.en");
      data = mod.SECTIONS_EN as SectionShape;
    }
  } else if (identity === "casa") {
    if (lang === "es") {
      const mod = await import("@/app/(main)/[lang]/casa/sections.es");
      data = mod.SECTIONS_CASA_ES as SectionShape;
    } else {
      const mod = await import("@/app/(main)/[lang]/casa/sections.en");
      data = mod.SECTIONS_CASA_EN as SectionShape;
    }
  } else {
    if (lang === "es") {
      const mod = await import("@/app/(main)/[lang]/cafe/sections.es");
      data = mod.SECTIONS_CAFE_ES as SectionShape;
    } else {
      const mod = await import("@/app/(main)/[lang]/cafe/sections.en");
      data = mod.SECTIONS_CAFE_EN as SectionShape;
    }
  }

  _sectionsCache.set(key, data);
  return data;
}

function LayoutShell({ lang, dictionary, children }: LayoutShellProps) {
  const lenis = useLenis();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  /**
   * ✅ IMPORTANT correctness + perf:
   * Your site uses Spanish at `/` and English at `/en`.
   * So "language from URL" should be:
   * - startsWith("/en") => en
   * - else => es
   *
   * This prevents wrong "home" detection and avoids loading the wrong layout paths.
   */
  const pathLang: Lang = pathname?.startsWith("/en") ? "en" : "es";

  const { section } = getActiveSection(pathname);
  const identity: Identity | null = (section?.id as Identity) ?? null;

  const isHome = pathname === "/" || pathname === "/en";
  const isJournal =
    pathname?.includes("/journal") ||
    pathname?.includes("/diario") ||
    pathname?.includes("/posts");
  const allowHeroBreakout = !!section || isJournal;

  /**
   * ✅ Prefetch desktop-only chunks earlier (big perceived speed win)
   * Your previous requestIdleCallback strategy is “nice”, but it causes visible late pop-in
   * on slower connections/devices. This prefetch happens almost immediately after mount.
   */
  useEffect(() => {
    if (isMobile) return;

    const prefetch = () => {
      void import("@/components/layout/Footer");
      void import("@/components/navigation/DockRight");
      void import("@/components/navigation/DockLeft");
      void import("@/components/ui/DesktopChatButton");
      void import("lucide-react");
    };

    const t = window.setTimeout(prefetch, 1);
    return () => window.clearTimeout(t);
  }, [isMobile]);

  // Lenis → CSS var (desktop only)
  useEffect(() => {
    if (isMobile) return;
    if (!lenis) return;

    const onScroll = ({ scroll }: { scroll: number }) => {
      document.documentElement.style.setProperty("--scroll", String(scroll));
    };

    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis, isMobile]);

  const mainStyle = (isMobile
    ? {
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
        "--mobile-nav-h": `${84}px`,
      }
    : {
        "--dock-gutter": `${DOCK_COMPUTED.guttersPx}px`,
        "--dock-left": `${DOCK.leftPx + DOCK.gapPx}px`,
        "--dock-right": `${DOCK.rightPx + DOCK.gapPx}px`,
      }) satisfies StyleVars;

  // Load only the active identity sections (lazy)
  const [sectionData, setSectionData] = useState<SectionShape | null>(null);

  useEffect(() => {
    let alive = true;

    if (!identity) {
      setSectionData(null);
      return;
    }

    loadSections(identity, pathLang).then((data) => {
      if (!alive) return;
      setSectionData(data);
    });

    return () => {
      alive = false;
    };
  }, [identity, pathLang]);

  const sectionsOverride: Override | undefined = useMemo(() => {
    if (!sectionData) return undefined;
    return mapSections(sectionData);
  }, [sectionData]);

  const mobileNavItems = useMemo(() => {
    if (!sectionData) return [];
    return sectionData.map((s) => ({
      id: s.id,
      label: s.title,
      subs: s.subs?.map((ss) => ({ id: ss.id, label: ss.title })),
    }));
  }, [sectionData]);

  const mobilePageTitle = useMemo(() => {
    if (identity === "farmtotable")
      return { es: "Olivea Farm To Table", en: "Olivea Farm To Table" };
    if (identity === "casa") return { es: "Casa Olivea", en: "Casa Olivea" };
    if (identity === "cafe") return { es: "Olivea Café", en: "Olivea Café" };
    return { es: "Secciones", en: "Sections" };
  }, [identity]);

  // DockRight items only for desktop
  const dockRightItems = useMemo<DockItem[]>(
    () => {
      if (isMobile) return [];

      return [
        {
          id: "press",
          href: `/${pathLang}/press`,
          label: dictionary.press.title,
          icon: <AwardIcon />,
        },
        {
          id: "sustainability",
          href: `/${pathLang}/sustainability`,
          label: dictionary.sustainability.title,
          icon: <LeafIcon />,
        },
        {
          id: "journal",
          href: `/${pathLang}/journal`,
          label: dictionary.journal.title,
          icon: <BookOpenIcon />,
        },
        {
          id: "team",
          href: `/${pathLang}/team`,
          label: dictionary.team.title,
          icon: <UsersIcon />,
        },
        {
          id: "contact",
          href: `/${pathLang}/contact`,
          label: dictionary.contact.title,
          icon: <MapIcon />,
        },
      ];
    },
    [isMobile, pathLang, dictionary]
  );

  const wantsChat = !isHome && !!section;

  return (
    <>
      {/* NAVBAR (KEEP THIS EXACT PATTERN) */}
      {!isHome && (
        <ClientOnly>
          {isMobile ? (
            <MobileNavbar dictionary={dictionary} />
          ) : (
            <DesktopNavbar lang={lang} dictionary={dictionary} />
          )}
        </ClientOnly>
      )}

      {/* ✅ Always-present crawlable primary nav (no visual impact) */}
      {!isHome && (
        <nav
          aria-label={pathLang === "en" ? "Primary navigation" : "Navegación principal"}
          className="sr-only"
        >
          <ul>
            <li>
              <a href={`/${pathLang}/farmtotable`}>Olivea Farm To Table</a>
            </li>
            <li>
              <a href={`/${pathLang}/casa`}>Casa Olivea</a>
            </li>
            <li>
              <a href={`/${pathLang}/cafe`}>Olivea Café</a>
            </li>
            <li>
              <a href={`/${pathLang}/sustainability`}>
                {pathLang === "en" ? "Sustainability" : "Sostenibilidad"}
              </a>
            </li>
            <li>
              <a href={`/${pathLang}/journal`}>{pathLang === "en" ? "Journal" : "Bitácora"}</a>
            </li>
          </ul>
        </nav>
      )}

      <main
        data-hero-breakout={allowHeroBreakout ? "true" : "false"}
        className={
          isHome
            ? "p-0 m-0 overflow-hidden"
            : isJournal
              ? "w-full pt-16 md:pt-28 pb-20 md:px-0"
              : "mx-auto w-full max-w-275 pt-16 md:pt-28 md:px-8 pb-20"
        }
        style={mainStyle}
      >
        <SubtleContentFade duration={0.65}>
          {allowHeroBreakout ? <NavigationProvider>{children}</NavigationProvider> : children}
        </SubtleContentFade>
      </main>

      {/* FOOTER (YES) */}
      {!isHome && !isMobile && <Footer dict={dictionary} />}

      {/* DESKTOP DOCKS (YES) */}
      {!isHome && !isMobile && (
        <>
          {identity && <DockLeft identity={identity} sectionsOverride={sectionsOverride ?? []} />}
          <DockRight items={dockRightItems} />
        </>
      )}

      {/* MOBILE BOTTOM NAV (unchanged) */}
      {!isHome && isMobile && mobileNavItems.length > 0 && (
        <ClientOnly>
          <div className="relative z-300 lg:hidden">
            <MobileSectionNav
              items={mobileNavItems}
              lang={pathLang}
              pageTitle={mobilePageTitle}
              enableSubRow={false}
            />
          </div>
        </ClientOnly>
      )}

      {/* CHAT (unchanged) */}
      {wantsChat && (
        <ClientOnly>
          <WhistleToggleMount />
          <LoadWhistleClient enabled />
          <ChatCloseOverlay />
        </ClientOnly>
      )}

      {/* Desktop chat trigger (KEEP THIS) */}
      {!isHome && !isMobile && (
        <ClientOnly>
          <DesktopChatButton lang={pathLang} />
        </ClientOnly>
      )}
    </>
  );
}

export default memo(LayoutShell);