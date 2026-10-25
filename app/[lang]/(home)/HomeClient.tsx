// app/(home)/[lang]/HomeClient.tsx
"use client";

import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ReservationButton from "@components/ui/ReservationButton";
import InlineEntranceCard from "@components/ui/InlineEntranceCard";
import { useIsDesktop, useIsMobile } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useIntroAnimation } from "@/hooks/useIntroAnimation";
import { CASCADE, HERO, SPLASH, TIMING } from "@/lib/introConstants";
import IntroBarFixed from "@/components/intro/IntroBarFixed";
import AlebrijeDraw from "@/components/animations/AlebrijeDraw";
import { watchLCP } from "@/lib/perf/watchLCP";
import type { SectionKey } from "@/contexts/SharedTransitionContext";
import type { ReservationType } from "@/contexts/ReservationContext";
import { HOUSES } from "@/lib/houses";
import HeroMedia, { type VideoConfig } from "./HeroMedia";

const ALEBRIJE_SRC = "/brand/alebrije-1.svg";

// Motion variants (factory so we can pass reduce flag)
function makeContainerVariants(reduce: boolean): Variants {
  return reduce
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: { transition: { delayChildren: CASCADE.delaySec, staggerChildren: CASCADE.staggerSec } },
      };
}

// The phone cards rise one after another as the intro clears; each one lands
// over the card above it. Their emblems follow (see InlineEntranceCard).
function makeCardVariants(reduce: boolean): Variants {
  return reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] } },
      };
}

function makeItemVariants(reduce: boolean): Variants {
  return reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
      };
}

type SectionDef = {
  href: string;
  title: string;
  description: string;
  logoSrc: string;
  sectionKey: SectionKey;
};

/** Gap under the mobile hero, from the real viewport height (browser only). */
function useMobileHeroGap(): number {
  const [gap, setGap] = useState<number>(HERO.minGapPx);
  // Measured after hydration, before paint: the server has no viewport, so
  // computing this during render made the server and client HTML disagree.
  useLayoutEffect(() => {
    const measure = () => {
      const vhPx = (window.visualViewport?.height ?? window.innerHeight) / 100;
      setGap(Math.max(HERO.minGapPx, Math.round(HERO.baseGapPx - (HERO.vh - HERO.baseVh) * vhPx)));
    };
    measure();
    window.visualViewport?.addEventListener("resize", measure);
    return () => window.visualViewport?.removeEventListener("resize", measure);
  }, []);
  return gap;
}

