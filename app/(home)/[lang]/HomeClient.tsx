// app/(home)/[lang]/HomeClient.tsx
"use client";

import { useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence, type Variants } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { cormHero } from "@/app/fonts";
import ReservationButton from "@components/ui/ReservationButton";
import InlineEntranceCard from "@components/ui/InlineEntranceCard";
import OliveaLogo from "@/assets/alebrije-1.svg";
import CasaLogo from "@/assets/alebrije-2.svg";
import FarmLogo from "@/assets/alebrije-1-Green.svg";
import CafeLogo from "@/assets/alebrije-3.svg";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useIntroAnimation } from "@/hooks/useIntroAnimation";
import { useMorphSequence } from "@/hooks/useMorphSequence";
import { HERO, TIMING, EASE } from "@/lib/introConstants";
import IntroBarFixed from "@/components/intro/IntroBarFixed";
import LazyShow from "@/components/ui/LazyShow";
import { watchLCP } from "@/lib/perf/watchLCP";
import type { SectionKey } from "@/contexts/SharedTransitionContext";

// Lazy-load the animated logo drawing component (no SSR)
const AlebrijeDraw = dynamic(() => import("@/components/animations/AlebrijeDraw"), {
  ssr: false,
  loading: () => null,
});

// Motion variants (unchanged)
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.3, staggerChildren: 0.2 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
};

