// components/layout/LayoutShell.tsx
"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import ClientOnly from "@/components/providers/ClientOnly";
import MobileSectionNav from "@/components/navigation/MobileSectionNav";

import { useIsMobile } from "@/hooks/useMediaQuery";
import { useLenis } from "@/components/providers/ScrollProvider";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { getActiveSection } from "@/lib/sections";
import SubtleContentFade from "@/components/transitions/SubtleContentFade";

import { useContainerMobileLike } from "@/hooks/useContainerBreakpoint";
import type { Lang, AppDictionary } from "@/app/(main)/[lang]/dictionaries";

/* =========================
   Navbar split
   ========================= */
import DesktopNavbar from "@/components/layout/Navbar";

const MobileNavbar = dynamic(() => import("@/components/layout/MobileNavbar"), {
  ssr: false,
  loading: () => null,
});

/* =========================
   Desktop-only
   ========================= */
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
  loading: () => null,
});

const DockLeft = dynamic(() => import("@/components/navigation/DockLeft"), {
  ssr: false,
  loading: () => (
    <div
      className="hidden md:block fixed z-40 pointer-events-none"
      style={{
        left: "calc(var(--gutter) + env(safe-area-inset-left))",
        top: "50%",
        transform: "translateY(-50%)",
      }}
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

const DesktopChatButton = dynamic(() => import("@/components/ui/DesktopChatButton"), {
  ssr: false,
  loading: () => null,
});

/* =========================
   Chat
   ========================= */
const WhistleToggleMount = dynamic(
  () => import("@/components/chat/WhistleToggleMount"),
  { ssr: false, loading: () => null }
);
const LoadWhistleClient = dynamic(
  () => import("@/components/chat/LoadWhistleClient"),
  { ssr: false, loading: () => null }
);
const ChatCloseOverlay = dynamic(
  () => import("@/components/chat/ChatCloseOverlay"),
  { ssr: false, loading: () => null }
);

/* =========================
   DockRight icons (desktop-only)
   ========================= */
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

type SectionShape = Array<{
  id: string;
  title: string;
  subs?: Array<{ id: string; title: string }>;
}>;

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
    data =
      lang === "es"
        ? ((await import("@/app/(main)/[lang]/farmtotable/sections.es"))
            .SECTIONS_ES as SectionShape)
        : ((await import("@/app/(main)/[lang]/farmtotable/sections.en"))
            .SECTIONS_EN as SectionShape);
  } else if (identity === "casa") {
    data =
      lang === "es"
        ? ((await import("@/app/(main)/[lang]/casa/sections.es"))
            .SECTIONS_CASA_ES as SectionShape)
        : ((await import("@/app/(main)/[lang]/casa/sections.en"))
            .SECTIONS_CASA_EN as SectionShape);
  } else {
    data =
      lang === "es"
        ? ((await import("@/app/(main)/[lang]/cafe/sections.es"))
            .SECTIONS_CAFE_ES as SectionShape)
        : ((await import("@/app/(main)/[lang]/cafe/sections.en"))
            .SECTIONS_CAFE_EN as SectionShape);
  }

  _sectionsCache.set(key, data);
  return data;
}

function LayoutShell({ lang, dictionary, children }: LayoutShellProps) {
  const lenis = useLenis();
  const pathname = usePathname();

  // existing mobile detection (likely viewport-based)
  const isMobile = useIsMobile();

  // ✅ container-width based mobile-like (iPad portrait + split-view)
  const shellRef = useRef<HTMLDivElement | null>(null);
  const isContainerNarrow = useContainerMobileLike(shellRef, 960);

  const isMobileLike = isMobile || isContainerNarrow;

  // Spanish at `/`, English at `/en`
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
   * PERF: prefetch desktop-only chunks only when NOT mobile-like
   */
  const didPrefetchRef = useRef(false);
  useEffect(() => {
    if (isMobileLike) return;
    if (didPrefetchRef.current) return;

    const prefetch = () => {
      if (didPrefetchRef.current) return;
      didPrefetchRef.current = true;

      void import("@/components/layout/Footer");
      void import("@/components/navigation/DockRight");
      void import("@/components/navigation/DockLeft");
      void import("@/components/ui/DesktopChatButton");
      void import("lucide-react");
    };

    const onIntent = () => prefetch();

    window.addEventListener("pointerdown", onIntent, { passive: true, once: true });
    window.addEventListener("keydown", onIntent, { passive: true, once: true });
    window.addEventListener("wheel", onIntent, { passive: true, once: true });
    window.addEventListener("touchstart", onIntent, { passive: true, once: true });

    type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
    type IdleRequestCallback = (deadline: IdleDeadline) => void;
    type IdleRequestOptions = { timeout?: number };
    type IdleHandle = number;

    const idle = window as unknown as {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => IdleHandle;
      cancelIdleCallback?: (handle: IdleHandle) => void;
    };

    let idleId: IdleHandle | null = null;
    let timeoutId: number | null = null;

    if (idle.requestIdleCallback) {
      idleId = idle.requestIdleCallback(() => prefetch(), { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(prefetch, 1200);
    }

    return () => {
      window.removeEventListener("pointerdown", onIntent);
      window.removeEventListener("keydown", onIntent);
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchstart", onIntent);

      if (idleId !== null) idle.cancelIdleCallback?.(idleId);
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [isMobileLike]);

  // Lenis → CSS var (desktop only)
  useEffect(() => {
    if (isMobileLike) return;
    if (!lenis) return;

    const onScroll = ({ scroll }: { scroll: number }) => {
      document.documentElement.style.setProperty("--scroll", String(scroll));
    };

    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis, isMobileLike]);

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
    if (identity === "farmtotable") return { es: "Olivea Farm To Table", en: "Olivea Farm To Table" };
    if (identity === "casa") return { es: "Casa Olivea", en: "Casa Olivea" };
    if (identity === "cafe") return { es: "Olivea Café", en: "Olivea Café" };
    return { es: "Secciones", en: "Sections" };
  }, [identity]);

  const dockRightItems = useMemo<DockItem[]>(
    () => {
      if (isMobileLike) return [];
      return [
        { id: "press", href: `/${pathLang}/press`, label: dictionary.press.title, icon: <AwardIcon /> },
        { id: "sustainability", href: `/${pathLang}/sustainability`, label: dictionary.sustainability.title, icon: <LeafIcon /> },
        { id: "journal", href: `/${pathLang}/journal`, label: dictionary.journal.title, icon: <BookOpenIcon /> },
        { id: "team", href: `/${pathLang}/team`, label: dictionary.team.title, icon: <UsersIcon /> },
        { id: "contact", href: `/${pathLang}/contact`, label: dictionary.contact.title, icon: <MapIcon /> },
      ];
    },
    [isMobileLike, pathLang, dictionary]
  );

  const wantsChat = !isHome && !!section;

  return (
    <div ref={shellRef} className="w-full">
      {/* NAVBAR */}
      {!isHome && (
        <ClientOnly>
          {isMobileLike ? (
            <MobileNavbar dictionary={dictionary} />
          ) : (
            <DesktopNavbar lang={lang} dictionary={dictionary} />
          )}
        </ClientOnly>
      )}

      {/* Crawlable primary nav */}
      {!isHome && (
        <nav
          aria-label={pathLang === "en" ? "Primary navigation" : "Navegación principal"}
          className="sr-only"
        >
          <ul>
            <li><a href={`/${pathLang}/farmtotable`}>Olivea Farm To Table</a></li>
            <li><a href={`/${pathLang}/casa`}>Casa Olivea</a></li>
            <li><a href={`/${pathLang}/cafe`}>Olivea Café</a></li>
            <li><a href={`/${pathLang}/sustainability`}>{pathLang === "en" ? "Sustainability" : "Sostenibilidad"}</a></li>
            <li><a href={`/${pathLang}/journal`}>{pathLang === "en" ? "Journal" : "Bitácora"}</a></li>
          </ul>
        </nav>
      )}

      {/* MAIN */}
      <main
        data-hero-breakout={allowHeroBreakout ? "true" : "false"}
        className={
          isHome
            ? "p-0 m-0 overflow-hidden"
            : isJournal
              ? "w-full pt-16 md:pt-28 pb-20"
              : "w-full pt-16 md:pt-28 pb-20"
        }
        style={{
          paddingLeft: "max(var(--gutter), env(safe-area-inset-left))",
          paddingRight: "max(var(--gutter), env(safe-area-inset-right))",
        }}
      >
        <SubtleContentFade duration={0.65}>
          <div className={isHome ? "" : "mx-auto"} style={{ width: isHome ? undefined : "var(--content-w)" }}>
            {allowHeroBreakout ? <NavigationProvider>{children}</NavigationProvider> : children}
          </div>
        </SubtleContentFade>
      </main>

      {/* FOOTER */}
      {!isHome && !isMobileLike && <Footer dict={dictionary} />}

      {/* DOCKS */}
      {!isHome && !isMobileLike && (
        <>
          {identity && <DockLeft identity={identity} sectionsOverride={sectionsOverride ?? []} />}
          <DockRight items={dockRightItems} />
        </>
      )}

      {/* MOBILE-LIKE NAV (includes iPad portrait + split view) */}
      {!isHome && isMobileLike && mobileNavItems.length > 0 && (
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

      {/* CHAT */}
      {wantsChat && (
        <ClientOnly>
          <WhistleToggleMount />
          <LoadWhistleClient enabled />
          <ChatCloseOverlay />
        </ClientOnly>
      )}

      {/* Desktop chat trigger */}
      {!isHome && !isMobileLike && (
        <ClientOnly>
          <DesktopChatButton lang={pathLang} />
        </ClientOnly>
      )}
    </div>
  );
}

export default memo(LayoutShell);