export default function HomeClient({ lang, videoConfig }: { lang: "es" | "en"; videoConfig?: VideoConfig }) {
  // No manual preload of the alebrije. On Vercel, Next adds a deployment tag
  // (?dpl=…) to the logo <img> but not to a hand-written preload, so the two
  // never matched and the preload was a wasted download with a console
  // warning (and as a fetch preload Safari never matched it either). The
  // intro's own fetch starts as soon as its code runs; the intro waits for it.
  const reduce = usePrefersReducedMotion();
  const containerVariants = useMemo(() => makeContainerVariants(reduce), [reduce]);
  const itemVariants = useMemo(() => makeItemVariants(reduce), [reduce]);
  const cardVariants = useMemo(() => makeCardVariants(reduce), [reduce]);

  useEffect(() => {
    watchLCP();
  }, []);

  const isMobile = useIsMobile();
  // The stacked layout (hero on top, cards below) runs until the desktop
  // layout takes over at lg (1024 px) — tablets included. The hero's height,
  // the card order and the spacing all follow this one switch; tablets used
  // to get the desktop hero height (100%) with the stacked cards, which pushed
  // the cards off the screen.
  const stacked = !useIsDesktop();
  // The language comes from the route, never from the address: "/" is the
  // Spanish site through a rewrite, and when the cached page regenerated after
  // a visit to "/", startsWith("/es") was false and the Spanish page was
  // cached in English (React #418 for every visitor until it regenerated).
  const isES = lang === "es";
  const basePath = isES ? "/es" : "/en";
  const extraGap = useMobileHeroGap();

  const {
    mode,
    videoRef,
    heroBoxRef,
    logoTargetRef,
    overlayControls,
    logoControls,
    logoBobControls,
    onAlebrijeDrawn,
    showSplash,
    introActive,
    overlayGone,
    loaderHidden,
  } = useIntroAnimation(stacked);

  // Each card carries the place's own name, so guests learn the houses of
  // OLIVEA, and a few words saying what kind of place it is (lib/houses.ts,
  // shared with the reservation window).
  const sections = useMemo<SectionDef[]>(() => {
    const card = (id: ReservationType, href: string, sectionKey: SectionKey): SectionDef => ({
      href: `${basePath}/${href}`,
      title: HOUSES[id].name,
      description: HOUSES[id].descriptor[lang],
      logoSrc: HOUSES[id].emblem,
      sectionKey,
    });
    return [
      card("hotel", "casa", "casa"),
      card("restaurant", "farmtotable", "farmtotable"),
      card("cafe", "cafe", "cafe"),
    ];
  }, [basePath, lang]);

  const mobileSections = useMemo(() => {
    return stacked ? [sections[1], sections[0], sections[2]] : sections;
  }, [stacked, sections]);

  const heroAlt = isES ? "OLIVEA · Hospitalidad del Huerto" : "OLIVEA · Farm Hospitality";
  const barDuration = `${SPLASH.drawSec}s`;

  return (
    <LazyMotion features={domAnimation}>
      <>
        {/* Without JavaScript there is no intro: show the page. */}
        <noscript>
          <style>{`.intro-overlay{display:none !important}`}</style>
        </noscript>

        {/* Splash alebrije */}
        <AnimatePresence>
          {showSplash && (
            <m.div
              key="logo-splash"
              className="fixed z-50 not-italic pointer-events-none"
              initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
              animate={logoControls}
              style={{ width: SPLASH.sizePx, height: SPLASH.sizePx, transformOrigin: "center" }}
            >
              <m.div animate={logoBobControls}>
                <AlebrijeDraw
                  src={ALEBRIJE_SRC}
                  size={SPLASH.sizePx}
                  strokeDuration={SPLASH.drawSec}
                  instant={mode === "quick"}
                  onComplete={onAlebrijeDrawn}
                />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Intro overlay */}
        <AnimatePresence>
          {introActive && (
            <m.div
              key="overlay"
              className="intro-overlay fixed inset-0 z-40 not-italic"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: TIMING.crossfadeSec, ease: [0.19, 1, 0.22, 1] },
              }}
              style={overlayGone ? { pointerEvents: "none" } : undefined}
            >
              <m.div
                className="absolute inset-0 not-italic"
                style={{
                  background: "var(--olivea-olive)",
                  clipPath: "inset(0px 0px 0px 0px round 0px)",
                  contain: "layout",
                }}
                animate={overlayControls}
              >
                {/* The loader bars fade out before the screen shrinks. */}
                <div
                  className="absolute inset-0 not-italic transition-opacity duration-200 ease-out"
                  style={{ opacity: loaderHidden ? 0 : 1 }}
                >
                  {/* Mobile vertical loader bar — fills while the alebrije draws */}
                  <div className="absolute inset-0 lg:hidden z-20 flex items-center justify-start pl-4 py-6 pointer-events-none select-none">
                    <div
                      className="relative w-2 h-2/3 bg-gray-200 rounded-full overflow-hidden"
                      style={{ "--bar-duration": barDuration } as React.CSSProperties}
                    >
                      <div className="absolute bottom-0 left-0 w-full h-full bg-[#e7eae1] rounded-full loader-vert" />
                    </div>
                  </div>

                  {/* Desktop percent bar */}
                  <IntroBarFixed durationMs={SPLASH.drawSec * 1000} />
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Main */}
        {/* Below lg the page scrolls when it does not fit (short phones, a
            phone turned sideways); it used to be a fixed column that squeezed
            the hero to nothing and cut off whatever was below the screen. */}
        <main
          id="main-content"
          className="
            fixed inset-0 z-10 flex flex-col items-center justify-start lg:justify-center
            overflow-y-auto overscroll-contain lg:overflow-hidden
            bg-(--olivea-cream) not-italic
            p-3 lg:p-6 pwa-safe-top
          "
        >
          <h1 className="sr-only">
            {isES
              ? "OLIVEA — Hospitalidad del Huerto en Valle de Guadalupe: Restaurante con Estrella MICHELIN, Hospedaje y Café"
              : "OLIVEA — Farm Hospitality in Valle de Guadalupe: MICHELIN-Starred Restaurant, Farm Stay & Café"}
          </h1>

          {/* Frame fills the padded area exactly */}
          <div
            ref={heroBoxRef}
            // Sized by CSS breakpoints, not JavaScript, so it is right in the
            // server HTML on every screen (a JS-measured height made the page
            // jump once it started: CLS 0.24 on desktop). On a phone the video
            // gives way, not the cards: when the three cards and the reserve
            // bar don't fit, it shrinks (down to a floor) so every card stays
            // on screen. The cards keep their size; the page scrolls only
            // below the floor.
            className="
              relative shrink lg:shrink-0 overflow-hidden shadow-xl mt-0 bg-(--olivea-olive) not-italic
              w-full rounded-3xl h-[max(29vh,150px)] min-h-[130px] tiny:min-h-[110px] -mb-2.5 lg:h-full lg:mb-0
            "
          >
            <HeroMedia
              isMobile={isMobile}
              alt={heroAlt}
              videoConfig={videoConfig}
              videoRef={videoRef}
              introDone={overlayGone}
            />

            {/* Mobile title after overlay */}
            <m.div
              className="absolute inset-0 lg:hidden z-30 flex items-center justify-center pointer-events-none"
              variants={itemVariants}
              initial="hidden"
              animate={overlayGone ? "show" : "hidden"}
            >
              <span className="font-corm-hero italic text-(--olivea-mist) text-lg tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] text-center">
                {heroAlt}
              </span>
            </m.div>

            {/* gradient */}
            <div className="absolute inset-0 z-1 pointer-events-none bg-linear-to-b from-transparent via-black/10 to-black/40 rounded-3xl" />
          </div>

          {/* Hidden plain nav links (no visual impact, improves crawl clarity) */}
          <nav aria-label={isES ? "Navegación principal" : "Primary navigation"} className="sr-only">
            <ul>
              {sections.map((sec) => (
                <li key={sec.href}>
                  <Link href={sec.href}>{sec.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile cards */}
          <m.div
            className="relative z-10 flex flex-col lg:hidden flex-1 w-full px-4"
            variants={containerVariants}
            initial="hidden"
            animate={overlayGone ? "show" : "hidden"}
            style={{ paddingTop: stacked ? HERO.overlapPx + extraGap : 0 }}
          >
            <nav aria-label={isES ? "Navegación principal" : "Primary navigation"}>
              {/* pb-30 keeps the last card clear of the fixed reserve bar. On
                  the shortest screens the cards close up and each emblem
                  rests a little over the card above it. */}
              <ul className="space-y-12 short:space-y-10 tiny:space-y-5 pb-30">
                {mobileSections.map((sec, index) => (
                  // Each card sits above the one before it, so its emblem
                  // rests over the card above (never under its shadow). The
                  // whole list sits above the video (z-10 on the list). The list
                  // drives the entrance: no animate of the cards' own here, or
                  // the cascade breaks and plays unseen behind the intro.
                  <li key={sec.href} className="relative" style={{ zIndex: index + 1 }}>
                    <m.div
                      variants={cardVariants}
                      style={index === 0 && stacked ? { marginTop: -HERO.overlapPx } : undefined}
                    >
                      <InlineEntranceCard
                        title={sec.title}
                        href={sec.href}
                        sectionKey={sec.sectionKey}
                        description={sec.description}
                        logoSrc={sec.logoSrc}
                        // The emblem is decorative: the title already names the card.
                        logoAlt=""
                        size="compact"
                        entranceOrder={index}
                        onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                      />
                    </m.div>
                  </li>
                ))}
              </ul>
            </nav>
          </m.div>

          {/* FIXED bottom bar (mobile only) */}
          <div
            className="
              fixed bottom-0 left-0 right-0 lg:hidden z-40
              px-4
              pt-3
              pb-[max(env(safe-area-inset-bottom),16px)]
              bg-linear-to-t from-(--olivea-cream)/95 to-transparent
              short:bg-(--olivea-cream)/95 short:bg-none
              backdrop-blur-sm
            "
          >
            <ReservationButton forceMobile className="w-full" />
          </div>

          {/* Desktop flow */}
          <div className="absolute inset-0 hidden lg:flex flex-col items-center z-40">
            <div
              ref={logoTargetRef}
              className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none"
            >
              <Image
                src="/brand/alebrije-1.svg"
                alt="Olivea"
                fill
                sizes="(min-width: 1024px) 224px, (min-width: 768px) 192px, 144px"
                className="object-contain"
                // eager (not priority): it's the detected LCP on desktop, but
                // we don't want it preloaded ahead of the hero image
                loading="eager"
              />
            </div>

            {/* Two shadows: a close one keeps the thin italic crisp, a wide
                soft one calms the moving leaves behind it. */}
            <span
              className="font-corm-hero italic mt-3 text-(--olivea-mist) text-2xl lg:text-[28px] tracking-wide pointer-events-none"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.45), 0 2px 18px rgba(0,0,0,0.38)" }}
            >
              {heroAlt}
            </span>

            <nav aria-label={isES ? "Navegación principal" : "Primary navigation"} className="mt-6 lg:mt-8 pointer-events-auto">
              {/* Keep INLINE on desktop — fluid gaps scale with viewport */}
              <ul className="flex justify-center" style={{ gap: "clamp(1rem, 2.5vw, 4rem)" }}>
                {sections.map((sec) => (
                  <li key={sec.href}>
                    <InlineEntranceCard
                      title={sec.title}
                      href={sec.href}
                      sectionKey={sec.sectionKey}
                      description={sec.description}
                      logoSrc={sec.logoSrc}
                      logoAlt=""
                      size="full"
                      fluidDesktop
                      onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 lg:mt-16 pointer-events-auto">
              <ReservationButton />
            </div>
          </div>
        </main>
      </>
    </LazyMotion>
  );
}
