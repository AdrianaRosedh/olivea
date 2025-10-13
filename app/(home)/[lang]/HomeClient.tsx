// app/(home)/[lang]/HomeClient.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
  type CSSProperties,
} from "react";
import { watchLCP } from "@/lib/perf/watchLCP";
import { AnimatePresence, motion, useAnimation, type Variants } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { corm } from "@/app/fonts";
import ReservationButton from "@components/ui/ReservationButton";
import type { SectionKey } from "@/contexts/SharedTransitionContext";
import CasaLogo from "@/assets/alebrije-2.svg";
import FarmLogo from "@/assets/alebrije-1-Green.svg";
import CafeLogo from "@/assets/alebrije-3.svg";
import OliveaLogo from "@/assets/alebrije-1.svg";
import InlineEntranceCard from "@/components/ui/InlineEntranceCard";

type WithBarVar = CSSProperties & { "--bar-duration"?: string };

/* ===========================
   Timing — speed up first paint
   =========================== */
const TIMING = { introHoldMs: 60, morphSec: 0.6, settleMs: 120, crossfadeSec: 0.22 } as const;
const SPLASH = { holdMs: 240, afterCrossfadeMs: 120, fadeOutSec: 0.24, bobSec: 2.0 } as const;

/* ===========================
   requestIdleCallback shim
   =========================== */
export {};
declare global {
  interface Window {
    requestIdleCallback: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback: (handle: number) => void;
  }
}

function runWhenIdle(cb: () => void, timeout = 800) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    setTimeout(cb, 300);
  }
}

