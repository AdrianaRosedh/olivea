"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useAnimation, type Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import ReservationButton from "@components/ui/ReservationButton";
import type { VideoKey } from "@/contexts/SharedTransitionContext";
import CasaLogo from "@/assets/alebrije-2.svg";
import FarmLogo from "@/assets/alebrije-1-Green.svg";
import CafeLogo from "@/assets/alebrije-3.svg";
import OliveaLogo from "@/assets/alebrije-1.svg";
import InlineEntranceCard from "@/components/ui/InlineEntranceCard";

type WithBarVar = CSSProperties & { "--bar-duration"?: string };

/** Timing — matches the old green box */
const TIMING = {
  introHoldMs: 800,
  morphSec: 0.8,
  settleMs: 350,
  crossfadeSec: 0.4,
} as const;

// Run a task when the main thread is idle (or after a short timeout fallback)
function runWhenIdle(cb: () => void, timeout = 800) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    setTimeout(cb, 300);
  }
}

/* ---------------- Desktop % loader (no React re-renders while animating) ---------------- */
function IntroLoaderInside() {
  const percentRef = useRef<HTMLSpanElement>(null);
  const barBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const duration = isMobile ? 1800 : 3500; // ms

    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - t0, duration);
      const pct = Math.floor((elapsed / duration) * 100);
      if (percentRef.current) percentRef.current.textContent = `${pct}%`;
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    if (barBoxRef.current) {
      barBoxRef.current.style.setProperty("--bar-duration", `${duration / 1000}s`);
    }
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSkip = () => {
    if (percentRef.current) percentRef.current.textContent = "100%";
  };

  return (
    <div
      className="absolute bottom-20 left-12 right-12 hidden md:flex items-center text-[#e2be8f] text-xl font-semibold pointer-events-auto select-none"
      onClick={handleSkip}
      style={{ cursor: "pointer" }}
    >
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

/* ---------------- Animated Alebrije draw (smooth) ---------------- */
const AlebrijeDraw = dynamic(() => import("@/components/animations/AlebrijeDraw"), { ssr: false });

/* ---------------- Motion variants ---------------- */
const containerVariants: Variants = { hidden: {}, show: { transition: { delayChildren: 0.3, staggerChildren: 0.2 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

export default function HomeClient() {
  // Overlay morph/clip, inner scale, logo move
  const overlayControls = useAnimation();
  const innerScaleControls = useAnimation();
  const logoControls = useAnimation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const logoTargetRef = useRef<HTMLDivElement>(null);

  const [showLoader, setShowLoader] = useState(true);
  const [revealMain, setRevealMain] = useState(false);
  const [isMobileMain, setIsMobileMain] = useState(false);

  // NEW: background of the overlay (we flip this before the morph)
  const [overlayBg, setOverlayBg] = useState<string>("transparent");

  const pathname = usePathname();
  const isES = pathname?.startsWith("/es");
  const base = isES ? "/es" : "/en";

  // Play video after reveal (does not block LCP)
  useEffect(() => {
    if (!revealMain) return;
    queueMicrotask(() => videoRef.current?.play().catch(() => {}));
  }, [revealMain]);

  const descs = isES
    ? { casa: "Un hogar donde puedes quedarte.", farm: "Un jardín del que puedes comer.", cafe: "Despierta con sabor." }
    : { casa: "A home you can stay in.", farm: "A garden you can eat from.", cafe: "Wake up with flavor." };

  const sections: Array<{
    href: string;
    title: string;
    description: string;
    Logo: ComponentType<SVGProps<SVGSVGElement>>;
    videoKey: VideoKey;
  }> = [
    { href: `${base}/casa`, title: "Casa Olivea", description: descs.casa, Logo: CasaLogo, videoKey: "casa" },
    { href: `${base}/farmtotable`, title: "Olivea Farm To Table", description: descs.farm, Logo: FarmLogo, videoKey: "farmtotable" },
    { href: `${base}/cafe`, title: "Olivea Café", description: descs.cafe, Logo: CafeLogo, videoKey: "cafe" },
  ];

  /* mobile order */
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobileMain(window.innerWidth < 768));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  const mobileSections = isMobileMain ? [sections[1], sections[0], sections[2]] : sections;

  /* intro choreography */
  useEffect(() => {
    let isCancelled = false;
    document.body.classList.add("overflow-hidden");

    const runIntro = async () => {
      try {
        // 1) Full-screen, full-opacity AVIF (the SSR LCP image) — overlay is transparent
        await new Promise((res) => setTimeout(res, TIMING.introHoldMs));
        if (isCancelled) return;

        const vid = videoRef.current;
        const logoTarget = logoTargetRef.current;
        if (!vid || !logoTarget) return;

        // 2) Prepare, but don't block too long
        await Promise.race([
          new Promise<void>((res) => {
            if (vid.readyState >= HTMLMediaElement.HAVE_METADATA) return res();
            vid.addEventListener("loadedmetadata", () => res(), { once: true });
          }),
          new Promise<void>((res) => setTimeout(res, 900)),
        ]);
        if (isCancelled) return;

        // We will show main UI, but keep overlay on top for the morph
        setRevealMain(true);

        // 3) SWITCH the overlay to solid green right before the morph so the shrink is visible
        setOverlayBg("var(--olivea-olive)");
        document.body.classList.add("lcp-demote");
        await new Promise((r) => requestAnimationFrame(r)); // ensure style applies this frame

        // 4) Compute morph geometry
        const rect = vid.getBoundingClientRect();
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

        // 5) Morph (now clearly visible because overlay is green)
        await Promise.all([
          overlayControls.start({
            clipPath: `inset(${t}px ${r}px ${b}px ${l}px round 24px)`,
            transition: { duration: TIMING.morphSec, ease: "easeInOut" },
          }),
          innerScaleControls.start({
            x,
            y,
            scaleX,
            scaleY,
            transition: { duration: TIMING.morphSec, ease: "easeInOut" },
          }),
        ]);
        if (isCancelled) return;

        // 6) Settle, then logo fly
        await new Promise((res) => setTimeout(res, TIMING.settleMs));
        await new Promise((r) => requestAnimationFrame(r));

        const pad = logoTargetRef.current!.getBoundingClientRect();
        await logoControls.start({
          top: pad.top + pad.height / 2 + window.scrollY,
          left: pad.left + pad.width / 2 + window.scrollX,
          x: "-50%",
          y: "-50%",
          scale: pad.width / 240,
          transition: { type: "spring", stiffness: 200, damping: 25 },
        });
        if (isCancelled) return;

        // 7) Fade the overlay away to reveal the video
        await overlayControls.start({
          opacity: 0,
          transition: { duration: TIMING.crossfadeSec, ease: "easeOut" },
        });
      } catch (err) {
        console.error("Intro animation error:", err);
      } finally {
        if (!isCancelled) {
          setShowLoader(false);
          document.body.classList.remove("overflow-hidden");
        }
      }
    };

    runIntro();
    return () => {
      isCancelled = true;
      document.body.classList.remove("overflow-hidden");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* loop video */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      v.currentTime = 0;
      v.play().catch(() => {});
    };
    v.addEventListener("ended", onEnded);
    return () => v.removeEventListener("ended", onEnded);
  }, []);

  /* Delay adding heavy video sources so they don't compete with LCP */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const attachSources = () => {
      if (v.querySelector("source")) return; // already attached

      const make = (src: string, type: string, media?: string) => {
        const s = document.createElement("source");
        s.src = src;
        s.type = type;
        if (media) s.media = media;
        return s;
      };

      v.append(
        // mobile
        make("/videos/homepage-mobile.webm", "video/webm", "(max-width: 767px)"),
        make("/videos/homepage-mobile.mp4", "video/mp4", "(max-width: 767px)"),
        // desktop
        make("/videos/homepage-HD.webm", "video/webm", "(min-width: 768px)"),
        make("/videos/homepage-HD.mp4", "video/mp4", "(min-width: 768px)")
      );
      v.load();
    };

    runWhenIdle(attachSources, 800);
  }, []);

  const mobileLoaderStyle: WithBarVar = { "--bar-duration": "4s" };

  return (
    <>
      {/* ------------------------------ OVERLAY (transparent first; green during morph) ------------------------------ */}
      <AnimatePresence>
        {showLoader && (
          <motion.div key="overlay" className="fixed inset-0 z-40" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="absolute inset-0 willfade"
              style={{
                background: overlayBg,                // ← starts transparent, flips to green before morph
                clipPath: "inset(0px 0px 0px 0px round 0px)",
              }}
              animate={overlayControls}
            >
              <motion.div
                className="absolute inset-0 willfade"
                style={{ transformOrigin: "center" }}
                initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
                animate={innerScaleControls}
              >
                {/* Mobile vertical filler — gold grows UP */}
                <div className="absolute inset-0 md:hidden flex items-center justify-start pl-4 py-6 pointer-events-none select-none">
                  <div className="relative w-2 h-2/3 bg-gray-200 rounded-full overflow-hidden" style={mobileLoaderStyle}>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[#e2be8f] rounded-full loader-vert" />
                  </div>
                </div>

                {/* Desktop bar + % */}
                <IntroLoaderInside />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------------------- Alebrije logo ------------------------------ */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="logo"
            className="willfade"
            initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            animate={logoControls}
            style={{ position: "fixed", zIndex: 100, width: 240, height: 240, transformOrigin: "center" }}
          >
            <AlebrijeDraw size={240} strokeDuration={2.8} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --------------------------------- MAIN UI -------------------------------- */}
      <main
        className={`fixed inset-0 z-10 flex flex-col items-center justify-start md:justify-center bg-[var(--olivea-cream)] transition-opacity duration-500 ${
          revealMain ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Background video hero */}
        <div
          className="relative overflow-hidden shadow-xl mt-1 md:mt-0"
          style={{ width: "98vw", height: isMobileMain ? "30vh" : "98vh", borderRadius: "1.5rem" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover [--video-brightness:0.96] brightness-[var(--video-brightness)] pointer-events-none"
            muted
            loop
            playsInline
            preload="none"
            poster="/images/hero.avif"
          />
          {/* Mobile title over the video */}
          <motion.div
            className="absolute inset-0 md:hidden z-30 flex items-center justify-center pointer-events-none"
            variants={itemVariants}
            initial="hidden"
            animate={!showLoader ? "show" : "hidden"}
          >
            <span className="text-[var(--olivea-mist)] font-serif text-lg italic tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] text-center">
              {isES ? "OLIVEA La Experiencia" : "OLIVEA The Experience"}
            </span>
          </motion.div>

          {/* Desktop center logo + phrase */}
          <div className="absolute inset-0 hidden md:flex flex-col items-center justify-start z-30">
            <div ref={logoTargetRef} className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56">
              <OliveaLogo className="w-full h-full" />
            </div>
            <span className="mt-3 mb-6 text-[var(--olivea-mist)] font-serif text-2xl lg:text-[26px] italic tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
              {isES ? "OLIVEA La Experiencia" : "OLIVEA The Experience"}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 rounded-[1.5rem]" />
        </div>

        {/* Mobile cards + button */}
        <motion.div
          className="flex flex-col md:hidden flex-1 w-full px-4 pt-4"
          variants={containerVariants}
          initial="hidden"
          animate={!showLoader ? "show" : "hidden"}
        >
          <div className="space-y-12">
            {mobileSections.map((sec) => (
              <motion.div
                key={sec.href}
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <InlineEntranceCard
                  title={sec.title}
                  href={sec.href}
                  videoKey={sec.videoKey}
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
          animate={!showLoader ? "show" : "hidden"}
        >
          <div className="flex gap-6 mt-[12vh]">
            {sections.map((sec) => (
              <motion.div
                key={sec.href}
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <InlineEntranceCard
                  title={sec.title}
                  href={sec.href}
                  videoKey={sec.videoKey}
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
