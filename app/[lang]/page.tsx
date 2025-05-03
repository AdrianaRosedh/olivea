"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import ReservationButton from "./ReservationButton";
import AlebrijeDraw from "@/components/animations/AlebrijeDraw";
import { EntranceCard } from "@/components/ui/EntranceCard";
import AlebrijeLogo from "@/assets/alebrije-1.svg";

export default function HomePage() {
  const overlayControls = useAnimation();
  const logoControls    = useAnimation();
  const videoRef        = useRef<HTMLVideoElement>(null);
  const logoTargetRef   = useRef<HTMLDivElement>(null);

  const [drawComplete, setDrawComplete] = useState(false);
  const [showLoader, setShowLoader]     = useState(true);
  const [revealMain, setRevealMain]     = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);

  const sections = [
    { href: "/es/casa",       label: "Casa Olivea",         desc: "A home you can stay in." },
    { href: "/es/restaurant", label: "Olivea Farm To Table", desc: "A garden you can eat from." },
    { href: "/es/cafe",       label: "Olivea Café",         desc: "Wake up with flavor." },
  ];

  useEffect(() => {
    // lock page scroll during the loader
    document.body.classList.add("overflow-hidden");

    (async () => {
      setLoaderProgress(0);

      // drive 0→20% via RAF over 1.5s
      let startTime: number | null = null;
      const DRAW_WAIT = 1500;
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const pct = Math.min(elapsed / DRAW_WAIT, 1);
        setLoaderProgress(Math.floor(pct * 20));
        if (elapsed < DRAW_WAIT) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);

      // wait for draw
      await new Promise(r => setTimeout(r, DRAW_WAIT));
      setDrawComplete(true);
      setLoaderProgress(20);

      // wait for video to load
      const vid = videoRef.current!;
      if (vid.readyState < 2) {
        await new Promise<void>(res =>
          vid.addEventListener("loadeddata", () => res(), { once: true })
        );
      }
      setLoaderProgress(40);

      // reveal the main content
      setRevealMain(true);
      document.body.classList.remove("overflow-hidden");
      setLoaderProgress(60);

      // animate overlay shrinking into the video
      const rect = vid.getBoundingClientRect();
      await overlayControls.start({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        borderRadius: "1.5rem",
        transition: { duration: 0.8, ease: "easeInOut" },
      });
      setLoaderProgress(80);

      // brief pause
      await new Promise(r => setTimeout(r, 400));

      // fly the logo into its pad
      const padRect = logoTargetRef.current!.getBoundingClientRect();
      await logoControls.start({
        top: padRect.top + padRect.height / 2 + window.scrollY,
        left: padRect.left + padRect.width / 2 + window.scrollX,
        x: "-50%", y: "-50%",
        scale: padRect.width / 240,
        transition: { type: "spring", stiffness: 200, damping: 25 }
      });
      setLoaderProgress(100);

      // fade overlay out
      await overlayControls.start({ opacity: 0, transition: { duration: 3 } });
      setLoaderProgress(100);

      setShowLoader(false);
    })();
  }, [overlayControls, logoControls]);

  return (
    <>
      {/* Loader Overlay */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="overlay"
            initial={{ top: 0, left: 0, width: "100vw", height: "100vh", opacity: 1 }}
            animate={overlayControls}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            style={{ position: "fixed", background: "var(--olivea-olive)", zIndex: 50 }}
          >
            {/* Mobile loader */}
            <div className="absolute inset-0 md:hidden flex items-center justify-start pl-4 py-6 pointer-events-none">
              <div className="relative w-2 h-2/3 …">
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-full bg-[#e2be8f] rounded-full"
                  style={{ transformOrigin: "bottom center" }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </div>
            </div>

            {/* Desktop loader */}
            <div className="absolute bottom-20 left-12 right-12 hidden md:flex items-center text-[#e2be8f] text-xl font-semibold pointer-events-none">
              <span>Donde El Corazón es el Huerto</span>
              <div className="flex-1 h-2 rounded-full mx-6 relative" style={{ backgroundColor: "#e2be8f20" }}>
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full bg-[#e2be8f]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3.5, ease: "linear" }}
                />
              </div>
              <span>{loaderProgress}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Draw */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="logo"
            initial={{ top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
            animate={logoControls}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            style={{ position: "fixed", zIndex: 100, width: 240, height: 240, transformOrigin: "center center" }}
          >
            <AlebrijeDraw
              size={240}
              strokeDuration={drawComplete ? 0 : 5}
              fillDuration={drawComplete ? 0 : 7}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (no scrolling) */}
      <main
        className={`
          fixed inset-0 flex flex-col items-center
          justify-between md:justify-center
          bg-[var(--olivea-cream)]
          transition-opacity duration-500 ease-in-out
          ${revealMain ? "opacity-100" : "opacity-0"}
        `}
      >
        {/* Video container */}
        <div
          className="relative overflow-hidden shadow-xl"
          style={{
            width: "98vw",
            height: "98vh",
            borderRadius: "1.5rem",
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem]"
            src="/videos/homepage-temp.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          {/* Logo Pad */}
          <div className="absolute inset-0 flex justify-center items-start">
            <div
              ref={logoTargetRef}
              className="relative w-24 h-24 mt-12 sm:w-36 sm:h-36 sm:mt-14 md:w-48 md:h-48 md:mt-16 lg:w-56 lg:h-56 lg:mt-20"
            >
              <AlebrijeLogo className="w-full h-full" />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 rounded-[1.5rem]" />
        </div>

        {/* Mobile menu + reserve button */}
        <div className="flex flex-col md:hidden space-y-4 items-center w-full max-w-sm px-4">
          {sections.map(sec => (
            <EntranceCard key={sec.href} {...sec} />
          ))}
          <ReservationButton />
        </div>

        {/* Desktop overlay & buttons */}
        <div className="hidden md:flex absolute inset-0 z-40 flex-col items-center justify-center px-4 text-center">
          <div className="flex gap-6 mt-6">
            {sections.map(sec => (
              <EntranceCard key={sec.href} {...sec} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-8"
          >
          <ReservationButton />
          </motion.div>
        </div>
      </main>
    </>
  );
}