function LazyShow({
  children,
  minHeight = 1,
  rootMargin = "600px 0px 600px 0px",
}: {
  children: React.ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return <div ref={ref} style={!show ? { minHeight } : undefined}>{show ? children : null}</div>;
}

/* ===========================
   Spacing controls
   =========================== */
export const HERO = {
  vh: 29,
  overlapPx: 10,
  minGapPx: 25,
  baseVh: 26,
  baseGapPx: 20,
} as const;

const vhPx =
  typeof window !== "undefined"
    ? (window.visualViewport?.height ?? window.innerHeight) / 100
    : 8;

const HERO_EXTRA_GAP_PX = Math.max(
  HERO.minGapPx,
  Math.round(HERO.baseGapPx - (HERO.vh - HERO.baseVh) * vhPx)
);

/* ===========================
   Desktop loader (percent bar)
   =========================== */
function IntroBarFixed() {
  const percentRef = useRef<HTMLSpanElement>(null);
  const barBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const duration = isMobile ? 1800 : 3500;
    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = Math.min(now - t0, duration);
      const pct = Math.floor((elapsed / duration) * 100);
      if (percentRef.current) percentRef.current.textContent = `${pct}%`;
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    barBoxRef.current?.style.setProperty("--bar-duration", `${duration / 1000}s`);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed bottom-20 left-12 right-12 hidden md:flex items-center z-50 text-[#e2be8f] text-xl font-semibold pointer-events-auto select-none">
      <span>Donde el Huerto es la Esencia</span>
      <div
        ref={barBoxRef}
        className="flex-1 h-2 rounded-full mx-6 relative overflow-hidden"
        style={{ backgroundColor: "#e2be8f20" }}
      >
        <div className="loader-bar bg-[#e2be8f]" />
      </div>
      <span ref={percentRef}>0%</span>
    </div>
  );
}

/* Animated line-draw logo (splash) */
const AlebrijeDraw = dynamic(() => import("@/components/animations/AlebrijeDraw"), {
  ssr: false,
  loading: () => null,
});

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.3, staggerChildren: 0.2 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HomeClient() {
  useEffect(() => { watchLCP(); }, []);
  const overlayControls = useAnimation();
  const innerScaleControls = useAnimation();
  const logoControls = useAnimation();
  const logoBobControls = useAnimation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const heroBoxRef = useRef<HTMLDivElement>(null);
  const logoTargetRef = useRef<HTMLDivElement>(null);

  // states
  const [showLoader, setShowLoader] = useState(true);
  const [revealMain, setRevealMain] = useState(false);      // fades main in (under overlay)
  const [introStarted, setIntroStarted] = useState(true);   // mount overlay immediately
  const [overlayGone, setOverlayGone] = useState(false);

  const [allowLoader, setAllowLoader] = useState(false);

  useEffect(() => {
    type IdleId = number;
    let ricId: IdleId | null = null;
    let toId: ReturnType<typeof setTimeout> | null = null;

    if ("requestIdleCallback" in window) {
      ricId = window.requestIdleCallback(() => setAllowLoader(true), { timeout: 800 });
    } else {
      toId = setTimeout(() => setAllowLoader(true), 300);
    }
    return () => {
      if (ricId !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(ricId);
      if (toId !== null) clearTimeout(toId);
    };
  }, []);

  // overlay tint + video gating
  const overlayBg = "var(--olivea-olive)";
  const [showVideo, setShowVideo] = useState<boolean>(false);

  // LCP base fade controller (for FixedLCP)
  const [hideBase, setHideBase] = useState(false);

  function waitNextFrame() {
    return new Promise<void>((r) => requestAnimationFrame(() => r()));
  }

  const [isMobileMain, setIsMobileMain] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  const [internalReturn, setInternalReturn] = useState(false);

  useEffect(() => {
    const viaLogo = sessionStorage.getItem("olivea:returning") === "1";
    if (viaLogo) {
      setInternalReturn(true);
      sessionStorage.removeItem("olivea:returning");
    } else {
      const prev = sessionStorage.getItem("prevPath");
      const internal =
        !!prev &&
        (prev.startsWith("/es") ||
          prev.startsWith("/en") ||
          prev.startsWith("/casa") ||
          prev.startsWith("/farmtotable") ||
          prev.startsWith("/cafe"));
      setInternalReturn(internal);
    }
    document.body.classList.remove("lcp-demote");
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      logoBobControls.start(
        mq.matches
          ? { y: 0, transition: { duration: 0 } }
          : { y: [0, -6, 0], transition: { duration: SPLASH.bobSec, repeat: Infinity, ease: "easeInOut" } }
      );
    };
    apply();
    mq.addEventListener?.("change", apply);
    mq.addListener?.(apply);
    return () => {
      mq.removeEventListener?.("change", apply);
      mq.removeListener?.(apply);
    };
  }, [logoBobControls]);

  useEffect(() => {
    let raf = 0;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobileMain(mq.matches));
    };
    update();
    mq.addEventListener?.("change", update);
    mq.addListener?.(update);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener?.("change", update);
      mq.removeListener?.(update);
    };
  }, []);

  const pathname = usePathname();
  const isES = pathname?.startsWith("/es");
  const base = isES ? "/es" : "/en";

  // Reveal main ASAP so hero can paint under overlay (becomes LCP)
  useEffect(() => {
    setRevealMain(true);
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event("olivea:bg-ready"));
    });
  }, []);

  useEffect(() => {
    if (!revealMain) return;
    queueMicrotask(() => setShowVideo(true));
  }, [revealMain]);

  const descs = isES
    ? { casa: "Un hogar donde puedes quedarte.", farm: "Un jardín del que puedes comer.", cafe: "Despierta con sabor." }
    : { casa: "A home you can stay in.", farm: "A garden you can eat from.", cafe: "Wake up with flavor." };

  const sections: Array<{
    href: string;
    title: string;
    description: string;
    Logo: ComponentType<SVGProps<SVGSVGElement>>;
    sectionKey: SectionKey;
  }> = [
    { href: `${base}/casa`,        title: "Casa Olivea",           description: descs.casa, Logo: CasaLogo, sectionKey: "casa" },
    { href: `${base}/farmtotable`, title: "Olivea Farm To Table",  description: descs.farm, Logo: FarmLogo, sectionKey: "farmtotable" },
    { href: `${base}/cafe`,        title: "Olivea Café",           description: descs.cafe, Logo: CafeLogo, sectionKey: "cafe" },
  ];

  const mobileSections = isMobileMain ? [sections[1], sections[0], sections[2]] : sections;

  /* ------------------------------------------------------------------
     Gate removal of the FixedLCP layer
  -------------------------------------------------------------------*/
  useEffect(() => {
    let lcpSeen = false, bgReady = false, minHold = false, done = false;
    const routeT0 = performance.now();

    const minTimer   = setTimeout(() => { minHold = true; maybeDemote(); }, 300);
    const safetyCap  = setTimeout(() => { bgReady  = true; maybeDemote(); }, 1500);

    const onBgReady = () => { bgReady = true; maybeDemote(); };
    document.addEventListener("olivea:bg-ready", onBgReady, { once: true });

    let po: PerformanceObserver | null = null;
    type POStatic = typeof PerformanceObserver & { supportedEntryTypes?: ReadonlyArray<string> };
    const supportsLCP =
      "PerformanceObserver" in window &&
      Array.isArray((PerformanceObserver as unknown as POStatic).supportedEntryTypes) &&
      (PerformanceObserver as unknown as POStatic).supportedEntryTypes!.includes("largest-contentful-paint");

    const lcpBackupTimer = setTimeout(() => {
      if (!lcpSeen) { lcpSeen = true; maybeDemote(); }
    }, 1200);

    try {
      if (supportsLCP) {
        po = new PerformanceObserver((list) => {
          const fresh = list.getEntries().some(e => e.startTime >= routeT0 - 50);
          if (fresh) { lcpSeen = true; maybeDemote(); }
        });
        po.observe({ type: "largest-contentful-paint", buffered: true });
      } else {
        lcpSeen = true; maybeDemote();
      }
    } catch {
      lcpSeen = true; maybeDemote();
    }

    function maybeDemote() {
      if (done) return;
      if (internalReturn && !introStarted) return;
      if (lcpSeen && bgReady && minHold) {
        done = true;
        const el = document.querySelector<HTMLElement>(".fixed-lcp");
        if (el) {
          el.style.willChange = "opacity";
          el.addEventListener("transitionend", () => { el.style.willChange = ""; }, { once: true });
        }
        setHideBase(true);
        document.body.classList.add("lcp-demote");

        po?.disconnect();
        clearTimeout(minTimer);
        clearTimeout(safetyCap);
        clearTimeout(lcpBackupTimer);
        document.removeEventListener("olivea:bg-ready", onBgReady);
      }
    }

    return () => {
      po?.disconnect();
      clearTimeout(minTimer);
      clearTimeout(safetyCap);
      clearTimeout(lcpBackupTimer);
      document.removeEventListener("olivea:bg-ready", onBgReady);
    };
  }, [internalReturn, introStarted]);

  /* ---------- Intro choreography (now overlay starts mounted) ---------- */
  useEffect(() => {
    let isCancelled = false;
    document.body.classList.add("overflow-hidden");

    const runIntro = async () => {
      try {
        await new Promise((res) => setTimeout(res, Math.max(TIMING.introHoldMs, SPLASH.holdMs)));
        if (isCancelled) return;

        const box = heroBoxRef.current;
        const logoTarget = logoTargetRef.current;
        if (!box || !logoTarget) {
          document.body.classList.remove("overflow-hidden");
          return;
        }

        // wait a short moment for metadata (desktop only meaningful)
        await Promise.race([
          new Promise<void>((res) => {
            const v = videoRef.current;
            if (v && v.readyState >= HTMLMediaElement.HAVE_METADATA) return res();
            v?.addEventListener("loadedmetadata", () => res(), { once: true });
          }),
          new Promise<void>((res) => setTimeout(res, 500)),
        ]);
        if (isCancelled) return;

        // overlay already olive + mounted; continue the sequence…
        requestAnimationFrame(() => {
          document.dispatchEvent(new Event("olivea:bg-ready"));
        });
      } catch (e) {
        console.error("Intro animation error:", e);
      } finally {
        if (!isCancelled) {
          document.body.classList.remove("overflow-hidden");
        }
      }
    };

    runIntro();
    return () => {
      isCancelled = true;
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  /* ---------- Morph sequence: AFTER base is gone AND overlay has started ---------- */
  useEffect(() => {
    if (!hideBase || !introStarted) return;

    (async () => {
      await waitNextFrame(); // ensure base fade applied

      // READ
      const rect = heroBoxRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const t = Math.max(0, rect.top);
      const l = Math.max(0, rect.left);
      const r = Math.max(0, vw - rect.right);
      const b = Math.max(0, vh - rect.bottom);
      const scaleX = rect.width / vw;
      const scaleY = rect.height / vh;
      const x = rect.left + rect.width / 2 - vw / 2;
      const y = rect.top + rect.height / 2 - vh / 2;

      // WRITE (original morph)
      await Promise.all([
        overlayControls.start({
          clipPath: `inset(${t}px ${r}px ${b}px ${l}px round 24px)`,
          transition: { duration: TIMING.morphSec, ease: "easeInOut" },
        }),
        innerScaleControls.start({
          x, y, scaleX, scaleY,
          transition: { duration: TIMING.morphSec, ease: "easeInOut" },
        }),
      ]);

      await new Promise((res) => setTimeout(res, TIMING.settleMs));
      await waitNextFrame();

      const pad = logoTargetRef.current!.getBoundingClientRect();
      logoBobControls.stop();
      await logoBobControls.start({ y: 0, transition: { duration: 0.2 } });
      await logoControls.start({
        top:  pad.top  + pad.height / 2 + window.scrollY,
        left: pad.left + pad.width  / 2 + window.scrollX,
        x: "-50%",
        y: "-50%",
        scale: pad.width / 240,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      });

      await overlayControls.start({
        opacity: 0,
        transition: { duration: TIMING.crossfadeSec, ease: "easeOut" },
      });

      setOverlayGone(true);

      await new Promise((r) => setTimeout(r, SPLASH.afterCrossfadeMs));
      logoControls.start({ opacity: 0, transition: { duration: SPLASH.fadeOutSec, ease: "easeOut" } });
      await new Promise((r) => setTimeout(r, SPLASH.fadeOutSec * 1000));

      setShowLoader(false);
      setIntroStarted(false); // allow cards
    })();
  }, [hideBase, introStarted, overlayControls, innerScaleControls, logoControls, logoBobControls]);

  /* ---------- Reliable autoplay after mount ---------- */
  useEffect(() => {
    const v = videoRef.current;
    if (!showVideo || !v) return;

    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;

    const tryPlay = () => v.play().catch(() => {});
    const onMeta = () => tryPlay();
    const onCanPlay = () => tryPlay();
    const onTouch = () => tryPlay();
    const onVisible = () => { if (!document.hidden) tryPlay(); };

    if (v.readyState >= HTMLMediaElement.HAVE_METADATA) tryPlay();

    v.addEventListener("loadedmetadata", onMeta, { once: true });
    v.addEventListener("canplay", onCanPlay, { once: true });
    window.addEventListener("touchstart", onTouch, { once: true, passive: true });
    document.addEventListener("visibilitychange", onVisible);

    const onLoadedData = () => {
      document.dispatchEvent(new Event("olivea:bg-ready"));
    };
    v.addEventListener("loadeddata", onLoadedData, { once: true });

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onLoadedData);
      window.removeEventListener("touchstart", onTouch);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [showVideo]);

  /* ---------- Attach video sources after idle / when shown ---------- */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const attach = () => {
      if (v.querySelector("source")) return;
      const make = (src: string, type: string, media?: string) => {
        const s = document.createElement("source");
        s.src = src; s.type = type; if (media) s.media = media;
        return s;
      };
      v.append(
        make("/videos/homepage-mobile.webm", "video/webm", "(max-width: 767px)"),
        make("/videos/homepage-mobile.mp4",  "video/mp4",  "(max-width: 767px)"),
        make("/videos/homepage-HD.webm",     "video/webm", "(min-width: 768px)"),
        make("/videos/homepage-HD.mp4",      "video/mp4",  "(min-width: 768px)")
      );
      v.load();
    };

    if (showVideo) attach();
    else runWhenIdle(attach, 800);
  }, [showVideo]);

  // Also emit bg-ready once the main has faded in (non-video/mobile image fallback)
  useEffect(() => {
    if (!revealMain) return;
    const id = requestAnimationFrame(() => {
      document.dispatchEvent(new Event("olivea:bg-ready"));
    });
    return () => cancelAnimationFrame(id);
  }, [revealMain]);

  const mobileLoaderStyle: WithBarVar = { "--bar-duration": "4s" };

  return (
    <>
      {/* ========== INTRO LOGO (AlebrijeDraw) — splash during intro prep ========== */}
      <AnimatePresence>
        {allowLoader && showLoader && (
          <motion.div
            key="logo"
            className="fixed z-50"
            initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
            animate={logoControls}
            style={{ width: 240, height: 240, transformOrigin: "center" }}
          >
            <motion.div animate={logoBobControls}>
              <AlebrijeDraw size={240} strokeDuration={2.8} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== INTRO OVERLAY (above base, above main) ========== */}
      <AnimatePresence>
        {introStarted && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={overlayGone ? { pointerEvents: "none" } : undefined}
          >
            <motion.div
              className="absolute inset-0 willfade"
              style={{ background: overlayBg, clipPath: "inset(0px 0px 0px 0px round 0px)" }}
              animate={overlayControls}
            >
              <motion.div
                className="absolute inset-0 willfade"
                style={{ transformOrigin: "center" }}
                initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
                animate={innerScaleControls}
              >
                {/* Mobile vertical loader bar */}
                <div className="absolute inset-0 md:hidden z-20 flex items-center justify-start pl-4 py-6 pointer-events-none select-none">
                  <div className="relative w-2 h-2/3 bg-gray-200 rounded-full overflow-hidden" style={mobileLoaderStyle}>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[#e2be8f] rounded-full loader-vert" />
                  </div>
                </div>
                <IntroBarFixed />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MAIN (under overlay) ========== */}
      <main
        className="fixed inset-0 z-10 flex flex-col items-center justify-start md:justify-center bg-[var(--olivea-cream)] transition-opacity duration-300"
        style={{ opacity: revealMain ? 1 : 0 }}
      >
        <div
          ref={heroBoxRef}
          className="relative overflow-hidden shadow-xl mt-1 md:mt-0"
          style={{
            width: "98vw",
            height: isMobileMain ? `${HERO.vh}vh` : "98vh",
            borderRadius: "1.5rem",
            marginBottom: isMobileMain ? -HERO.overlapPx : 0,
          }}
        >
          {/* MOBILE hero — make this the LCP */}
          {isMobileMain && revealMain && !showVideo && (
            <Image
              src="/images/hero-mobile.avif"
              alt={isES ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience"}
              fill
              priority               // ← LCP
              fetchPriority="high"
              sizes="98vw"
              quality={60}
              className="object-cover"
            />
          )}

          {/* DESKTOP video */}
          <video
            ref={videoRef}
            className="absolute inset-0 hidden md:block w-full h-full object-cover [--video-brightness:0.96] brightness-[var(--video-brightness)] pointer-events-none"
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            poster="/images/hero.avif"
          />

          {/* OPTIONAL: mobile hand-off video */}
          {isMobileMain && showVideo && (
            <video
              className="absolute inset-0 md:hidden w-full h-full object-cover [--video-brightness:0.96] brightness-[var(--video-brightness)] pointer-events-none"
              muted playsInline loop autoPlay preload="none"
            >
              <source src="/videos/homepage-mobile.webm" type="video/webm" />
              <source src="/videos/homepage-mobile.mp4" type="video/mp4" />
            </video>
          )}

          {/* Mobile title — show AFTER overlay is gone */}
          <motion.div
            className="absolute inset-0 md:hidden z-30 flex items-center justify-center pointer-events-none"
            variants={itemVariants}
            initial="hidden"
            animate={overlayGone ? "show" : "hidden"}
          >
            <span
              className={`${corm.className} text-[var(--olivea-mist)] text-lg italic tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] text-center`}
            >
              {isES ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience"}
            </span>
          </motion.div>

          {/* Desktop center logo + phrase */}
          <div className="absolute inset-0 hidden md:flex flex-col items-center justify-start z-30">
            <div
              ref={logoTargetRef}
              className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56"
            >
              <OliveaLogo className="w-full h-full" />
            </div>
            <span
              className={`${corm.className} mt-3 mb-6 text-[var(--olivea-mist)] text-2xl lg:text-[26px] italic tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]`}
            >
              {isES ? "OLIVEA | La Experiencia" : "OLIVEA | The Experience"}
            </span>
          </div>

          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/40 rounded-[1.5rem]" />
        </div>

        {/* Mobile cards + button */}
        <motion.div
          className="relative z-10 flex flex-col md:hidden flex-1 w-full px-4"
          variants={containerVariants}
          initial="hidden"
          animate={introStarted ? "hidden" : "show"}
          style={{ paddingTop: isMobileMain ? HERO.overlapPx + HERO_EXTRA_GAP_PX : 0 }}
        >
          <div className="space-y-12">
            {mobileSections.map((sec, i) => (
              <LazyShow key={sec.href}>
                <motion.div
                  key={sec.href}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  style={i === 0 ? { marginTop: isMobileMain ? -HERO.overlapPx : 0, position: "relative", zIndex: 20 } : undefined}
                >
                  <InlineEntranceCard
                    title={sec.title}
                    href={sec.href}
                    sectionKey={sec.sectionKey}
                    description={sec.description}
                    Logo={sec.Logo}
                    className={i === 0 ? "relative z-30" : ""}
                    onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                  />
                </motion.div>
              </LazyShow>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-auto w-full pb-6"
          >
            <ReservationButton />
          </motion.div>
        </motion.div>

        {/* Desktop cards + button */}
        <motion.div
          className="hidden md:flex absolute inset-0 z-40 flex-col items-center justify-center px-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={introStarted ? "hidden" : "show"}
        >
          <div className="flex gap-6 mt-[12vh]">
            {sections.map((sec) => (
              <motion.div key={sec.href} variants={itemVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
                <InlineEntranceCard
                  title={sec.title}
                  href={sec.href}
                  sectionKey={sec.sectionKey}
                  description={sec.description}
                  Logo={sec.Logo}
                  onActivate={() => sessionStorage.setItem("fromHomePage", "true")}
                />
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + sections.length * 0.2 }}
            className="mt-8 md:mt-16"
          >
            <ReservationButton />
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