export default function HomeClient() {
  // Perf watcher
  useEffect(() => {
    watchLCP();
  }, []);

  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isES = pathname?.startsWith("/es");
  const basePath = isES ? "/es" : "/en";

  // Reset potential "stuck" demotion of the FixedLCP overlay on route enter
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("lcp-demote");
    }
  }, []);

  // Intro animation composition (original)
  const {
    videoRef,
    heroBoxRef,
    logoTargetRef,
    overlayControls,
    innerScaleControls,
    logoControls,
    logoBobControls,
    allowLoader,
    showLoader,
    revealMain,
    introStarted,
    overlayGone,
    showVideo,
    hideBase,
    setOverlayGone,
    setShowLoader,
    setIntroStarted,
  } = useIntroAnimation(isMobile);

  // Morph sequence trigger (original)
  useMorphSequence(
    hideBase,
    introStarted,
    heroBoxRef,
    logoTargetRef,
    overlayControls,
    innerScaleControls,
    logoControls,
    logoBobControls,
    setOverlayGone,
    setShowLoader,
    setIntroStarted
  );

  // Localized copy + section config (original)
  type SectionDef = {
    href: string;
    title: string;
    description: string;
    Logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    sectionKey: SectionKey;
  };

  const descriptions = isES
    ? {
        casa: "Una estancia cerca del huerto.",
        farm: "Donde el huerto se goza.",
        cafe: "Despierta con sabor.",
      }
    : {
        casa: "A stay with nature's garden.",
        farm: "Where the garden is enjoyed.",
        cafe: "Wake up with flavor.",
      };

  const sections: SectionDef[] = [
    { href: `${basePath}/casa`,        title: "Casa Olivea",          description: descriptions.casa,  Logo: CasaLogo,  sectionKey: "casa" },
    { href: `${basePath}/farmtotable`, title: "Olivea Farm To Table",  description: descriptions.farm,  Logo: FarmLogo,  sectionKey: "farmtotable" },
    { href: `${basePath}/cafe`,        title: "Olivea Café",           description: descriptions.cafe,  Logo: CafeLogo,  sectionKey: "cafe" },
  ];

  const mobileSections = isMobile ? [sections[1], sections[0], sections[2]] : sections;
  const overlayBg = "var(--olivea-olive)";

  // helper for mobile gap calc (original)
  const vhPx =
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight) / 100
      : 8;
  const extraGap = Math.max(
    HERO.minGapPx,
    Math.round(HERO.baseGapPx - (HERO.vh - HERO.baseVh) * vhPx)
  );

  return (
    <LazyMotion features={domAnimation}>
      <>
        {/* Splash logo (original) */}
        <AnimatePresence>
          {allowLoader && showLoader && (
            <m.div
              key="logo-splash"
              className="fixed z-50 not-italic"
              initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
              animate={logoControls}
              style={{ width: 240, height: 240, transformOrigin: "center" }}
            >
              <m.div animate={logoBobControls}>
                <AlebrijeDraw size={240} strokeDuration={2.8} />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Intro overlay (original) */}
        <AnimatePresence>
          {introStarted && (
            <m.div
              key="overlay"
              className="fixed inset-0 z-40 not-italic"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: TIMING.crossfadeSec, ease: EASE.out } }}
              style={overlayGone ? { pointerEvents: "none" } : undefined}
            >
              <m.div
                className="absolute inset-0 not-italic"
                style={{ background: overlayBg, clipPath: "inset(0px 0px 0px 0px round 0px)", contain: "layout" }}
                animate={overlayControls}
              >
                <m.div
                  className="absolute inset-0 not-italic"
                  style={{ transformOrigin: "center", contain: "layout" }}
                  initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
                  animate={innerScaleControls}
                >
                  {/* Mobile vertical loader bar */}
                  <div className="absolute inset-0 md:hidden z-20 flex items-center justify-start pl-4 py-6 pointer-events-none select-none">
                    <div
                      className="relative w-2 h-2/3 bg-gray-200 rounded-full overflow-hidden"
                      style={{ "--bar-duration": "4s" } as React.CSSProperties}
                    >
                      <div className="absolute bottom-0 left-0 w-full h-full bg-[#e2be8f] rounded-full loader-vert" />
                    </div>
                  </div>
                  {/* Desktop percent bar */}
                  <IntroBarFixed />
                </m.div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Main (unchanged layout) */}
        <main
          className="fixed inset-0 z-10 flex flex-col items-center justify-start md:justify-center bg-[var(--olivea-cream)] transition-opacity duration-300 not-italic"
          style={{ opacity: revealMain ? 1 : 0 }}
        >
          <div
            ref={heroBoxRef}
            className="relative overflow-hidden shadow-xl mt-1 md:mt-0 bg-[var(--olivea-olive)] not-italic"
            style={{
              width: "98vw",
              height: isMobile ? `${HERO.vh}vh` : "98vh",
              borderRadius: "1.5rem",
              marginBottom: isMobile ? -HERO.overlapPx : 0,
            }}
          >
            {/* Mobile LCP image — add blur + demote FixedLCP on decode */}
            {isMobile && revealMain && !showVideo && (
              <Image
                src="/images/hero-mobile.avif"
                alt={isES ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience"}
                fill
                priority
                fetchPriority="high"
                decoding="async"
                loading="eager"
                sizes="98vw"
                quality={60}
                placeholder="blur"
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACw="
                className="object-cover"
                onLoadingComplete={() => {
                  // Demote the fixed overlay the moment the hero is decoded
                  if (typeof document !== "undefined") document.body.classList.add("lcp-demote");
                }}
              />
            )}

            {/* Mobile video (original gating) */}
            {isMobile && showVideo && (
              <video
                className="absolute inset-0 w-full h-full object-cover [--video-brightness:0.96] brightness-[var(--video-brightness)] pointer-events-none md:hidden"
                muted
                playsInline
                loop
                autoPlay
                preload="none"
                poster="/images/hero-mobile.avif"
                aria-hidden
                tabIndex={-1}
                disablePictureInPicture
                controls={false}
              >
                <source src="/videos/homepage-mobile.webm" type="video/webm" />
                <source src="/videos/homepage-mobile.mp4" type="video/mp4" />
              </video>
            )}

            {/* Desktop video (original) */}
            {!isMobile && (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover [--video-brightness:0.96] brightness-[var(--video-brightness)] pointer-events-none"
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
                poster="/images/hero.avif"
                aria-hidden
                tabIndex={-1}
              >
                <source src="/videos/homepage-HD.webm" type="video/webm" />
                <source src="/videos/homepage-HD.mp4" type="video/mp4" />
              </video>
            )}

            {/* Mobile title after overlay (original) */}
            <m.div
              className="absolute inset-0 md:hidden z-30 flex items-center justify-center pointer-events-none"
              variants={itemVariants}
              initial="hidden"
              animate={overlayGone ? "show" : "hidden"}
            >
              <span
                className={`${cormHero.className} italic text-[var(--olivea-mist)] text-lg tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] text-center`}
              >
                {isES ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience"}
              </span>
            </m.div>

            {/* gradient (original) */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/40 rounded-[1.5rem]" />
          </div>

          {/* Mobile cards + button (original) */}
          <m.div
            className="relative z-10 flex flex-col md:hidden flex-1 w-full px-4"
            variants={containerVariants}
            initial="hidden"
            animate={introStarted ? "hidden" : "show"}
            style={{ paddingTop: isMobile ? HERO.overlapPx + extraGap : 0 }}
          >
            <div className="space-y-12">
              {mobileSections.map((sec, index) => (
                <LazyShow key={sec.href}>
                  <m.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    style={
                      index === 0
                        ? { marginTop: isMobile ? -HERO.overlapPx : 0, position: "relative", zIndex: 20 }
                        : undefined
                    }
                  >
                    <InlineEntranceCard
                      title={sec.title}
                      href={sec.href}
                      sectionKey={sec.sectionKey}
                      description={sec.description}
                      Logo={sec.Logo}
                      className={index === 0 ? "relative z-30" : ""}
                      onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                    />
                  </m.div>
                </LazyShow>
              ))}
            </div>

            <m.div
              className="mt-auto w-full pb-6"
              variants={itemVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <ReservationButton />
            </m.div>
          </m.div>

          {/* Desktop flow (original, unchanged) */}
          <div className="absolute inset-0 hidden md:flex flex-col items-center z-40">
            <div
              ref={logoTargetRef}
              className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none"
            >
              <OliveaLogo className="w-full h-full" />
            </div>

            <span
              className={`${cormHero.className} italic mt-3 text-[var(--olivea-mist)] text-2xl lg:text-[26px] tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] pointer-events-none`}
            >
              {isES ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience"}
            </span>

            <div className="mt-6 lg:mt-8 flex gap-6 pointer-events-auto">
              {sections.map((sec) => (
                <InlineEntranceCard
                  key={sec.href}
                  title={sec.title}
                  href={sec.href}
                  sectionKey={sec.sectionKey}
                  description={sec.description}
                  Logo={sec.Logo}
                  onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                />
              ))}
            </div>

            <div className="mt-8 md:mt-16 pointer-events-auto">
              <ReservationButton />
            </div>
          </div>
        </main>
      </>
    </LazyMotion>
  );
}
