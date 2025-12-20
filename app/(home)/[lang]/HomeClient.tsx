// app/(home)/[lang]/HomeClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
import { HERO, TIMING } from "@/lib/introConstants";
import IntroBarFixed from "@/components/intro/IntroBarFixed";
import LazyShow from "@/components/ui/LazyShow";
import { watchLCP } from "@/lib/perf/watchLCP";
import type { SectionKey } from "@/contexts/SharedTransitionContext";

// Animated logo (client only)
const AlebrijeDraw = dynamic(() => import("@/components/animations/AlebrijeDraw"), {
  ssr: false,
  loading: () => null,
});

// Motion variants
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
  useEffect(() => {
    watchLCP();
    // ensure FixedLCP is reset on entry
    if (typeof document !== "undefined") document.body.classList.remove("lcp-demote");
  }, []);

  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isES = pathname?.startsWith("/es");
  const basePath = isES ? "/es" : "/en";

  // Intro animation composition
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
    showVideo,              // can still drive video; we’ll OR it with our local gate
    hideBase,
    setOverlayGone,
    setShowLoader,
    setIntroStarted,
  } = useIntroAnimation(isMobile);

  // Morph sequence (unchanged)
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

  // --- Mobile video show logic ---
  // 1) wait for hero image decode (so image wins LCP)
  // 2) after a short idle delay, show video
  const [heroDecoded, setHeroDecoded] = useState(false);
  const [mobileVideoVisible, setMobileVideoVisible] = useState(false);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isMobile || !heroDecoded) return;
    const t = setTimeout(() => setMobileVideoVisible(true), 600); // gentle idle-like delay
    return () => clearTimeout(t);
  }, [isMobile, heroDecoded]);

  // Localized copy + section config
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

  // helper for mobile gap calc (avoids SSR window access)
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
        {/* Splash logo */}
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

        {/* Intro overlay */}
        <AnimatePresence>
          {introStarted && (
            <m.div
              key="overlay"
              className="fixed inset-0 z-40 not-italic"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: TIMING.crossfadeSec, ease: [0.19, 1, 0.22, 1] } }}
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
                      <div className="absolute bottom-0 left-0 w-full h-full bg-[#e7eae1] rounded-full loader-vert" />
                    </div>
                  </div>
                  {/* Desktop percent bar */}
                  <IntroBarFixed />
                </m.div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <main
          className="fixed inset-0 z-10 flex flex-col items-center justify-start md:justify-center bg-(--olivea-cream) transition-opacity duration-300 not-italic"
          style={{ opacity: revealMain ? 1 : 0 }}
        >
          <div
            ref={heroBoxRef}
            className="relative overflow-hidden shadow-xl mt-1 md:mt-0 bg-(--olivea-olive) not-italic"
            style={{
              width: "98vw",
              height: isMobile ? `${HERO.vh}vh` : "98vh",
              borderRadius: "1.5rem",
              marginBottom: isMobile ? -HERO.overlapPx : 0,
            }}
          >
            {/* MOBILE: paint hero image immediately; demote overlay when decoded */}
            {isMobile && !showVideo && (
              <Image
                src="/images/hero-mobile.avif"
                alt={isES ? "OLIVEA La Experiencia" : "OLIVEA The Experience"}
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
                  setHeroDecoded(true);
                  setOverlayGone?.(true);
                  if (typeof document !== "undefined") document.body.classList.add("lcp-demote");
                }}
              />
            )}

            {/* MOBILE VIDEO: show after hero decode + small delay (or if hook wants it) */}
            {isMobile && (showVideo || mobileVideoVisible) && (
              <video
                ref={mobileVideoRef}
                className="absolute inset-0 w-full h-full object-cover [--video-brightness:0.96] brightness-(--video-brightness) pointer-events-none md:hidden"
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"          // more reliable for iOS autoplay than "none"
                poster="/images/hero-mobile.avif"
                aria-hidden
                tabIndex={-1}
                disablePictureInPicture
                controls={false}
                onLoadedData={() => {
                  // nudge playback on iOS if needed
                  try { mobileVideoRef.current?.play(); } catch {}
                }}
              >
                <source src="/videos/homepage-mobile.webm" type="video/webm" />
                <source src="/videos/homepage-mobile.mp4" type="video/mp4" />
              </video>
            )}

            {/* DESKTOP: paint image under the video for instant LCP */}
            {!isMobile && (
              <>
                <Image
                  src="/images/hero.avif"
                  alt={isES ? "OLIVEA La Experiencia" : "OLIVEA The Experience"}
                  fill
                  priority
                  fetchPriority="high"
                  decoding="async"
                  loading="eager"
                  sizes="98vw"
                  quality={70}
                  placeholder="blur"
                  blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACw="
                  className="object-cover"
                  onLoadingComplete={() => {
                    if (typeof document !== "undefined") document.body.classList.add("lcp-demote");
                  }}
                />
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover [--video-brightness:0.96] brightness-(--video-brightness) pointer-events-none"
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
              </>
            )}

            {/* Mobile title after overlay */}
            <m.div
              className="absolute inset-0 md:hidden z-30 flex items-center justify-center pointer-events-none"
              variants={itemVariants}
              initial="hidden"
              animate={overlayGone ? "show" : "hidden"}
            >
              <span
                className={`${cormHero.className} italic text-(--olivea-mist) text-lg tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] text-center`}
              >
                {isES ? "OLIVEA La Experiencia" : "OLIVEA The Experience"}
              </span>
            </m.div>

            {/* gradient */}
            <div className="absolute inset-0 z-1 pointer-events-none bg-linear-to-b from-transparent via-black/10 to-black/40 rounded-3xl" />
          </div>

          {/* Mobile cards + button */}
          <m.div
            className="relative z-10 flex flex-col md:hidden flex-1 w-full px-4"
            variants={containerVariants}
            initial="hidden"
            animate={introStarted ? "hidden" : "show"}
            style={{ paddingTop: isMobile ? HERO.overlapPx + extraGap : 0 }}
          >
            {/* Give extra bottom padding so the fixed bar never covers content */}
            <div className="space-y-12 pb-[120px]">
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
          </m.div>

          {/* FIXED bottom bar (mobile only) — always glued to the bottom */}
          <div
            className="
              fixed bottom-0 left-0 right-0 md:hidden z-40
              px-4
              pt-3
              pb-[max(env(safe-area-inset-bottom),16px)]
              bg-linear-to-t from-(--olivea-cream)/95 to-transparent
              backdrop-blur-sm
            "
          >
            <ReservationButton />
          </div>

          {/* Desktop flow (unchanged) */}
          <div className="absolute inset-0 hidden md:flex flex-col items-center z-40">
            <div
              ref={logoTargetRef}
              className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none"
            >
              <OliveaLogo className="w-full h-full" />
            </div>

            <span
              className={`${cormHero.className} italic mt-3 text-(--olivea-mist) text-2xl lg:text-[26px] tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] pointer-events-none`}
            >
              {isES ? "OLIVEA La Experiencia" : "OLIVEA The Experience"}
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
